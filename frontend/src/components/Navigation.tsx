import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <Link to="/" aria-label="Home page">Home</Link>
      <Link to="/about" aria-label="About us">About</Link>
      <Link to="/shows" aria-label="Browse our shows">Shows</Link>
      <Link to="/listen" aria-label="Listen live or on-demand">Listen</Link>
      <Link to="/news" aria-label="News and insights">News & Insights</Link>
      <Link to="/events" aria-label="Upcoming events">Events</Link>
      <Link to="/get-involved" aria-label="Get involved with us">Get Involved</Link>
      <Link to="/resources" aria-label="Educational resources">Resources</Link>
      <Link to="/contact" aria-label="Contact us">Contact</Link>
    </nav>
  );
};

export default Navigation;
