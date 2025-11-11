import React from 'react';
import UnityPlayer from '../components/UnityPlayer';
import '../styles/VirtualTour.css';

export default function VirtualTour() {
  return (
    <div className="virtual-tour-page">
      <div className="tour-header">
        <h1>Virtual Tour Interaktif 3D</h1>
        <p>Jelajahi ruang dalam format 360-degree yang immersive</p>
      </div>

      <div className="tour-container">
        <UnityPlayer />
      </div>

      <div className="tour-controls">
        <button className="btn-back-home" onClick={() => window.location.href = '/'}>
          ← Kembali ke Home
        </button>
      </div>
    </div>
  );
}
