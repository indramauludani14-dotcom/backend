import React, { useState, useEffect, useRef } from "react";
import "../styles/LayoutApp.css";
import { 
  LAYOUT_CONFIG, 
  processAndFixPlacedItems, 
  generateValidationMessage 
} from "../utils/layoutHelpers";

const API_URL = "http://localhost:5000";
const api = {
  getStatus: async () => {
    try {
      const response = await fetch(`${API_URL}/api/status`);
      return await response.json();
    } catch (error) {
      console.error('Status API error:', error);
      return { status: 'error', message: 'Backend not available' };
    }
  },
  predictLayout: async (items, roomType = "living_room", floorData = null) => {
    try {
      const response = await fetch(`${API_URL}/predict_batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items,
          room_type: roomType,
          floor_data: floorData || undefined
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Predict layout error:', error);
      throw new Error('Failed to connect to backend. Make sure Flask server is running on port 5000.');
    }
  },
};

// Floor plans based on architectural drawings (LANTAI 1-4)
// Scale: 1:100, converted to pixels (1mm = ~0.044px for 800px canvas)
// Conversion: Real dimensions in mm → scaled to fit 800x800px canvas
const defaultFloors = {
  1: {
    name: "Lantai 1",
    realDimensions: { width: 6626, height: 18105 }, // mm (3307 + 3307 = width approx, 18105 = height)
    rooms: [
      { 
        name: "Main Hall", 
        type: "living", 
        x: 60, y: 50, 
        width: 280, height: 700,
        color: "rgba(230,240,255,0.35)" 
      },
      { 
        name: "Side Room", 
        type: "living", 
        x: 360, y: 50, 
        width: 380, height: 320,
        color: "rgba(255,245,230,0.35)" 
      },
    ],
    stairs: [
      { name: "Tangga Up", x: 620, y: 80, width: 80, height: 140, direction: "up" },
    ],
    obstacles: [
      { name: "Wall Column", x: 340, y: 60, width: 15, height: 260 },
      { name: "Internal Wall", x: 60, y: 380, width: 420, height: 12 },
    ]
  },
  2: {
    name: "Lantai 2",
    realDimensions: { width: 6927, height: 13598 }, // mm from drawing
    rooms: [
      { 
        name: "Main Area", 
        type: "living", 
        x: 60, y: 60, 
        width: 340, height: 620,
        color: "rgba(240,255,240,0.35)" 
      },
      { 
        name: "Side Extension", 
        type: "office", 
        x: 420, y: 60, 
        width: 320, height: 300,
        color: "rgba(255,250,240,0.35)" 
      },
    ],
    stairs: [
      { name: "Tangga Down", x: 450, y: 380, width: 100, height: 80, direction: "down" },
      { name: "Tangga Up", x: 580, y: 380, width: 100, height: 80, direction: "up" },
      { name: "External Stair", x: 320, y: 680, width: 140, height: 80, direction: "down" },
    ],
    obstacles: [
      { name: "Column 1", x: 160, y: 180, width: 18, height: 18 },
      { name: "Column 2", x: 160, y: 380, width: 18, height: 18 },
      { name: "Column 3", x: 160, y: 540, width: 18, height: 18 },
    ]
  },
  3: {
    name: "Lantai 3",
    realDimensions: { width: 9754, height: 16943 }, // mm from drawing (7759 diagonal)
    rooms: [
      { 
        name: "Open Space", 
        type: "living", 
        x: 80, y: 80, 
        width: 640, height: 640,
        color: "rgba(245,245,255,0.35)" 
      },
    ],
    stairs: [
      { name: "Tangga Center", x: 340, y: 680, width: 120, height: 80, direction: "center" },
    ],
    obstacles: [
      { name: "Column 1", x: 200, y: 260, width: 22, height: 22 },
      { name: "Column 2", x: 580, y: 260, width: 22, height: 22 },
      { name: "Column 3", x: 200, y: 500, width: 22, height: 22 },
      { name: "Column 4", x: 580, y: 500, width: 22, height: 22 },
      { name: "Column 5", x: 400, y: 580, width: 22, height: 22 },
    ]
  },
  4: {
    name: "Lantai 4",
    realDimensions: { width: 8992, height: 18285 }, // mm from drawing
    rooms: [
      { 
        name: "Top Floor Suite", 
        type: "bedroom", 
        x: 60, y: 50, 
        width: 680, height: 700,
        color: "rgba(255,245,235,0.35)" 
      },
    ],
    stairs: [
      { name: "Tangga Down", x: 320, y: 700, width: 140, height: 80, direction: "down" },
    ],
    obstacles: [
      { name: "Column 1", x: 140, y: 350, width: 18, height: 18 },
      { name: "Column 2", x: 640, y: 350, width: 18, height: 18 },
      { name: "Entrance Notch L", x: 50, y: 50, width: 60, height: 80 },
      { name: "Entrance Notch R", x: 690, y: 50, width: 60, height: 80 },
    ]
  }
};
const furnitureList = [
  // Living Room Furniture (Ruang Tamu) - Sesuai Datasheet EXACT
  { id: 1, nama: "SOFA 3 Seat", panjang: 260, lebar: 100, category: "living", color: "#8B7355", qty: 4 },
  { id: 2, nama: "SOFA 1 Seat Besar", panjang: 115, lebar: 100, category: "living", color: "#8B7355", qty: 2 },
  { id: 3, nama: "SOFA 1 Seat Kecil", panjang: 94, lebar: 80, category: "living", color: "#A0826D", qty: 2 },
  { id: 4, nama: "Meja Lingkaran Besar", panjang: 98, lebar: 98, category: "living", color: "#8B4513", qty: 3, note: "Diameter 98cm" },
  { id: 5, nama: "Meja Lingkaran Kecil", panjang: 50, lebar: 50, category: "living", color: "#8B4513", qty: 1, note: "Diameter 50cm" },
  { id: 6, nama: "Kursi Kayu", panjang: 98, lebar: 100, category: "living", color: "#A0826D", qty: 3 },
  { id: 7, nama: "Pas Bunga Small", panjang: 36, lebar: 36, category: "decoration", color: "#228B22", qty: 1, note: "Dia 36cm" },
  { id: 8, nama: "Pas Bunga Medium", panjang: 43, lebar: 43, category: "decoration", color: "#228B22", qty: 1, note: "Dia 43cm" },
  { id: 9, nama: "Pas Bunga Large", panjang: 60, lebar: 60, category: "decoration", color: "#228B22", qty: 1, note: "Dia 60cm" },
  { id: 10, nama: "Stand Lukisan", panjang: 82, lebar: 72, category: "decoration", color: "#654321", qty: 3, note: "82x72x150cm" },
  { id: 11, nama: "Lukisan Kecil", panjang: 60, lebar: 80, category: "living", color: "#8B4513", qty: 3 },
  { id: 12, nama: "Lukisan Besar", panjang: 425, lebar: 180, category: "living", color: "#654321", qty: 1 },
  
  // Dining Room Furniture (Ruang Makan) - Sesuai Datasheet
  { id: 13, nama: "Meja Makan", panjang: 240, lebar: 100, category: "dining", color: "#8B4513", qty: 4 },
  { id: 14, nama: "Kursi Makan", panjang: 46, lebar: 75, category: "dining", color: "#A0826D", qty: 24 },
  
  // Outdoor/Pantai
  { id: 15, nama: "Kursi Pantai", panjang: 80, lebar: 200, category: "outdoor", color: "#4682B4", qty: 6 },
];

const CANVAS_WIDTH = 800, CANVAS_HEIGHT = 800;

// Draw floor plan elements (rooms, stairs, obstacles)
const drawFloorPlan = (ctx, floor) => {
  if (!floor) return;
  
  // Draw rooms
  if (floor.rooms) {
    floor.rooms.forEach(room => {
      // Room background
      ctx.fillStyle = room.color || "rgba(240,240,240,0.3)";
      ctx.fillRect(room.x, room.y, room.width, room.height);
      
      // Room border
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x, room.y, room.width, room.height);
      
      // Room label
      ctx.fillStyle = "#333";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(room.name, room.x + room.width / 2, room.y + 10);
    });
  }
  
  // Draw stairs
  if (floor.stairs) {
    floor.stairs.forEach(stair => {
      // Stair background
      ctx.fillStyle = "rgba(180,180,180,0.5)";
      ctx.fillRect(stair.x, stair.y, stair.width, stair.height);
      
      // Stair lines (parallel lines to indicate steps)
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      const numSteps = 10;
      const stepGap = stair.height / numSteps;
      for (let i = 0; i < numSteps; i++) {
        const y = stair.y + i * stepGap;
        ctx.beginPath();
        ctx.moveTo(stair.x, y);
        ctx.lineTo(stair.x + stair.width, y);
        ctx.stroke();
      }
      
      // Stair border
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.strokeRect(stair.x, stair.y, stair.width, stair.height);
      
      // Stair label with arrow
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const arrow = stair.direction === "up" ? "↑" : stair.direction === "down" ? "↓" : "↕";
      ctx.fillText(arrow, stair.x + stair.width / 2, stair.y + stair.height / 2);
    });
  }
  
  // Draw obstacles (columns, walls, etc.)
  if (floor.obstacles) {
    floor.obstacles.forEach(obstacle => {
      // Obstacle fill
      ctx.fillStyle = "#555";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Obstacle border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }
};

// Enhanced grid drawing with better visual feedback
const drawGrid = (ctx) => {
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  
  // Draw major grid lines (every 100px)
  for (let x = 0; x <= CANVAS_WIDTH; x += 100) {
    ctx.strokeStyle = x === 0 || x === CANVAS_WIDTH ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)";
    ctx.beginPath(); 
    ctx.moveTo(x, 0); 
    ctx.lineTo(x, CANVAS_HEIGHT); 
    ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += 100) {
    ctx.strokeStyle = y === 0 || y === CANVAS_HEIGHT ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)";
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(CANVAS_WIDTH, y); 
    ctx.stroke();
  }
  
  // Draw minor grid lines (every 50px)
  ctx.strokeStyle = "rgba(0,0,0,0.03)";
  for (let x = 50; x < CANVAS_WIDTH; x += 100) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
  }
  for (let y = 50; y < CANVAS_HEIGHT; y += 100) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
  }
  
  // Draw canvas border
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

// Draw a rect with optional corner cut (chamfer)
const drawRectWithCut = (ctx, x, y, w, h, cutCorner = null, cutSize = 20) => {
  if (!cutCorner || cutCorner === 'none' || cutSize <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  const cs = Math.min(cutSize, Math.min(w, h) / 3);
  ctx.moveTo(x, y);
  if (cutCorner === 'top-left') {
    ctx.moveTo(x + cs, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + cs);
    ctx.closePath();
    return;
  }
  if (cutCorner === 'top-right') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - cs, y);
    ctx.lineTo(x + w, y + cs);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    return;
  }
  if (cutCorner === 'bottom-right') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - cs);
    ctx.lineTo(x + w - cs, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    return;
  }
  if (cutCorner === 'bottom-left') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + cs, y + h);
    ctx.lineTo(x, y + h - cs);
    ctx.closePath();
    return;
  }
  ctx.rect(x, y, w, h);
};

// Enhanced furniture drawing with shadows, labels, zone indicators, and optional corner cut
const drawFurniture = (ctx, furniture, selected = false) => {
  const { x, y, panjang, lebar, nama, color, zone, cornerCut, cutSize } = furniture;
  
  // Validate coordinates to prevent NaN/Infinity errors
  if (!isFinite(x) || !isFinite(y) || !isFinite(panjang) || !isFinite(lebar)) {
    console.error('Invalid furniture coordinates:', furniture);
    return; // Skip drawing invalid furniture
  }
  
  // Ensure minimum dimensions
  const safeX = Math.max(0, x);
  const safeY = Math.max(0, y);
  const safePanjang = Math.max(10, panjang);
  const safeLebar = Math.max(10, lebar);
  
  // Draw stronger shadow for depth
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(safeX + 4, safeY + 4, safePanjang, safeLebar);
  
  // Draw furniture body with gradient
  const gradient = ctx.createLinearGradient(safeX, safeY, safeX, safeY + safeLebar);
  const baseColor = color || "#8B7355";
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(1, adjustBrightness(baseColor, -20));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  drawRectWithCut(ctx, safeX, safeY, safePanjang, safeLebar, cornerCut, cutSize || 20);
  ctx.fill();
  
  // Draw thicker border for clarity
  ctx.strokeStyle = adjustBrightness(baseColor, -40);
  ctx.lineWidth = 3;
  ctx.beginPath();
  drawRectWithCut(ctx, safeX, safeY, safePanjang, safeLebar, cornerCut, cutSize || 20);
  ctx.stroke();
  
  // Draw inner highlight
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(safeX + 3, safeY + 3, Math.max(0, safePanjang - 6), Math.max(0, safeLebar - 6));
  
  // Draw spacing indicator (subtle outline showing safe zone)
  if (!selected) {
    ctx.strokeStyle = "rgba(100,100,100,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const margin = 35; // 70cm = 35px spacing indicator
    ctx.strokeRect(
      Math.max(0, safeX - margin), 
      Math.max(0, safeY - margin), 
      safePanjang + margin * 2, 
      safeLebar + margin * 2
    );
    ctx.setLineDash([]);
  }
  
  // Draw label with better contrast
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Text background for better readability
  const labelText = nama.length > 15 ? nama.substring(0, 13) + "..." : nama;
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(
    safeX + safePanjang / 2 - textWidth / 2 - 4,
    safeY + safeLebar / 2 - 10,
    textWidth + 8,
    20
  );
  
  // Label text
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(labelText, safeX + safePanjang / 2, safeY + safeLebar / 2);
  
  // Draw dimensions below name
  ctx.font = "9px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(`${Math.round(safePanjang)}×${Math.round(safeLebar)}`, safeX + safePanjang / 2, safeY + safeLebar / 2 + 14);
  
  // Draw zone indicator badge
  if (zone) {
    const badgeX = safeX + safePanjang - 8;
    const badgeY = safeY + 8;
    const badgeSize = 24;
    
    // Badge background
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Zone text
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const zoneLabel = zone === "wall" ? "W" : zone === "center" ? "C" : zone === "corner" ? "R" : zone.charAt(0).toUpperCase();
    ctx.fillText(zoneLabel, badgeX, badgeY);
  }
  
  // Selection outline and resize handles
  if (selected) {
    ctx.strokeStyle = "#1E90FF";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(safeX - 4, safeY - 4, safePanjang + 8, safeLebar + 8);
    ctx.setLineDash([]);

    const hs = 10; // handle size (larger for easier grabbing)
    const handles = [
      [safeX, safeY], // nw
      [safeX + safePanjang, safeY], // ne
      [safeX, safeY + safeLebar], // sw
      [safeX + safePanjang, safeY + safeLebar], // se
    ];
    ctx.fillStyle = "#1E90FF";
    handles.forEach(([hx, hy]) => {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
  }
};

// Helper function to adjust color brightness
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

// House Type Templates with detailed specifications
const houseTypes = [
  {
    id: 1,
    name: "Rumah Pantai (Beach House)",
    priority: true, // Featured house type
    dimensions: { width: 12, height: 15, unit: "meter" }, // Real dimensions
    floors: 2,
    rooms: ["Living Room", "Dining Room", "Kitchen", "3 Bedrooms", "2 Bathrooms", "Terrace"],
    area: 180, // m²
    description: "Rumah pantai modern dengan desain terbuka, ventilasi maksimal, dan material tahan air laut",
    features: [
      "Material anti-korosi",
      "Ventilasi silang optimal",
      "Teras luas menghadap pantai",
      "Dapur semi-outdoor",
      "Kamar mandi dengan shower outdoor"
    ],
    style: "Tropical Modern",
    budget: "1.2M - 1.8M",
    buildTime: "6-8 bulan"
  },
  {
    id: 2,
    name: "Rumah Minimalis Modern",
    priority: false,
    dimensions: { width: 10, height: 12, unit: "meter" },
    floors: 2,
    rooms: ["Living Room", "Dining Room", "Kitchen", "3 Bedrooms", "2 Bathrooms", "Carport"],
    area: 120,
    description: "Desain minimalis dengan efisiensi ruang maksimal, cocok untuk lahan terbatas",
    features: [
      "Desain clean & modern",
      "Pencahayaan alami optimal",
      "Open plan living area",
      "Carport 1 mobil",
      "Taman depan & belakang"
    ],
    style: "Contemporary Minimalist",
    budget: "800K - 1.2M",
    buildTime: "5-7 bulan"
  },
  {
    id: 3,
    name: "Rumah Villa Bali",
    priority: false,
    dimensions: { width: 15, height: 18, unit: "meter" },
    floors: 1,
    rooms: ["Pavilion", "Living Area", "Kitchen", "2 Bedrooms", "2 Bathrooms", "Pool Area"],
    area: 200,
    description: "Villa style Bali dengan konsep indoor-outdoor, kolam renang, dan gazebo",
    features: [
      "Kolam renang private",
      "Gazebo & taman tropis",
      "Atap alang-alang",
      "Kamar tamu terpisah",
      "Joglo style pavilion"
    ],
    style: "Balinese Traditional",
    budget: "1.5M - 2.5M",
    buildTime: "8-10 bulan"
  },
  {
    id: 4,
    name: "Rumah Skandinavia",
    priority: false,
    dimensions: { width: 9, height: 11, unit: "meter" },
    floors: 2,
    rooms: ["Living Room", "Dining Area", "Kitchen", "2 Bedrooms", "1 Bathroom", "Study Room"],
    area: 99,
    description: "Konsep hygge dengan material kayu, warna netral, dan furnitur fungsional",
    features: [
      "Material kayu natural",
      "Palet warna putih & abu-abu",
      "Jendela besar",
      "Storage built-in",
      "Ruang multifungsi"
    ],
    style: "Scandinavian",
    budget: "700K - 1M",
    buildTime: "4-6 bulan"
  },
  {
    id: 5,
    name: "Rumah Industrial Loft",
    priority: false,
    dimensions: { width: 11, height: 13, unit: "meter" },
    floors: 2,
    rooms: ["Open Living Space", "Kitchen", "2 Bedrooms", "1 Bathroom", "Mezzanine"],
    area: 143,
    description: "Gaya industrial dengan plafon tinggi, exposed brick & pipe, dan open space",
    features: [
      "Plafon tinggi 4.5m",
      "Exposed concrete & brick",
      "Mezzanine floor",
      "Metal fixtures",
      "Open kitchen concept"
    ],
    style: "Industrial Urban",
    budget: "900K - 1.4M",
    buildTime: "5-7 bulan"
  },
  {
    id: 6,
    name: "Rumah Tropis Kontemporer",
    priority: false,
    dimensions: { width: 13, height: 16, unit: "meter" },
    floors: 2,
    rooms: ["Living Room", "Dining Room", "Kitchen", "4 Bedrooms", "3 Bathrooms", "Garden"],
    area: 208,
    description: "Perpaduan desain modern dengan elemen tropis, taman indoor dan ventilasi natural",
    features: [
      "Taman indoor",
      "Skylight & void",
      "Cross ventilation",
      "Water feature",
      "Green wall"
    ],
    style: "Tropical Contemporary",
    budget: "1.3M - 2M",
    buildTime: "7-9 bulan"
  }
];

export default function LayoutSimplified() {
  const [view, setView] = useState("houseTypes"); // Start with house types selection
  const [selectedHouseType, setSelectedHouseType] = useState(null);
  const [floorConfig] = useState(defaultFloors); // eslint-disable-line no-unused-vars
  const [cart, setCart] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [floorLayouts, setFloorLayouts] = useState({}); // Store layouts per floor
  const [currentFloor, setCurrentFloor] = useState(1);
  const [roomType, setRoomType] = useState("living_room");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw' | 'ne' | 'sw' | 'se'
  const [snap, setSnap] = useState(true);
  const canvasRef = useRef();
  const prevFloorRef = useRef(currentFloor);

  useEffect(() => { 
    api.getStatus().then(() => {
      // Model status loaded if needed
    }); 
  }, []);
  
  // Save and load floor layouts when switching floors
  useEffect(() => {
    const prevFloor = prevFloorRef.current;
    
    // Save previous floor's layout
    if (prevFloor !== currentFloor) {
      setFloorLayouts(prev => ({
        ...prev,
        [prevFloor]: placed
      }));
      
      // Load new floor's layout (or start empty)
      if (floorLayouts[currentFloor]) {
        setPlaced(floorLayouts[currentFloor]);
      } else {
        setPlaced([]);
      }
      
      setSelectedId(null);
      prevFloorRef.current = currentFloor;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFloor]);
  
  // Initial load of floor layout
  useEffect(() => {
    if (floorLayouts[currentFloor] && placed.length === 0) {
      setPlaced(floorLayouts[currentFloor]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorLayouts, currentFloor]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Use requestAnimationFrame to avoid flickering
    let animationFrameId;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Set background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw grid
      drawGrid(ctx);
      
      // Draw floor plan (rooms, stairs, obstacles)
      const floor = floorConfig[currentFloor];
      if (floor) {
        drawFloorPlan(ctx, floor);
      }
      
      // Draw placed furniture with enhanced rendering
      placed.forEach(furniture => {
        drawFurniture(ctx, furniture, furniture.uid === selectedId);
      });
      
      // Draw floor info overlay
      if (floor) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(10, 10, 200, 85);
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(`${floor.name}`, 20, 28);
        ctx.font = "10px Arial";
        ctx.fillText(`Real: ${floor.realDimensions.width}×${floor.realDimensions.height}mm`, 20, 45);
        ctx.fillText(`Scale: 1:100`, 20, 60);
        if (placed.length > 0) {
          ctx.fillText(`Items: ${placed.length}`, 20, 75);
          ctx.fillText(`Room: ${roomType.replace('_', ' ')}`, 20, 88);
        }
      }
    };
    
    // Render once immediately
    render();
    
    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [placed, floorConfig, currentFloor, roomType, selectedId]);

  const autoLayout = async () => {
    try {
      if (cart.length === 0) {
        alert('Cart is empty! Please add furniture first.');
        return;
      }
      
      setLoading(true);
      const res = await api.predictLayout(cart, roomType, floorConfig[currentFloor]);
      
      if (res.status === 'success' && res.data) {
        const placedItems = res.data.map((p) => {
          // Find original item from cart
          const cartItem = cart.find(c => c.id === p.id || c.name === p.nama);
          
          return {
            ...p,
            x: p.posisi_x || 100,
            y: p.posisi_y || 100,
            panjang: p.panjang || cartItem?.panjang || 100,
            lebar: p.lebar || cartItem?.lebar || 100,
            nama: p.nama || cartItem?.name || "Furniture",
            uid: `${p.id || p.nama}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
            cornerCut: 'none',
            cutSize: 20,
            color: cartItem?.color || "#8B7355",
            zone: p.zone || "center"
          };
        });
        
        setPlaced(placedItems);
        
        // Save to floor layouts
        setFloorLayouts(prev => ({
          ...prev,
          [currentFloor]: placedItems
        }));
        
        setSelectedId(null);
        
        // Enhanced success message with details
        const zoneStats = placedItems.reduce((acc, item) => {
          acc[item.zone] = (acc[item.zone] || 0) + 1;
          return acc;
        }, {});
        
        const statsMessage = Object.entries(zoneStats)
          .map(([zone, count]) => `  ${zone}: ${count} items`)
          .join('\n');
        
        alert(`Layout generated successfully!\n\n${res.total_placed} items placed\nRoom: ${res.room_type.replace('_', ' ')}\nLantai: ${currentFloor}\n\nZone Distribution:\n${statsMessage}\n\nLayout saved for this floor`);
      } else {
        alert('Layout generation failed: ' + (res.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Auto layout error:', error);
      alert(error.message + '\n\nPlease check:\n1. Flask backend is running (python app.py)\n2. Backend is accessible at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const autoPlaceAllFurniture = async () => {
    try {
      setLoading(true);
      
      // Send max items limit to backend
      const response = await fetch(`${API_URL}/api/layout/auto-place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_width: 16.0,
          room_height: 10.0,
          use_ai: true,
          max_items: LAYOUT_CONFIG.MAX_ITEMS // Limit from frontend config
        })
      });
      
      const res = await response.json();
      
      if (res.placed_items) {
        // Use helper function to process and auto-fix overlaps
        const processResult = processAndFixPlacedItems(
          res.placed_items,
          50, // SCALE_FACTOR: 800px = 16m -> 50px per meter
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        );
        
        const placedItems = processResult.items;
        const validation = processResult.validation;
        const retryCount = processResult.retryCount;
        
        // Mark items with warnings
        const itemsWithWarnings = placedItems.map((item) => {
          let hasWarning = false;
          let warningType = null;
          
          for (let other of placedItems) {
            if (other.uid !== item.uid) {
              const x1_max = item.x + item.panjang;
              const y1_max = item.y + item.lebar;
              const x2_max = other.x + other.panjang;
              const y2_max = other.y + other.lebar;
              
              const overlap = !(x1_max <= other.x || x2_max <= item.x || 
                              y1_max <= other.y || y2_max <= item.y);
              
              if (overlap) {
                hasWarning = true;
                warningType = 'collision';
                break;
              }
              
              const minDist = Math.min(
                Math.abs(x1_max - other.x),
                Math.abs(x2_max - item.x),
                Math.abs(y1_max - other.y),
                Math.abs(y2_max - item.y)
              );
              
              if (minDist < LAYOUT_CONFIG.MIN_SPACING_PX * 0.75) {
                hasWarning = true;
                warningType = 'too-close';
              }
            }
          }
          
          return {
            ...item,
            hasWarning,
            warningType,
            originalColor: item.color,
            color: hasWarning ? '#FFFFFF' : item.color,
            strokeColor: hasWarning ? '#FF6B6B' : item.color
          };
        });
        
        setPlaced(itemsWithWarnings);
        setFloorLayouts(prev => ({
          ...prev,
          [currentFloor]: itemsWithWarnings
        }));
        setSelectedId(null);
        
        // Generate message with warnings
        const backendValidation = res.validation || {};
        const validationMsg = generateValidationMessage(validation, backendValidation, retryCount, res);
        
        const warningItems = itemsWithWarnings.filter(i => i.hasWarning);
        const finalMessage = [
          validationMsg,
          '',
          warningItems.length > 0 ? 'WARNING - ITEMS DENGAN WARNING (PUTIH):' : '',
          ...warningItems.slice(0, 5).map((item, idx) => 
            `   ${idx + 1}. ${item.nama} - ${item.warningType === 'collision' ? 'OVERLAP!' : 'Terlalu dekat'}`
          ),
          warningItems.length > 5 ? `   ... dan ${warningItems.length - 5} items lainnya` : '',
          '',
          'TIP: Items berwarna PUTIH perlu di-adjust secara manual!',
          '   Klik item untuk edit posisi/ukuran.'
        ].filter(line => line !== '').join('\n');
        
        alert(finalMessage);
      } else {
        alert('Auto placement failed: ' + (res.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Auto place all error:', error);
      alert('Failed to auto-place furniture. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Helpers for interaction
  const findItemAt = (x, y) => {
    // search from topmost (last drawn)
    for (let i = placed.length - 1; i >= 0; i--) {
      const f = placed[i];
      if (x >= f.x && y >= f.y && x <= f.x + f.panjang && y <= f.y + f.lebar) {
        return f;
      }
    }
    return null;
  };

  const getHandleAt = (f, x, y) => {
    const hs = 10;
    const handles = {
      nw: { x: f.x, y: f.y },
      ne: { x: f.x + f.panjang, y: f.y },
      sw: { x: f.x, y: f.y + f.lebar },
      se: { x: f.x + f.panjang, y: f.y + f.lebar },
    };
    for (const [key, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) <= hs && Math.abs(y - pos.y) <= hs) return key;
    }
    return null;
  };

  const snapVal = (v, step = 10) => (snap ? Math.round(v / step) * step : v);

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const f = findItemAt(mx, my);
    if (f) {
      setSelectedId(f.uid);
      const handle = getHandleAt(f, mx, my);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
      } else {
        setIsDragging(true);
        setDragOffset({ dx: mx - f.x, dy: my - f.y });
      }
    } else {
      setSelectedId(null);
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    setPlaced((prev) => prev.map((f) => {
      if (f.uid !== selectedId) return f;
      let x = f.x, y = f.y, w = f.panjang, h = f.lebar;
      if (isDragging) {
        x = snapVal(mx - dragOffset.dx);
        y = snapVal(my - dragOffset.dy);
      }
      if (isResizing && resizeHandle) {
        const minSize = 20;
        if (resizeHandle === 'se') {
          w = Math.max(minSize, snapVal(mx - f.x));
          h = Math.max(minSize, snapVal(my - f.y));
        } else if (resizeHandle === 'ne') {
          w = Math.max(minSize, snapVal(mx - f.x));
          const newY = snapVal(my);
          h = Math.max(minSize, f.y + f.lebar - newY);
          y = Math.min(f.y + f.lebar - minSize, newY);
        } else if (resizeHandle === 'sw') {
          const newX = snapVal(mx);
          w = Math.max(minSize, f.x + f.panjang - newX);
          x = Math.min(f.x + f.panjang - minSize, newX);
          h = Math.max(minSize, snapVal(my - f.y));
        } else if (resizeHandle === 'nw') {
          const newX = snapVal(mx);
          const newY = snapVal(my);
          w = Math.max(minSize, f.x + f.panjang - newX);
          h = Math.max(minSize, f.y + f.lebar - newY);
          x = Math.min(f.x + f.panjang - minSize, newX);
          y = Math.min(f.y + f.lebar - minSize, newY);
        }
      }
      return { ...f, x, y, panjang: w, lebar: h };
    }));
  };

  const onMouseUp = () => {
    // Save layout after drag or resize
    if (isDragging || isResizing) {
      setFloorLayouts(prev => ({
        ...prev,
        [currentFloor]: placed
      }));
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      c.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  const rotateSelected = () => {
    if (!selectedId) return;
    const newPlaced = placed.map(f => f.uid === selectedId ? { ...f, panjang: f.lebar, lebar: f.panjang } : f);
    setPlaced(newPlaced);
    setFloorLayouts(prev => ({
      ...prev,
      [currentFloor]: newPlaced
    }));
  };

  const updateSelectedSize = (field, value) => {
    const v = Math.max(10, Number(value) || 10);
    const newPlaced = placed.map(f => f.uid === selectedId ? { ...f, [field]: v } : f);
    setPlaced(newPlaced);
    setFloorLayouts(prev => ({
      ...prev,
      [currentFloor]: newPlaced
    }));
  };

  const updateSelectedCut = (corner) => {
    const newPlaced = placed.map(f => f.uid === selectedId ? { ...f, cornerCut: corner } : f);
    setPlaced(newPlaced);
    setFloorLayouts(prev => ({
      ...prev,
      [currentFloor]: newPlaced
    }));
  };

  const updateSelectedCutSize = (size) => {
    const v = Math.max(0, Number(size) || 0);
    const newPlaced = placed.map(f => f.uid === selectedId ? { ...f, cutSize: v } : f);
    setPlaced(newPlaced);
    setFloorLayouts(prev => ({
      ...prev,
      [currentFloor]: newPlaced
    }));
  };

  const filteredFurniture = filterCategory === "all" 
    ? furnitureList 
    : furnitureList.filter(f => f.category === filterCategory);

  const categories = [
    { value: "all", label: "All" },
    { value: "living", label: "Living" },
    { value: "dining", label: "Dining" },
    { value: "bedroom", label: "Bedroom" },
    { value: "office", label: "Office" },
    { value: "kitchen", label: "Kitchen" },
  ];

  const roomTypes = [
    { value: "living_room", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "kitchen", label: "Kitchen" },
  ];

  return (
    <div className="gpt-shell">

      {view === "houseTypes" && (
        <div className="house-types-view">
          {/* Hero Section */}
          <section className="house-hero-section">
            <div className="house-hero-content">
              <h1 className="house-hero-title">Pilih Tipe Rumah Impian Anda</h1>
              <p className="house-hero-subtitle">
                Pilih dari berbagai tipe rumah yang dirancang khusus sesuai kebutuhan dan gaya hidup Anda. 
                Dari rumah pantai modern hingga villa tropis yang elegan.
              </p>
            </div>
          </section>

          {/* Featured House Type Section */}
          {houseTypes.filter(h => h.priority).map(house => (
            <section key={house.id} className="featured-house-section">
              <div className="featured-house-container">
                <div className="featured-house-content">
                  <h2 className="featured-house-title">{house.name}</h2>
                  <span className="featured-house-badge">{house.style}</span>
                  <p className="featured-house-desc">{house.description}</p>
                  
                  <div className="featured-specs-list">
                    <div className="spec-item">
                      <div className="spec-label">Ukuran Tanah</div>
                      <div className="spec-value">{house.dimensions.width} × {house.dimensions.height} {house.dimensions.unit}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Luas Bangunan</div>
                      <div className="spec-value">{house.area} m²</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Jumlah Lantai</div>
                      <div className="spec-value">{house.floors} Lantai</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Estimasi Budget</div>
                      <div className="spec-value">{house.budget}</div>
                    </div>
                  </div>
                  
                  <button 
                    className="featured-cta-btn" 
                    onClick={() => {
                      setSelectedHouseType(house);
                      setView("orderForm");
                    }}
                  >
                    Pilih Tipe Ini →
                  </button>
                </div>
                
                <div className="featured-house-preview">
                  <div className="preview-box">
                    <div className="preview-header">
                      <span className="preview-dot"></span>
                      <span className="preview-dot"></span>
                      <span className="preview-dot"></span>
                    </div>
                    <div className="preview-content">
                      <div className="preview-info">
                        <h4>Fitur Unggulan</h4>
                        {house.features.map((feature, idx) => (
                          <div key={idx} className="preview-feature">{feature}</div>
                        ))}
                      </div>
                      <div className="preview-rooms">
                        <h4>Ruangan ({house.rooms.length})</h4>
                        {house.rooms.slice(0, 4).map((room, idx) => (
                          <div key={idx} className="preview-room">{room}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Other House Types Section */}
          <section className="other-houses-section">
            <div className="other-houses-container">
              <div className="other-houses-header">
                <h2 className="other-houses-title">Tipe Rumah Lainnya</h2>
                <p className="other-houses-subtitle">Jelajahi pilihan tipe rumah lain yang mungkin sesuai dengan kebutuhan Anda</p>
              </div>
              
              <div className="house-cards-grid">
                {houseTypes.filter(h => !h.priority).map(house => (
                  <div key={house.id} className="house-type-card">
                    <div className="house-type-header">
                      <h3 className="house-type-name">{house.name}</h3>
                      <span className="house-type-badge">{house.style}</span>
                    </div>
                    
                    <div className="house-type-specs">
                      <span className="spec-chip">{house.dimensions.width}×{house.dimensions.height}m</span>
                      <span className="spec-chip">{house.area}m²</span>
                      <span className="spec-chip">{house.floors} Lantai</span>
                    </div>
                    
                    <p className="house-type-description">{house.description}</p>
                    
                    <div className="house-type-features">
                      {house.features.slice(0, 3).map((f, idx) => (
                        <div key={idx} className="type-feature-item">{f}</div>
                      ))}
                    </div>
                    
                    <div className="house-type-footer">
                      <span className="house-type-price">{house.budget}</span>
                      <button 
                        className="house-type-btn" 
                        onClick={() => {
                          setSelectedHouseType(house);
                          setView("orderForm");
                        }}
                      >
                        Pilih Tipe Ini
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {view === "orderForm" && selectedHouseType && (
        <div className="house-detail-view">
          <div className="detail-container">
            {/* Header */}
            <div className="detail-header">
              <button className="btn-back" onClick={() => setView("houseTypes")}>
                ← Kembali ke Pilihan
              </button>
              <h2>Detail Rumah</h2>
              <p className="subtitle">Informasi lengkap tipe rumah yang Anda pilih</p>
            </div>

            {/* Main House Detail Card */}
            <div className="house-detail-card">
              <div className="detail-hero">
                <div className="hero-info">
                  <h1>{selectedHouseType.name}</h1>
                  <span className="hero-style">{selectedHouseType.style}</span>
                  <p className="hero-desc">{selectedHouseType.description}</p>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="specifications-section">
                <h3>Spesifikasi Lengkap</h3>
                <div className="specs-grid">
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Ukuran Tanah</div>
                      <div className="spec-value">{selectedHouseType.dimensions.width} × {selectedHouseType.dimensions.height} meter</div>
                    </div>
                  </div>
                  
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Luas Bangunan</div>
                      <div className="spec-value">{selectedHouseType.area} m²</div>
                    </div>
                  </div>
                  
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Jumlah Lantai</div>
                      <div className="spec-value">{selectedHouseType.floors} Lantai</div>
                    </div>
                  </div>
                  
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Estimasi Budget</div>
                      <div className="spec-value">{selectedHouseType.budget}</div>
                    </div>
                  </div>
                  
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Waktu Pembangunan</div>
                      <div className="spec-value">{selectedHouseType.buildTime}</div>
                    </div>
                  </div>
                  
                  <div className="spec-card">
                    <div className="spec-content">
                      <div className="spec-label">Gaya Arsitektur</div>
                      <div className="spec-value">{selectedHouseType.style}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Section */}
              <div className="rooms-section">
                <h3>Daftar Ruangan ({selectedHouseType.rooms.length})</h3>
                <div className="rooms-grid">
                  {selectedHouseType.rooms.map((room, idx) => (
                    <div key={idx} className="room-item">
                      <span className="room-number">{idx + 1}</span>
                      <span className="room-name">{room}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <h3>Fitur Unggulan</h3>
                <div className="features-grid">
                  {selectedHouseType.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto Layout CTA */}
              <div className="auto-layout-cta">
                <div className="cta-content">
                  <div className="cta-text">
                    <h4>AI Auto Layout Furniture</h4>
                    <p>Sistem AI akan membantu menata furniture secara optimal untuk rumah Anda</p>
                  </div>
                </div>
                
                <div className="cta-actions">
                  <button 
                    className="btn primary large cta-btn"
                    onClick={() => setView('editor')}
                  >
                    <span>Mulai Design dengan AI Auto Layout</span>
                  </button>
                  
                  <button 
                    className="btn secondary large"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <span>Ke Halaman Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "editor" && (
        <>
          <div className="editor-header">
            <div>
              <h3>Editor Layout - {selectedHouseType ? selectedHouseType.name : 'Design Your Space'}</h3>
              <p className="subtitle">
                {selectedHouseType ? (
                  <>
                    <span>{selectedHouseType.area}m² • {selectedHouseType.floors} Lantai • </span>
                    <span>Pilih furniture dan gunakan Auto Layout untuk hasil optimal</span>
                  </>
                ) : (
                  'Pilih furniture dan gunakan Auto Layout untuk hasil optimal'
                )}
              </p>
            </div>
            <button className="btn secondary" onClick={() => setView("houseTypes")}>
              <span>← Ganti Tipe Rumah</span>
            </button>
          </div>

          <div className="detail">
            <div className="panel furniture-panel">
              <h4>Katalog Furnitur</h4>
              
              {/* Floor Selector */}
              <div className="floor-selector">
                <label>Pilih Lantai</label>
                <div className="floor-buttons">
                  {Object.keys(floorConfig).map(floorNum => (
                    <button
                      key={floorNum}
                      className={`floor-btn ${currentFloor === parseInt(floorNum) ? 'active' : ''}`}
                      onClick={() => setCurrentFloor(parseInt(floorNum))}
                    >
                      <span>Lantai {floorNum}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="category-filter">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    className={`filter-btn ${filterCategory === cat.value ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat.value)}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="furniture-list">
                {filteredFurniture.map((f) => (
                  <div key={f.id} className="f-card">
                    <div className="f-info">
                      <div className="f-details">
                        <span className="f-name">{f.nama}</span>
                        <span className="f-size">{f.panjang}×{f.lebar}cm</span>
                        <span className="f-category">{f.category}</span>
                      </div>
                    </div>
                    <button className="btn btn-add" onClick={() => setCart(c => [...c, f])}>
                      <span>+</span>
                    </button>
                  </div>
                ))}
              </div>
              
              {cart.length > 0 && (
                <div className="cart-summary">
                  <h5>Selected Items ({cart.length})</h5>
                  <div className="cart-items">
                    {cart.map((item, idx) => (
                      <span key={idx} className="cart-chip">
                        {item.nama}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-clear" onClick={() => setCart([])}>
                    Clear All
                  </button>
                </div>
              )}
              
              <button 
                className="btn primary btn-auto" 
                onClick={autoLayout}
                disabled={cart.length === 0 || loading}
              >
                {loading ? (
                  <span>Generating...</span>
                ) : (
                  <span>Generate Auto Layout</span>
                )}
              </button>
            </div>

            <div className="panel canvas-panel">
              <div className="canvas-header">
                <h4>Preview Layout ({CANVAS_WIDTH}×{CANVAS_HEIGHT}px)</h4>
                <div className="canvas-info">
                  <span className="info-badge">
                    <span className="badge-dot"></span>
                    {placed.length} items placed
                  </span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
                    <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap
                  </label>
                  {selectedId && (
                    <>
                      <button className="btn" onClick={rotateSelected} title="Rotate 90°">Rotate</button>
                      <button 
                        className="btn" 
                        onClick={() => {
                          const newPlaced = placed.filter(f => f.uid !== selectedId);
                          setPlaced(newPlaced);
                          setFloorLayouts(prev => ({
                            ...prev,
                            [currentFloor]: newPlaced
                          }));
                          setSelectedId(null);
                        }} 
                        title="Delete selected"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {placed.length > 0 && (
                    <button 
                      className="btn btn-reset" 
                      onClick={() => {
                        setPlaced([]);
                        setFloorLayouts(prev => ({
                          ...prev,
                          [currentFloor]: []
                        }));
                        setSelectedId(null);
                      }}
                      title="Clear layout"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div className="canvas-wrapper">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
                {selectedId && (
                  <div className="selected-inspector">
                    {(() => {
                      const sel = placed.find(p => p.uid === selectedId);
                      if (!sel) return null;
                      return (
                        <div className="inspector-card">
                          <div className="inspector-title">Edit Selected</div>
                          <div className="inspector-row"><strong>{sel.nama}</strong></div>
                          <div className="inspector-row">
                            <label>Width (px)</label>
                            <input type="number" value={sel.panjang} onChange={(e) => updateSelectedSize('panjang', e.target.value)} />
                            <label>Height (px)</label>
                            <input type="number" value={sel.lebar} onChange={(e) => updateSelectedSize('lebar', e.target.value)} />
                          </div>
                          <div className="inspector-row">
                            <label>Corner cut</label>
                            <select value={sel.cornerCut || 'none'} onChange={(e) => updateSelectedCut(e.target.value)}>
                              <option value="none">None</option>
                              <option value="top-left">Top-left</option>
                              <option value="top-right">Top-right</option>
                              <option value="bottom-left">Bottom-left</option>
                              <option value="bottom-right">Bottom-right</option>
                            </select>
                            <label>Cut size</label>
                            <input type="number" value={sel.cutSize || 20} min={0} onChange={(e) => updateSelectedCutSize(e.target.value)} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {placed.length === 0 && (
                  <div className="canvas-empty-state">
                    <h3>No furniture placed yet</h3>
                    <p>Add items to cart and click "Generate Auto Layout"</p>
                    <div className="empty-stats">
                      <div className="stat-item">
                        <span>Focal Point Strategy</span>
                      </div>
                      <div className="stat-item">
                        <span>Auto Centering</span>
                      </div>
                      <div className="stat-item">
                        <span>Symmetrical Placement</span>
                      </div>
                    </div>
                  </div>
                )}
                {placed.length > 0 && (
                  <div className="canvas-legend">
                    <h5>Zone Legend:</h5>
                    <div className="legend-items">
                      <span className="legend-item"><span className="zone-badge zone-wall">W</span> Wall</span>
                      <span className="legend-item"><span className="zone-badge zone-center">C</span> Center</span>
                      <span className="legend-item"><span className="zone-badge zone-corner">R</span> Corner</span>
                      <span className="legend-item"><span className="zone-badge zone-accent">A</span> Accent</span>
                      <span className="legend-item"><span className="zone-badge zone-bedside">B</span> Bedside</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}