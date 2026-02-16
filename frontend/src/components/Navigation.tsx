import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLinkClick }) => {
  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <Link to="/" aria-label="Home page" onClick={onLinkClick}>Home</Link>
      <Link to="/about" aria-label="About us" onClick={onLinkClick}>About</Link>
      <Link to="/shows" aria-label="Browse our shows" onClick={onLinkClick}>Shows</Link>
      <Link to="/listen" aria-label="Listen live or on-demand" onClick={onLinkClick}>Listen</Link>
      <Link to="/news" aria-label="News and insights" onClick={onLinkClick}>News & Insights</Link>
      <Link to="/events" aria-label="Upcoming events" onClick={onLinkClick}>Events</Link>
      <Link to="/get-involved" aria-label="Get involved with us" onClick={onLinkClick}>Get Involved</Link>
      <Link to="/resources" aria-label="Educational resources" onClick={onLinkClick}>Resources</Link>
      <Link to="/contact" aria-label="Contact us" onClick={onLinkClick}>Contact</Link>
    </nav>
  );
};

export default Navigation;
