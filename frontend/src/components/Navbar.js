import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import "../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      style={{
        background: theme?.navbarColor || "rgba(10, 10, 10, 0.85)",
        fontFamily: theme?.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="nav-container">
        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <img src="/assets/logo.png" alt="Logo" className="logo-image" />
          <span 
            className="logo-text"
            style={{ color: theme?.navbarTextColor || "#ffffff" }}
          >
            VIRTUALIGN.ID
          </span>
        </Link>

        {/* TOGGLE BUTTON */}
        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          style={{
            '--toggle-color': theme?.navbarTextColor || '#ffffff'
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* DESKTOP LEFT LINKS */}
        <ul className="nav-menu nav-left">
          {[{ to: '/', label: 'Home' }, { to: '/app', label: 'Tipe Rumah' }, { to: '/about', label: 'About' }].map(({ to, label }) => (
            <li key={to} className="nav-item">
              <Link 
                to={to} 
                className={`nav-link ${isActive(to)}`} 
                onClick={() => setMenuOpen(false)} 
                style={{ color: theme?.navbarTextColor || '#ffffff' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* DESKTOP RIGHT LINKS */}
        <ul className="nav-menu nav-right">
          {[{ to: '/news', label: 'News' }, { to: '/faq', label: 'FAQ' }, { to: '/qna', label: 'Q&A' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => (
            <li key={to} className="nav-item">
              <Link 
                to={to} 
                className={`nav-link ${isActive(to)}`} 
                onClick={() => setMenuOpen(false)} 
                style={{ color: theme?.navbarTextColor || '#ffffff' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* MOBILE MENU (drawer) */}
        <ul className={`nav-menu-mobile ${menuOpen ? 'active' : ''}`}>
          {[{ to: '/', label: 'Home' }, { to: '/app', label: 'Tipe Rumah' }, { to: '/about', label: 'About' }, { to: '/news', label: 'News' }, { to: '/faq', label: 'FAQ' }, { to: '/qna', label: 'Q&A' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => (
            <li key={to} className="nav-item">
              <Link 
                to={to} 
                className={`nav-link ${isActive(to)}`} 
                onClick={() => setMenuOpen(false)} 
                style={{ color: theme?.navbarTextColor || '#ffffff' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
