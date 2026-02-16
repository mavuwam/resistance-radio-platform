import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import './Footer.css';

// Social Links Array
const socialLinks = [
  { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
  { icon: MessageCircle, url: 'https://wa.me/447921462583', label: 'WhatsApp' },
];

const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Resistance Radio Station</h4>
            <p>Broadcasting courage. Amplifying truth.</p>
            <p className="tagline">Powered by citizens.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <nav aria-label="Footer navigation">
              <Link to="/about">About Us</Link>
              <Link to="/shows">Shows</Link>
              <Link to="/listen">Listen</Link>
              <Link to="/news">News & Insights</Link>
              <Link to="/events">Events</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          
          <div className="footer-section">
            <h4>Legal & Ethics</h4>
            <nav aria-label="Legal and ethics">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-use">Terms of Use</Link>
              <Link to="/cookie-policy">Cookie Policy</Link>
              <Link to="/ethical-principles">Ethical Broadcasting Principles</Link>
              <Link to="/safeguarding">Safeguarding Statement</Link>
              <Link to="/editorial-independence">Editorial Independence</Link>
            </nav>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <div className="social-links-icons">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-link"
                    aria-label={social.label}
                  >
                    <Icon className="social-icon" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="footer-bottom-right">
            <p>&copy; 2026 Resistance Radio Station. All rights reserved.</p>
            <p>Where citizens speak, and power learns to listen.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
