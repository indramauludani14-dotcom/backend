// src/components/UnityPlayer.js
import React, { useEffect, useRef, useState } from 'react';

/**
 * UnityPlayer component
 *
 * Perbaikan & fitur:
 * - Menangani file Unity yang memiliki spasi di nama (meng-encode path).
 * - Menampilkan progress loader saat memuat build Unity.
 * - Menangani error load, dengan pesan console dan alert.
 * - Cleanup: memanggil unityInstance.Quit() dan menghapus script saat unmount.
 * - Menyediakan kontrol kecil (sendInput) agar fungsi digunakan dan ESLint tidak memperingatkan.
 *
 * Cara pakai:
 * - Letakkan folder UnityBuild di folder public: /public/UnityBuild/Build/...
 * - Pastikan file loader, data, framework, wasm ada dan path sudah benar.
 */

function UnityPlayer() {
  const canvasRef = useRef(null);
  const scriptRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // 0..1
  const [loadingError, setLoadingError] = useState(null);
  const unityInstanceRef = useRef(null);
  const [isQuitting, setIsQuitting] = useState(false);

  // Nama file yang user punya — disesuaikan. Kita encode supaya spasi aman.
  const buildFolder = `${process.env.PUBLIC_URL || ''}/UnityBuild/Build`;
  const loaderFile = `${buildFolder}/${encodeURIComponent('Virtual Tour.loader.js')}`;
  const dataFile = `${buildFolder}/${encodeURIComponent('Virtual Tour.data')}`;
  const frameworkFile = `${buildFolder}/${encodeURIComponent('Virtual Tour.framework.js')}`;
  const codeFile = `${buildFolder}/${encodeURIComponent('Virtual Tour.wasm')}`;

  // Start Unity dan load loader script
  const startUnity = () => {
    if (started) return;
    setLoadingError(null);
    setLoadingProgress(0);
    setStarted(true);

    // Jika script sudah ada (mis. reload), jangan tambahkan lagi
    if (document.getElementById('unity-loader-script')) {
      // script sudah terpasang, panggil createUnityInstance langsung jika available
      tryCreateInstance();
      return;
    }

    const script = document.createElement('script');
    script.id = 'unity-loader-script';
    script.src = loaderFile;
    script.async = true;
    scriptRef.current = script;

    script.onload = () => {
      tryCreateInstance();
    };

    script.onerror = (err) => {
      console.error('Failed to load Unity loader script:', err);
      setLoadingError('Gagal memuat file Unity loader. Periksa apakah file ada di /public/UnityBuild/Build/');
      alert('Failed to load Unity files. Please check the files are in /public/UnityBuild/Build/');
      setStarted(false);
    };

    document.body.appendChild(script);
  };

  // Fungsi untuk membuat Unity instance (dipisah supaya bisa dipanggil kembali)
  const tryCreateInstance = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not ready yet.');
      setLoadingError('Canvas tidak tersedia.');
      return;
    }

    // Pastikan fungsi createUnityInstance tersedia (didesfinisikan oleh loader script)
    if (typeof window.createUnityInstance !== 'function') {
      console.error('createUnityInstance not found on window after loader loaded.');
      setLoadingError('Unity loader tidak mengekspor createUnityInstance.');
      return;
    }

    const config = {
      dataUrl: dataFile,
      frameworkUrl: frameworkFile,
      codeUrl: codeFile,
      streamingAssetsUrl: "StreamingAssets", // optional
      // companyName, productName, productVersion bisa ditambahkan jika perlu
    };

    try {
      // createUnityInstance(canvas, config, onProgress) -> Promise(unityInstance)
      const unityInstance = await window.createUnityInstance(
        canvas,
        config,
        (progress) => {
          // progress: 0..1
          setLoadingProgress(progress);
        }
      );
      unityInstanceRef.current = unityInstance;
      // Jika ingin akses global (mis. untuk debugging)
      window.unityInstance = unityInstance;
      setLoadingProgress(1);
    } catch (err) {
      console.error('createUnityInstance failed:', err);
      setLoadingError(String(err));
      alert('Failed to initialize Unity instance: ' + err);
      setStarted(false);
    }
  };

  // Mobile touch controls state
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [isTouching, setIsTouching] = useState(false);
  const [lastInput, setLastInput] = useState('');
  
  // Mengirim input ke Unity (mis. dipanggil oleh tombol kontrol kecil)
  const sendInput = (key) => {
    if (unityInstanceRef.current && typeof window.unityInstance.SendMessage === 'function') {
      try {
        // 'Player' dan 'OnMobileInput' sesuaikan dengan nama GameObject + method di Unity
        window.unityInstance.SendMessage('Player', 'OnMobileInput', key);
      } catch (err) {
        console.warn('SendMessage ke Unity gagal:', err);
      }
    } else {
      console.warn('unityInstance belum siap atau SendMessage tidak tersedia.');
    }
  };

  // Touch handlers for mobile controls
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsTouching(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!touchStartPos || !isTouching) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    const threshold = 30; // minimum swipe distance

    // Detect swipe direction
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical swipe
      if (deltaY < -threshold) {
        sendInput('forward');
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      } else if (deltaY > threshold) {
        sendInput('back');
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      }
    } else {
      // Horizontal swipe
      if (deltaX < -threshold) {
        sendInput('left');
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      } else if (deltaX > threshold) {
        sendInput('right');
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsTouching(false);
    setTouchStartPos(null);
  };

  // Simulate keyboard input for Unity (WASD controls)
  const simulateKeyPress = (key, code, keyCode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create proper keyboard event for Unity WebGL
    const keydownEvent = new KeyboardEvent('keydown', {
      key: key,
      code: code,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    // Dispatch to document so Unity can capture it
    document.dispatchEvent(keydownEvent);
    canvas.dispatchEvent(keydownEvent);

    // Release after 150ms
    setTimeout(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(keyupEvent);
      canvas.dispatchEvent(keyupEvent);
    }, 150);
  };

  // Enhanced mobile controls with proper keyboard codes
  const handleMobileControl = (direction) => {
    // Proper key codes for Unity WebGL
    const keyMap = {
      'forward': { key: 'w', code: 'KeyW', keyCode: 87, display: '⬆️ W' },
      'back': { key: 's', code: 'KeyS', keyCode: 83, display: '⬇️ S' },
      'left': { key: 'a', code: 'KeyA', keyCode: 65, display: '⬅️ A' },
      'right': { key: 'd', code: 'KeyD', keyCode: 68, display: '➡️ D' },
      'up': { key: ' ', code: 'Space', keyCode: 32, display: '🦘 Space' },
      'interact': { key: 'e', code: 'KeyE', keyCode: 69, display: '✋ E' }
    };
    
    const keyInfo = keyMap[direction];
    if (keyInfo) {
      simulateKeyPress(keyInfo.key, keyInfo.code, keyInfo.keyCode);
      sendInput(direction); // Also try custom Unity handler
      
      // Visual feedback
      setLastInput(keyInfo.display);
      setTimeout(() => setLastInput(''), 1000);
      
      // Try multiple methods to ensure Unity receives input
      if (unityInstanceRef.current) {
        try {
          // Method 1: SendMessage (if Unity has custom handler)
          unityInstanceRef.current.SendMessage('Player', 'OnKeyPress', keyInfo.key);
        } catch (e) {
          // Ignore if GameObject not found
        }
        
        try {
          // Method 2: SendMessage with direction
          unityInstanceRef.current.SendMessage('GameController', 'OnMobileInput', direction);
        } catch (e) {
          // Ignore if GameObject not found
        }
      }
      
      console.log(`Mobile control: ${direction} (${keyInfo.code})`);
    }
  };

  // Tombol untuk menutup / quit unity instance
  const stopUnity = async () => {
    if (!unityInstanceRef.current) {
      setStarted(false);
      return;
    }
    setIsQuitting(true);
    try {
      await unityInstanceRef.current.Quit();
    } catch (err) {
      console.warn('Error saat Quit unityInstance:', err);
    } finally {
      unityInstanceRef.current = null;
      // Hapus global reference
      try { delete window.unityInstance; } catch {}
      // Hapus script loader jika ada
      const script = document.getElementById('unity-loader-script');
      if (script && script.parentNode) script.parentNode.removeChild(script);
      setStarted(false);
      setLoadingProgress(0);
      setIsQuitting(false);
    }
  };

  // Setup canvas focus for keyboard input
  useEffect(() => {
    if (started && canvasRef.current) {
      // Make canvas focusable and focus it
      const canvas = canvasRef.current;
      canvas.setAttribute('tabindex', '1');
      canvas.focus();
      
      // Re-focus canvas when clicking on it
      const handleCanvasClick = () => {
        canvas.focus();
      };
      
      canvas.addEventListener('click', handleCanvasClick);
      
      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
      };
    }
  }, [started]);

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      // jika ada instance, quit
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit().catch(() => {});
        unityInstanceRef.current = null;
      }
      // hapus script jika masih ada
      const script = document.getElementById('unity-loader-script');
      if (script && script.parentNode) script.parentNode.removeChild(script);
      try { delete window.unityInstance; } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="unity-container" style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {!started ? (
        <div className="unity-start" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>3D Virtual Tour</h2>
          <p>Experience our furniture layouts in immersive 3D</p>
          <button onClick={startUnity} className="btn-primary unity-start-btn" style={{ padding: '0.6rem 1rem' }}>
            🚀 Start Virtual Tour
          </button>
        </div>
      ) : (
        <div className="unity-player" style={{ position: 'relative' }}>
          {/* Progress / loader */}
          {loadingProgress < 1 && !loadingError && (
            <div className="unity-loader" style={{
              position: 'absolute',
              left: 0, right: 0, top: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.9)', zIndex: 10
            }}>
              <div style={{ width: '70%', maxWidth: 520, textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}>Memuat Virtual Tour... {Math.round(loadingProgress * 100)}%</div>
                <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 8 }}>
                  <div style={{
                    width: `${Math.round(loadingProgress * 100)}%`,
                    height: '100%',
                    borderRadius: 8,
                    background: '#1976d2'
                  }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  Jika loading lama, periksa: console devtools & file build di /public/UnityBuild/Build
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {loadingError && (
            <div style={{ padding: 20, background: '#ffecec', border: '1px solid #f5c2c2', borderRadius: 8 }}>
              <strong>Error:</strong>
              <div>{loadingError}</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => { setStarted(false); setLoadingError(null); }} className="btn-secondary">
                  Kembali
                </button>
              </div>
            </div>
          )}

          {/* Canvas with touch support */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', touchAction: 'none' }}
          >
            <canvas
              id="unity-canvas"
              ref={canvasRef}
              className="unity-canvas"
              style={{ 
                width: '100%', 
                height: 640, 
                background: '#000', 
                display: loadingError ? 'none' : 'block',
                touchAction: 'none'
              }}
            />
            
            {/* Touch indicator */}
            {isTouching && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                color: 'white',
                fontSize: '48px',
                opacity: 0.5,
                textShadow: '0 0 10px rgba(0,0,0,0.8)'
              }}>
                👆
              </div>
            )}
            
            {/* Last input indicator */}
            {lastInput && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(25, 118, 210, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 100
              }}>
                {lastInput}
              </div>
            )}
          </div>

          {/* Mobile-friendly controls */}
          <div style={{ marginTop: 12 }}>
            {/* D-Pad controls for mobile */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 8, 
              maxWidth: 280, 
              margin: '0 auto 12px',
              touchAction: 'manipulation'
            }}>
              <div></div>
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('forward'); }}
                onClick={() => handleMobileControl('forward')} 
                className="btn-mobile-control"
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                ⬆️
              </button>
              <div></div>
              
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('left'); }}
                onClick={() => handleMobileControl('left')} 
                className="btn-mobile-control"
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                ⬅️
              </button>
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('back'); }}
                onClick={() => handleMobileControl('back')} 
                className="btn-mobile-control"
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                ⬇️
              </button>
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('right'); }}
                onClick={() => handleMobileControl('right')} 
                className="btn-mobile-control"
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                ➡️
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('up'); }}
                onClick={() => handleMobileControl('up')} 
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  touchAction: 'manipulation'
                }}
              >
                🦘 Jump
              </button>
              <button 
                onTouchStart={(e) => { e.preventDefault(); handleMobileControl('interact'); }}
                onClick={() => handleMobileControl('interact')} 
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  touchAction: 'manipulation'
                }}
              >
                ✋ Interact
              </button>
              <button 
                onClick={stopUnity} 
                disabled={isQuitting} 
                className="btn-danger"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  touchAction: 'manipulation'
                }}
              >
                {isQuitting ? 'Quitting...' : '❌ Stop'}
              </button>
            </div>

            {/* Instructions for mobile and desktop */}
            <div style={{
              marginTop: 12,
              padding: 12,
              background: 'rgba(25, 118, 210, 0.1)',
              borderRadius: 6,
              fontSize: '0.85rem',
              textAlign: 'center',
              color: '#555'
            }}>
              <div style={{ marginBottom: 6 }}>
                💡 <strong>Mobile:</strong> Swipe pada layar atau gunakan tombol D-Pad
              </div>
              <div>
                ⌨️ <strong>Desktop/Laptop:</strong> Klik canvas lalu gunakan keyboard WASD atau arrow keys
              </div>
              {lastInput && (
                <div style={{ 
                  marginTop: 8, 
                  padding: 6, 
                  background: 'rgba(25, 118, 210, 0.2)', 
                  borderRadius: 4,
                  fontWeight: 'bold'
                }}>
                  ✅ Last input: {lastInput}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnityPlayer;
