import React, { useState, useEffect } from 'react';
import './ThemeSwitcher.css';

type Theme = 'default' | 'engagement' | 'informational' | 'multimedia' | 'community' | 'accessible';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'default', label: 'Default (Compact)', icon: '⚡' },
  { value: 'engagement', label: 'Engagement-Centric', icon: '🎯' },
  { value: 'informational', label: 'Informational Hub', icon: '📰' },
  { value: 'multimedia', label: 'Multimedia Experience', icon: '🎬' },
  { value: 'community', label: 'Community-Driven', icon: '🤝' },
  { value: 'accessible', label: 'Accessible & Responsive', icon: '♿' },
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    // Remove all theme classes
    document.body.classList.remove(
      'theme-engagement',
      'theme-informational',
      'theme-multimedia',
      'theme-community',
      'theme-accessible'
    );

    // Add new theme class
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }

    // Load theme CSS dynamically
    const existingLink = document.getElementById('theme-css');
    if (existingLink) {
      existingLink.remove();
    }

    if (theme !== 'default') {
      const link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      link.href = `/src/themes/${getThemeFileName(theme)}`;
      document.head.appendChild(link);
    }
  };

  const getThemeFileName = (theme: Theme): string => {
    const fileMap: Record<Theme, string> = {
      default: '',
      engagement: 'engagement-centric.css',
      informational: 'informational-hub.css',
      multimedia: 'multimedia-experience.css',
      community: 'community-driven.css',
      accessible: 'accessible-responsive.css',
    };
    return fileMap[theme];
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.value === currentTheme);

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch theme"
        aria-expanded={isOpen}
      >
        <span className="theme-icon">{currentThemeData?.icon}</span>
        <span className="theme-label">Theme</span>
      </button>

      {isOpen && (
        <div className="theme-switcher-menu">
          <div className="theme-switcher-header">
            <h3>Choose Design Theme</h3>
            <button
              className="theme-switcher-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme switcher"
            >
              ×
            </button>
          </div>
          <div className="theme-switcher-options">
            {themes.map(theme => (
              <button
                key={theme.value}
                className={`theme-option ${currentTheme === theme.value ? 'active' : ''}`}
                onClick={() => handleThemeChange(theme.value)}
              >
                <span className="theme-option-icon">{theme.icon}</span>
                <span className="theme-option-label">{theme.label}</span>
                {currentTheme === theme.value && (
                  <span className="theme-option-check">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="theme-switcher-footer">
            <p>Testing different design approaches</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
