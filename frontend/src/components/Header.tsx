import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import './Header.css';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLive = false; // Will be connected to live status API

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo-link" aria-label="Resistance Radio Station - Home">
            <div className="logo-container">
              <img src="/logo.jpeg" alt="Resistance Radio Station logo" className="logo-image" />
              <div className="logo-text">
                <h1 className="logo">Resistance Radio Station</h1>
                <p className="tagline">Broadcasting courage. Amplifying truth.</p>
              </div>
            </div>
          </Link>

          {isLive && (
            <div className="live-indicator" role="status" aria-live="polite">
              <span className="live-dot" aria-hidden="true"></span>
              <span className="live-text">LIVE</span>
              <span className="sr-only">Currently broadcasting live</span>
            </div>
          )}

          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>

          <div 
            className={`nav-wrapper ${mobileMenuOpen ? 'open' : ''}`}
            id="main-navigation"
          >
            <Navigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
