import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Radio } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const location = useLocation();
  const isLive = false; // Will be connected to live status API

  const desktopNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shows', path: '/shows' },
    { name: 'Listen', path: '/listen' },
    { name: 'News & Insights', path: '/news' },
    { name: 'Events', path: '/events' },
    { name: 'Get Involved', path: '/get-involved' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  const mobileNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shows', path: '/shows' },
    { name: 'News & Insights', path: '/news' },
    { name: 'Events', path: '/events' },
    { name: 'Get Involved', path: '/get-involved' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

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

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav" role="navigation" aria-label="Main navigation">
            {desktopNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
                aria-label={item.name}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Radio Player Button */}
            <button
              onClick={() => setIsPlayerOpen(!isPlayerOpen)}
              className="radio-player-btn"
              aria-label={isPlayerOpen ? 'Close radio player' : 'Open radio player'}
            >
              <Radio className="w-4 h-4" />
              <span>Listen Live</span>
            </button>
          </nav>

          {/* Radio Player Dropdown */}
          {isPlayerOpen && (
            <div className="radio-player-dropdown">
              <iframe 
                width="100%" 
                height="80" 
                src="https://s6.citrus3.com/AudioPlayer/resistanceradiostation?mount=&" 
                style={{ border: 0 }}
                title="Resistance Radio Live Player"
                allow="autoplay"
              />
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[#f5f5f5] hover:text-[#d4633f] transition-colors p-2 relative z-50 mobile-menu-toggle"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Navigation Menu */}
          {isOpen && (
            <div className="lg:hidden border-t border-[#f5f5f5]/10 py-6 space-y-2 mobile-nav-menu">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-all ${
                    isActive(item.path)
                      ? 'text-[#d4633f] bg-[#d4633f]/10'
                      : 'text-[#f5f5f5] hover:text-[#d4633f] hover:bg-[#f5f5f5]/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/listen"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-[#d4633f] text-[#f5f5f5] rounded-full"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <Radio className="w-4 h-4" />
                <span className="font-medium">Listen Live</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
