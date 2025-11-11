import React, { useState, useContext, useEffect } from 'react';
import { CMSContext } from '../../contexts/CMSContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { cmsApi } from '../../services/cmsApi';
import '../../styles/AdminDashboard.css';

function AdminDashboard() {
  const { content, refreshContent } = useContext(CMSContext);
  const { theme, refreshTheme } = useContext(ThemeContext);

  const [activeSection, setActiveSection] = useState('homepage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editData, setEditData] = useState({});
  const [editTheme, setEditTheme] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEWS STATE
  const [newsList, setNewsList] = useState([]);
  const [newArticle, setNewArticle] = useState({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Q&A STATE
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answeredBy, setAnsweredBy] = useState('Admin');
  const [qnaFilter, setQnaFilter] = useState('all'); // all, pending, answered

  /* ===============================
     AUTH HANDLING
  =============================== */
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  /* ===============================
     NEWS HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'news') loadNews();
  }, [isAuthenticated, activeSection]);

  const loadNews = async () => {
    const res = await cmsApi.getNews();
    if (res.status === 'success') setNewsList(res.news);
  };

  /* ===============================
     Q&A HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'qna') loadQuestions();
  }, [isAuthenticated, activeSection]);

  const loadQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions/all');
      const data = await response.json();
      if (data.status === 'success') {
        setQuestionsList(data.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleAnswerQuestion = async (question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
    setAnsweredBy(question.answered_by || 'Admin');
  };

  const submitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      setMessage({ text: 'Please provide an answer', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/questions/${selectedQuestion.id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText, answered_by: answeredBy })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ text: 'Question answered successfully!', type: 'success' });
        setSelectedQuestion(null);
        setAnswerText('');
        loadQuestions();
      } else {
        setMessage({ text: data.message || 'Failed to answer question', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to submit answer', type: 'error' });
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ text: 'Question deleted successfully', type: 'success' });
        loadQuestions();
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete question', type: 'error' });
    }
  };

  const filteredQuestions = qnaFilter === 'all' 
    ? questionsList 
    : questionsList.filter(q => q.status === qnaFilter);

  /* ===============================
     IMAGE UPLOAD HANDLER
  =============================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File terlalu besar! Maksimal 5MB', type: 'error' });
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Format file tidak valid! Gunakan PNG, JPG, GIF, atau WebP', type: 'error' });
      return;
    }

    setUploadingImage(true);
    setMessage({ text: 'Mengupload gambar...', type: 'info' });

    try {
      const res = await cmsApi.uploadNewsImage(file);
      if (res.status === 'success') {
        setNewArticle({ ...newArticle, image: res.image_url });
        setMessage({ text: 'Gambar berhasil diupload!', type: 'success' });
      } else {
        setMessage({ text: res.message || 'Gagal upload gambar', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error saat upload gambar', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  /* ===============================
     LOGIN HANDLER
  =============================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await cmsApi.login(loginForm.username, loginForm.password);
      if (result.status === 'success') {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAuthenticated', 'true');
        setMessage({ text: 'Login successful!', type: 'success' });
        refreshContent();
        refreshTheme();
      } else {
        setMessage({ text: result.message || 'Invalid credentials', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOGOUT HANDLER
  =============================== */
  const handleLogout = async () => {
    await cmsApi.logout();
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setMessage({ text: 'Logged out successfully', type: 'success' });
  };

  /* ===============================
     SAVE HANDLER
  =============================== */
  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let result;

      if (activeSection === 'theme') {
        const themeToSave = editTheme || theme || {};
        result = await cmsApi.updateTheme(themeToSave);
        if (result.status === 'success') await refreshTheme();
      } else if (activeSection === 'homepage') {
        // Save all home page sections
        const sectionsToSave = ['hero', 'virtualTour', 'services', 'advantages'];
        let allSuccess = true;
        
        for (const section of sectionsToSave) {
          const dataToSave = editData[section] || content[section] || {};
          const res = await cmsApi.updateContent(section, dataToSave);
          if (res.status !== 'success') {
            allSuccess = false;
            break;
          }
        }
        
        if (allSuccess) {
          await refreshContent();
          result = { status: 'success' };
        } else {
          result = { status: 'error' };
        }
      } else {
        const dataToSave = editData[activeSection] || content[activeSection] || {};
        result = await cmsApi.updateContent(activeSection, dataToSave);
        if (result.status === 'success') await refreshContent();
      }

      setMessage({
        text: result.status === 'success'
          ? 'Changes saved successfully!'
          : 'Failed to save changes',
        type: result.status === 'success' ? 'success' : 'error',
      });

      if (result.status === 'success') {
        setEditData({});
        setEditTheme(null);
      }
    } catch (error) {
      setMessage({ text: 'Error saving changes: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INPUT HANDLER
  =============================== */
  const handleInputChange = (path, value) => {
    const newData = { ...editData };
    if (!newData[activeSection]) {
      const sectionContent = content[activeSection] || {};
      newData[activeSection] = JSON.parse(JSON.stringify(sectionContent));
    }
    const keys = path.split('.');
    let current = newData[activeSection];
    for (let i = 0; i < keys.length - 1; i++) {
      if (Array.isArray(current)) current = current[parseInt(keys[i])];
      else current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditData(newData);
  };

  /* ===============================
     LOGIN PAGE
  =============================== */
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="login-hint">
            <small>Default credentials: admin / admin123</small>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     DASHBOARD MAIN VIEW
  =============================== */
  if (!content || !theme) {
    return <div className="loading-page">Loading dashboard...</div>;
  }

  const currentContent = editData[activeSection] || content[activeSection] || {};
  const currentTheme = editTheme || theme || {};

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>CMS Dashboard</h2>
        <ul className="section-list">
          {[
            { key: 'homepage', label: 'Home Page Content' },
            { key: 'about', label: 'About Page' },
            { key: 'contact', label: 'Contact Page' },
            { key: 'faq', label: 'FAQ Management' },
            { key: 'qna', label: 'Q&A Management' },
            { key: 'news', label: 'News Management' },
            { key: 'theme', label: 'Theme Editor' },
          ].map(({ key, label }) => (
            <li
              key={key}
              className={activeSection === key ? 'active' : ''}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </aside>

      {/* CONTENT AREA */}
      <main className="admin-content">
        <div className="content-header">
          <h1>Edit {activeSection === 'homepage' ? 'Home Page Content' : activeSection}</h1>
          {activeSection !== 'news' && activeSection !== 'qna' && (
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        {/* ================= HOME PAGE CONTENT (COMBINED) ================= */}
        {activeSection === 'homepage' && (
          <>
            {/* HERO SECTION */}
            <section className="admin-section">
              <h2>Hero Section</h2>
              {content.hero && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={(editData.hero || content.hero).title || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.hero) {
                          newData.hero = { ...content.hero };
                        }
                        newData.hero.title = e.target.value;
                        setEditData(newData);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <textarea
                      value={(editData.hero || content.hero).subtitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.hero) {
                          newData.hero = { ...content.hero };
                        }
                        newData.hero.subtitle = e.target.value;
                        setEditData(newData);
                      }}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </section>

            {/* VIRTUAL TOUR SECTION */}
            <section className="admin-section">
              <h2>Virtual Tour Section</h2>
              {content.virtualTour && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={(editData.virtualTour || content.virtualTour).title || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.virtualTour) {
                          newData.virtualTour = { ...content.virtualTour };
                        }
                        newData.virtualTour.title = e.target.value;
                        setEditData(newData);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={(editData.virtualTour || content.virtualTour).description || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.virtualTour) {
                          newData.virtualTour = { ...content.virtualTour };
                        }
                        newData.virtualTour.description = e.target.value;
                        setEditData(newData);
                      }}
                      rows={5}
                    />
                  </div>
                </>
              )}
            </section>

            {/* SERVICES SECTION */}
            <section className="admin-section">
              <h2>Services Section</h2>
              {(content.services || editData.services) ? (
                <>
                  <div className="form-group">
                    <label>Main Title</label>
                    <input
                      type="text"
                      value={(editData.services || content.services)?.mainTitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.services) {
                          newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                        }
                        newData.services.mainTitle = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="Kebebasan untuk Membuat Virtual Tour yang Anda Inginkan"
                    />
                  </div>
                  <h3>Service Items</h3>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Edit the 4 service features displayed on the homepage
                  </p>
                  {(editData.services?.items || content.services?.items || []).map((item, index) => (
                    <div key={index} className="service-item-editor" style={{ 
                      background: '#1a1a1a', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Service {index + 1}</h4>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.services) {
                              newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.services.items || [])];
                            newItems[index] = { ...newItems[index], title: e.target.value };
                            newData.services.items = newItems;
                            setEditData(newData);
                          }}
                          placeholder={`Service ${index + 1} title`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={item.desc || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.services) {
                              newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.services.items || [])];
                            newItems[index] = { ...newItems[index], desc: e.target.value };
                            newData.services.items = newItems;
                            setEditData(newData);
                          }}
                          rows={4}
                          placeholder={`Service ${index + 1} description`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#999' }}>Loading services section...</p>
                </div>
              )}
            </section>

            {/* ADVANTAGES SECTION */}
            <section className="admin-section">
              <h2>Advantages Section</h2>
              {(content.advantages || editData.advantages) ? (
                <>
                  <div className="form-group">
                    <label>Label (Small Text Above Title)</label>
                    <input
                      type="text"
                      value={(editData.advantages || content.advantages)?.label || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.advantages) {
                          newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                        }
                        newData.advantages.label = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="KEUNGGULAN"
                    />
                  </div>
                  <div className="form-group">
                    <label>Main Title</label>
                    <input
                      type="text"
                      value={(editData.advantages || content.advantages)?.mainTitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.advantages) {
                          newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                        }
                        newData.advantages.mainTitle = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="Mengapa Memilih Kami?"
                    />
                  </div>
                  <h3>Advantage Items</h3>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Edit the 4 key advantages displayed on the homepage
                  </p>
                  {(editData.advantages?.items || content.advantages?.items || []).map((item, index) => (
                    <div key={index} className="advantage-item-editor" style={{ 
                      background: '#1a1a1a', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Advantage {index + 1}</h4>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.advantages) {
                              newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.advantages.items || [])];
                            newItems[index] = { ...newItems[index], title: e.target.value };
                            newData.advantages.items = newItems;
                            setEditData(newData);
                          }}
                          placeholder={`Advantage ${index + 1} title`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={item.desc || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.advantages) {
                              newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.advantages.items || [])];
                            newItems[index] = { ...newItems[index], desc: e.target.value };
                            newData.advantages.items = newItems;
                            setEditData(newData);
                          }}
                          rows={4}
                          placeholder={`Advantage ${index + 1} description`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#999' }}>Loading advantages section...</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* ================= ABOUT PAGE ================= */}
        {activeSection === 'about' && currentContent && (
          <>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={currentContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={currentContent.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
              />
            </div>
          </>
        )}

        {/* ================= CONTACT PAGE ================= */}
        {activeSection === 'contact' && currentContent && (
          <>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={currentContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={currentContent.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={currentContent.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={currentContent.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={currentContent.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}

        {/* ================= FAQ SECTION ================= */}
        {activeSection === 'faq' && (
          <>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={currentContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <textarea
                value={currentContent.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                rows={2}
              />
            </div>

            <h3>FAQ Questions</h3>
            {currentContent.questions && currentContent.questions.length > 0 ? (
              currentContent.questions.map((item, index) => (
                    <div key={item.id || index} className="faq-editor-item">
                      <div className="form-group">
                        <label>Question {index + 1}</label>
                        <input
                          type="text"
                          value={item.question || ''}
                          onChange={(e) => {
                            const newQuestions = [...currentContent.questions];
                            newQuestions[index].question = e.target.value;
                            handleInputChange('questions', newQuestions);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Answer {index + 1}</label>
                        <textarea
                          value={item.answer || ''}
                          onChange={(e) => {
                            const newQuestions = [...currentContent.questions];
                            newQuestions[index].answer = e.target.value;
                            handleInputChange('questions', newQuestions);
                          }}
                          rows={3}
                        />
                      </div>
                      <button
                        className="btn-danger"
                        onClick={() => {
                          const newQuestions = currentContent.questions.filter((_, i) => i !== index);
                          handleInputChange('questions', newQuestions);
                        }}
                      >
                        Delete Question
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">
                    <p>No FAQ questions yet. Click "Add New Question" to create one.</p>
                  </div>
                )}

                <button
                  className="btn-secondary"
                  onClick={() => {
                    const newQuestions = [...(currentContent.questions || [])];
                    const newId = newQuestions.length > 0 
                      ? Math.max(...newQuestions.map(q => q.id || 0)) + 1 
                      : 1;
                    newQuestions.push({
                      id: newId,
                      question: 'Pertanyaan baru',
                      answer: 'Jawaban baru'
                    });
                    handleInputChange('questions', newQuestions);
                  }}
                >
                  Add New Question
                </button>
          </>
        )}

        {/* ================= NEWS SECTION ================= */}
        {activeSection === 'news' && (
          <section className="news-editor">
            <h2>Manage News</h2>

            {/* FORM TAMBAH */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="teknologi">Teknologi</option>
                <option value="bisnis">Bisnis</option>
                <option value="tutorial">Tutorial</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={newArticle.author}
                onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Excerpt</label>
              <input
                type="text"
                value={newArticle.excerpt}
                onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                placeholder="Ringkasan singkat berita..."
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                rows={6}
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="Konten lengkap berita..."
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <small className="upload-status">Uploading...</small>}
              {newArticle.image && (
                <div className="image-preview">
                  <img src={newArticle.image} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => setNewArticle({ ...newArticle, image: '' })}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={async () => {
                if (!newArticle.title) {
                  setMessage({ text: 'Title wajib diisi!', type: 'error' });
                  return;
                }
                const res = await cmsApi.createNews(newArticle);
                if (res.status === 'success') {
                  setMessage({ text: 'News created successfully', type: 'success' });
                  setNewArticle({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
                  loadNews();
                } else {
                  setMessage({ text: 'Failed to create news', type: 'error' });
                }
              }}
              disabled={uploadingImage}
            >
              Add News
            </button>

            {/* LIST BERITA */}
            <h3>Existing News</h3>
            <ul className="news-list">
              {newsList.map((n) => (
                <li key={n.id} className="news-item">
                  <strong>{n.title}</strong> — {n.excerpt}
                  <div className="news-actions">
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        const res = await cmsApi.updateNews(n.id, {
                          ...n,
                          title: `${n.title} (Edited)`,
                        });
                        if (res.status === 'success') {
                          setMessage({ text: 'News updated successfully', type: 'success' });
                          loadNews();
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        const res = await cmsApi.deleteNews(n.id);
                        if (res.status === 'success') {
                          setMessage({ text: 'News deleted successfully', type: 'success' });
                          loadNews();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= THEME SECTION ================= */}
        {activeSection === 'theme' && currentTheme && (
          <>
            <section className="admin-section">
              <h2>Theme Settings</h2>
              <p style={{ color: '#cccccc', marginBottom: '2rem' }}>
                Customize the appearance of your website. Changes will be applied globally.
              </p>

              {/* NAVBAR COLOR */}
              <div className="theme-subsection">
                <h3>Navbar Settings</h3>
                
                <div className="form-group">
                  <label>Navbar Background Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={currentTheme.navbarColor || '#0a0a0a'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarColor: e.target.value })}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={currentTheme.navbarColor || '#0a0a0a'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarColor: e.target.value })}
                      className="color-text-input"
                      placeholder="#0a0a0a"
                    />
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Choose the background color for the navigation bar
                  </small>
                </div>

                <div className="form-group">
                  <label>Navbar Text Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={currentTheme.navbarTextColor || '#ffffff'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarTextColor: e.target.value })}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={currentTheme.navbarTextColor || '#ffffff'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarTextColor: e.target.value })}
                      className="color-text-input"
                      placeholder="#ffffff"
                    />
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Choose the text color for navigation links and logo
                  </small>
                </div>
              </div>

              {/* TYPOGRAPHY */}
              <div className="theme-subsection">
                <h3>Typography</h3>
                <div className="form-group">
                  <label>Font Family</label>
                  <select
                    value={currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}
                    onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                    style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                  >
                    <option value="'Inter', 'Poppins', 'Segoe UI', sans-serif">Inter / Poppins (Default)</option>
                    <option value="'Poppins', sans-serif">Poppins (Modern)</option>
                    <option value="'Inter', sans-serif">Inter (Clean)</option>
                    <option value="'Roboto', sans-serif">Roboto (Google)</option>
                    <option value="'Open Sans', sans-serif">Open Sans (Friendly)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
                    <option value="'Lato', sans-serif">Lato (Professional)</option>
                    <option value="'Raleway', sans-serif">Raleway (Elegant)</option>
                    <option value="'Nunito', sans-serif">Nunito (Rounded)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                    <option value="'Merriweather', serif">Merriweather (Classic)</option>
                    <option value="'Arial', sans-serif">Arial (System)</option>
                    <option value="'Segoe UI', sans-serif">Segoe UI (Windows)</option>
                    <option value="'Georgia', serif">Georgia (Traditional)</option>
                  </select>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Select a font that will be used across the entire website
                  </small>
                </div>

                <div className="form-group">
                  <label>Custom Font Family (Advanced)</label>
                  <input
                    type="text"
                    value={currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}
                    onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                    placeholder="e.g., 'Poppins', sans-serif"
                  />
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Enter a custom font family or Google Fonts import
                  </small>
                </div>
              </div>

              {/* PREVIEW */}
              <div className="theme-preview-box">
                <h3>Preview</h3>
                
                {/* Navbar Preview */}
                <div className="preview-navbar" style={{ 
                  background: currentTheme.navbarColor || '#0a0a0a',
                  fontFamily: currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"
                }}>
                  <div className="preview-navbar-logo" style={{
                    color: currentTheme.navbarTextColor || '#ffffff'
                  }}>
                    Virtual Tour App
                  </div>
                  <div className="preview-navbar-links">
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>Home</span>
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>About</span>
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>Contact</span>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="preview-content" style={{ 
                  fontFamily: currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"
                }}>
                  <h1>Heading 1 - Main Title</h1>
                  <h2>Heading 2 - Section Title</h2>
                  <h3>Heading 3 - Subsection</h3>
                  <p>
                    This is a preview of how your text will look with the selected font family. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <button className="preview-button">
                    Sample Button
                  </button>
                  <div className="preview-info">
                    <p><strong>Navbar Background:</strong> {currentTheme.navbarColor || '#0a0a0a'}</p>
                    <p><strong>Navbar Text:</strong> {currentTheme.navbarTextColor || '#ffffff'}</p>
                    <p><strong>Font Family:</strong> {currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ==================== Q&A MANAGEMENT SECTION ==================== */}
        {activeSection === 'qna' && (
          <>
            <div className="qna-header">
              <h2>Q&A Management</h2>
              <div className="qna-summary">
                <span className="badge badge-total">Total: {questionsList.length}</span>
                <span className="badge badge-pending">
                  Pending: {questionsList.filter(q => q.status === 'pending').length}
                </span>
                <span className="badge badge-answered">
                  Answered: {questionsList.filter(q => q.status === 'answered').length}
                </span>
              </div>
            </div>

            {/* Filter */}
            <div className="qna-filter">
              <button 
                className={`filter-btn ${qnaFilter === 'all' ? 'active' : ''}`}
                onClick={() => setQnaFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setQnaFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'answered' ? 'active' : ''}`}
                onClick={() => setQnaFilter('answered')}
              >
                Answered
              </button>
            </div>

            {/* Answer Form (when question selected) */}
            {selectedQuestion && (
              <div className="answer-form-card">
                <h3>Answer Question</h3>
                <div className="question-detail">
                  <div className="detail-row">
                    <strong>From:</strong> {selectedQuestion.name} ({selectedQuestion.email})
                  </div>
                  <div className="detail-row">
                    <strong>Date:</strong> {selectedQuestion.created_at}
                  </div>
                  <div className="detail-row">
                    <strong>Question:</strong>
                    <p className="question-text">{selectedQuestion.question}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Answer *</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label>Answered By</label>
                  <input
                    type="text"
                    value={answeredBy}
                    onChange={(e) => setAnsweredBy(e.target.value)}
                    placeholder="Admin name"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={submitAnswer}>
                    Submit Answer
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerText('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="questions-table">
              {filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Question</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className={q.status === 'pending' ? 'pending-row' : ''}>
                        <td>{q.id}</td>
                        <td>
                          <div className="user-info">
                            <strong>{q.name}</strong>
                            <small>{q.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="question-preview">
                            {q.question.substring(0, 80)}
                            {q.question.length > 80 && '...'}
                          </div>
                          {q.answer && (
                            <div className="answer-preview">
                              Answered: {q.answer.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${q.status}`}>
                            {q.status === 'pending' ? 'Pending' : 'Answered'}
                          </span>
                        </td>
                        <td>
                          <small>{q.created_at}</small>
                          {q.answered_at && (
                            <>
                              <br />
                              <small className="answered-date">
                                Answered: {q.answered_at}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-answer"
                              onClick={() => handleAnswerQuestion(q)}
                              title={q.status === 'answered' ? 'Edit answer' : 'Answer question'}
                            >
                              {q.status === 'answered' ? 'Edit' : 'Answer'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => deleteQuestion(q.id)}
                              title="Delete question"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
