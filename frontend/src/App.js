import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CMSProvider } from './contexts/CMSContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Navbar from './components/Navbar';
import NotificationContainer from './components/Notification';

// Pages
import Home from './pages/Home';
import LayoutApp from './pages/LayoutApp';
import VirtualTour from './pages/VirtualTour';
import About from './pages/About';
import AdminDashboard from './pages/admin/AdminDashboard';
import News from './pages/News';
import FAQ from './pages/FAQ';
import QnA from './pages/QnA';
import Contact from './pages/Contact';

import './styles/App.css';

/**
 * Komponen utama untuk route animasi dan konten halaman
 */
function MainContent() {
  const location = useLocation();

  return (
    <main className="app-main">
      <div key={location.pathname} className="route-page">
        <Suspense fallback={<div className="route-loading">Loading…</div>}>
          <Routes location={location}>
            {/* Default route ke Home */}
            <Route path="/" element={<Home />} />
            <Route path="" element={<Navigate to="/" replace />} />
            <Route path="/app" element={<LayoutApp />} />
            <Route path="/virtual-tour" element={<VirtualTour />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/qna" element={<QnA />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </main>
  );
}

/**
 * Root utama aplikasi
 */
export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <CMSProvider>
          <div className="app">
            <Navbar />
            <MainContent />
            <NotificationContainer />
            <footer className="app-footer">
              <p>&copy; {new Date().getFullYear()} Virtual Tour App. All rights reserved.</p>
            </footer>
          </div>
        </CMSProvider>
      </ThemeProvider>
    </Router>
  );
}
