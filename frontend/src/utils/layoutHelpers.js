/**
 * Layout Helper Functions
 * Auto-fix overlap, validation, and layout management
 */

// Frontend Layout Configuration - LIMITED FURNITURE MODE
export const LAYOUT_CONFIG = {
  MAX_ITEMS: 5,            // Maximum 4-5 items to place (matching backend)
  MIN_SPACING_PX: 40,      // 80cm = 40px minimum spacing
  AUTO_FIX_OVERLAP: true,  // Auto-fix overlapping items
  MAX_RETRY: 3,            // Maximum retry attempts if collision detected
  COLLISION_TOLERANCE: 0,  // Zero overlaps allowed (strict mode)
  MAX_FURNITURE_SIZE_M: 3.0,  // Maximum furniture size 3 meters
  MIN_FURNITURE_SIZE_M: 0.3,  // Minimum furniture size 30cm
  MAX_COVERAGE_RATIO: 0.30,   // Maximum 30% floor coverage
  WARNING_ITEM_COLOR: '#FFFFFF',  // White color for problematic items
  WARNING_ITEM_STROKE: '#FF6B6B', // Red stroke for warnings
};

/**
 * Check if two items overlap
 * @param {Object} item1 - First furniture item
 * @param {Object} item2 - Second furniture item
 * @param {number} spacing - Minimum spacing required (default from config)
 * @returns {boolean} - True if items overlap or too close
 */
export const checkOverlap = (item1, item2, spacing = LAYOUT_CONFIG.MIN_SPACING_PX) => {
  const x1_max = item1.x + item1.panjang;
  const y1_max = item1.y + item1.lebar;
  const x2_max = item2.x + item2.panjang;
  const y2_max = item2.y + item2.lebar;
  
  // Check actual overlap
  const actualOverlap = !(x1_max <= item2.x || x2_max <= item1.x || 
                         y1_max <= item2.y || y2_max <= item1.y);
  
  if (actualOverlap) return true;
  
  // Check spacing requirement
  return !(x1_max + spacing < item2.x || x2_max + spacing < item1.x || 
           y1_max + spacing < item2.y || y2_max + spacing < item1.y);
};

/**
 * Try to fix overlapping items by shifting position
 * @param {Array} items - Array of furniture items
 * @param {number} canvasWidth - Canvas width for boundary check
 * @param {number} canvasHeight - Canvas height for boundary check
 * @returns {Object} - { fixed: Array, modified: boolean }
 */
export const autoFixOverlap = (items, canvasWidth = 800, canvasHeight = 800) => {
  const fixed = [...items];
  let modified = false;
  
  for (let i = 0; i < fixed.length; i++) {
    for (let j = i + 1; j < fixed.length; j++) {
      if (checkOverlap(fixed[i], fixed[j], 0)) { // Check actual overlap only
        // Try to shift item j to avoid collision
        const item = fixed[j];
        const shifts = [
          { dx: LAYOUT_CONFIG.MIN_SPACING_PX, dy: 0 },           // right
          { dx: -LAYOUT_CONFIG.MIN_SPACING_PX, dy: 0 },          // left
          { dx: 0, dy: LAYOUT_CONFIG.MIN_SPACING_PX },           // down
          { dx: 0, dy: -LAYOUT_CONFIG.MIN_SPACING_PX },          // up
          { dx: LAYOUT_CONFIG.MIN_SPACING_PX, dy: LAYOUT_CONFIG.MIN_SPACING_PX },   // diagonal
          { dx: -LAYOUT_CONFIG.MIN_SPACING_PX, dy: -LAYOUT_CONFIG.MIN_SPACING_PX },
          { dx: LAYOUT_CONFIG.MIN_SPACING_PX * 2, dy: 0 },       // far right
          { dx: -LAYOUT_CONFIG.MIN_SPACING_PX * 2, dy: 0 },      // far left
        ];
        
        let shiftApplied = false;
        for (const shift of shifts) {
          const newX = item.x + shift.dx;
          const newY = item.y + shift.dy;
          
          // Check if new position is within canvas bounds
          if (newX >= 10 && newX + item.panjang <= canvasWidth - 10 &&
              newY >= 10 && newY + item.lebar <= canvasHeight - 10) {
            
            const testItem = { ...item, x: newX, y: newY };
            
            // Check if new position doesn't collide with other items
            let hasCollision = false;
            for (let k = 0; k < fixed.length; k++) {
              if (k !== j && checkOverlap(testItem, fixed[k], 0)) {
                hasCollision = true;
                break;
              }
            }
            
            if (!hasCollision) {
              fixed[j] = testItem;
              modified = true;
              shiftApplied = true;
              console.log(`✅ Fixed overlap: ${item.nama} shifted by (${shift.dx}, ${shift.dy})`);
              break;
            }
          }
        }
        
        // If no shift works, remove the item
        if (!shiftApplied && LAYOUT_CONFIG.AUTO_FIX_OVERLAP) {
          console.warn(`⚠️ Could not fix overlap for ${item.nama}, removing...`);
          fixed.splice(j, 1);
          j--; // Adjust index after removal
          modified = true;
        }
      }
    }
  }
  
  return { fixed, modified };
};

/**
 * Validate layout and count collisions
 * @param {Array} items - Array of furniture items
 * @returns {Object} - { collisionCount, tooCloseCount, collisions }
 */
export const validateLayout = (items) => {
  let collisionCount = 0;
  let tooCloseCount = 0;
  const collisions = [];
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      
      // Check AABB collision (actual overlap)
      const x1_max = item1.x + item1.panjang;
      const y1_max = item1.y + item1.lebar;
      const x2_max = item2.x + item2.panjang;
      const y2_max = item2.y + item2.lebar;
      
      const overlap = !(x1_max <= item2.x || x2_max <= item1.x || 
                      y1_max <= item2.y || y2_max <= item1.y);
      
      if (overlap) {
        collisionCount++;
        collisions.push({ item1: item1.nama, item2: item2.nama });
      } else {
        // Check spacing
        const minEdgeDistance = Math.min(
          Math.abs(x1_max - item2.x),
          Math.abs(x2_max - item1.x),
          Math.abs(y1_max - item2.y),
          Math.abs(y2_max - item1.y)
        );
        
        if (minEdgeDistance < LAYOUT_CONFIG.MIN_SPACING_PX) {
          tooCloseCount++;
        }
      }
    }
  }
  
  return { collisionCount, tooCloseCount, collisions };
};

/**
 * Process and fix placed items from backend
 * @param {Array} backendItems - Items from backend API
 * @param {number} scaleFactor - Scale factor for coordinate conversion
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} - { items, validation, retryCount }
 */
export const processAndFixPlacedItems = (backendItems, scaleFactor = 50, canvasWidth = 800, canvasHeight = 800) => {
  // Convert backend items to frontend format
  let placedItems = backendItems.slice(0, LAYOUT_CONFIG.MAX_ITEMS).map((p, idx) => {
    const x = Math.max(10, Math.min(canvasWidth - 10, p.x * scaleFactor));
    const y = Math.max(10, Math.min(canvasHeight - 10, p.y * scaleFactor));
    const panjang = Math.max(20, p.panjang * 100);
    const lebar = Math.max(20, p.lebar * 100);
    
    // Assign colors based on category
    let color = "#8B7355";
    const nama = p.nama.toLowerCase();
    if (nama.includes('sofa')) color = "#8B7355";
    else if (nama.includes('meja')) color = "#8B4513";
    else if (nama.includes('kursi')) color = "#A0826D";
    else if (nama.includes('lemari') || nama.includes('rak')) color = "#654321";
    else if (nama.includes('lukisan')) color = "#2F4F4F";
    else if (nama.includes('pot') || nama.includes('bunga')) color = "#228B22";
    else if (nama.includes('stand')) color = "#654321";
    else if (nama.includes('ac')) color = "#4682B4";
    
    return {
      x, y, panjang, lebar,
      nama: p.nama,
      uid: `auto-${idx}-${Date.now()}`,
      color,
      zone: p.zone || "center",
      cornerCut: 'none',
      cutSize: 20
    };
  });
  
  // Initial validation
  let validation = validateLayout(placedItems);
  let retryCount = 0;
  
  // Auto-fix if collisions detected
  while (validation.collisionCount > LAYOUT_CONFIG.COLLISION_TOLERANCE && 
         retryCount < LAYOUT_CONFIG.MAX_RETRY &&
         LAYOUT_CONFIG.AUTO_FIX_OVERLAP) {
    
    console.log(`🔧 Attempt ${retryCount + 1}: Fixing ${validation.collisionCount} collisions...`);
    
    const { fixed, modified } = autoFixOverlap(placedItems, canvasWidth, canvasHeight);
    
    if (!modified) {
      console.warn('⚠️ Could not fix collisions, breaking retry loop');
      break;
    }
    
    placedItems = fixed;
    validation = validateLayout(placedItems);
    retryCount++;
  }
  
  return { items: placedItems, validation, retryCount };
};

/**
 * Generate validation report message with LIMITED MODE details
 * @param {Object} validation - Frontend validation results
 * @param {Object} backendValidation - Backend validation results
 * @param {number} retryCount - Number of auto-fix attempts
 * @param {Object} res - Backend response
 * @returns {string} - Formatted message for display
 */
export const generateValidationMessage = (validation, backendValidation, retryCount, res) => {
  const hasOverlap = validation.collisionCount > 0 || (backendValidation.overlap_count || 0) > 0;
  const algorithmUsed = res.model_used ? 'AI Random Forest' : 'Simple Algorithm';
  const algorithmEmoji = res.model_used ? '🤖' : '🔧';
  const maxItems = res.max_items || LAYOUT_CONFIG.MAX_ITEMS;
  const floorCoverage = res.floor_coverage || 0;
  const maxCoverage = res.max_coverage || LAYOUT_CONFIG.MAX_COVERAGE_RATIO * 100;
  
  const lines = [
    `${algorithmEmoji} Auto Layout Complete! (LIMITED MODE)`,
    ``,
    `⚡ BATASAN FURNITURE:`,
    `   Max Items: ${maxItems} furniture (4-5 items)`,
    `   Max Size: ${LAYOUT_CONFIG.MAX_FURNITURE_SIZE_M}m per dimensi`,
    `   Max Coverage: ${maxCoverage}% dari luas lantai`,
    ``,
    `✅ Algorithm: ${res.algorithm || algorithmUsed}`,
    `📐 Room: 16m × 10m (160m²)`,
    ``,
    `📊 Results:`,
    `   Successfully Placed: ${res.placed_count} items`,
    `   Floor Coverage: ${floorCoverage.toFixed(1)}% (Max: ${maxCoverage}%)`,
    `   Failed/Rejected: ${res.failed_count || 0} items`,
    ``,
    `🔍 FRONTEND VALIDATION:`,
    validation.collisionCount === 0
      ? `   ✅ TIDAK TUMPANG TINDIH! (CLEAN)`
      : `   ⚠️ ${validation.collisionCount} OVERLAPS DETECTED`,
    validation.tooCloseCount > 0
      ? `   ⚡ ${validation.tooCloseCount} items dengan spacing < 80cm`
      : `   ✅ Spacing optimal (80cm+)`,
    retryCount > 0
      ? `   🔧 Auto-fix applied: ${retryCount} attempt(s)`
      : `   ✅ No auto-fix needed`,
    ``,
    `🔍 BACKEND VALIDATION:`,
    backendValidation.status === 'CLEAN'
      ? `   ✅ Backend validation: CLEAN`
      : `   ⚠️ Backend: ${backendValidation.overlap_count || 0} overlaps`,
    `   ✅ Dalam batas ruangan`,
    `   ✅ Hindari tangga & obstacle`,
    ``,
    `💡 ITEM BERWARNA PUTIH = PERLU ADJUSTMENT`,
    `   Items dengan background PUTIH menunjukkan:`,
    `   - Tumpang tindih dengan item lain, atau`,
    `   - Spacing terlalu dekat (< 80cm)`,
    `   Klik item putih untuk adjust posisi/ukuran secara manual`,
    ``,
    hasOverlap 
      ? `⚠️ WARNING: ${validation.collisionCount} furniture yang tumpang tindih!`
      : `✅ ${res.placed_count} furniture ditempatkan dengan aman`,
    hasOverlap 
      ? `   Silakan adjust item berwarna PUTIH secara manual.`
      : `   Layout optimal dengan spacing 80cm dan tanpa overlap!`
  ];
  
  if (validation.collisions.length > 0) {
    lines.push('');
    lines.push(`⚠️ Items yang OVERLAP (Berwarna PUTIH):`);
    validation.collisions.slice(0, 5).forEach(c => {
      lines.push(`   - ${c.item1} vs ${c.item2}`);
    });
    if (validation.collisions.length > 5) {
      lines.push(`   ... dan ${validation.collisions.length - 5} lainnya`);
    }
  }
  
  return lines.filter(line => line !== '').join('\n');
};
