import React, { useState } from 'react';
import './GlobalRadioPlayer.css';

const GlobalRadioPlayer: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`global-radio-player ${isMinimized ? 'minimized' : ''}`}>
      <div className="radio-player-header">
        <div className="radio-player-title">
          <span className="live-dot">●</span>
          <span>Resistance Radio - Live 24/7</span>
        </div>
        <div className="radio-player-controls">
          <button
            className="minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand player' : 'Minimize player'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            className="close-btn"
            onClick={() => setIsVisible(false)}
            aria-label="Close player"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="radio-player-content">
          <iframe 
            width="100%" 
            height="120" 
            src="https://s6.citrus3.com/AudioPlayer/resistanceradiostation?mount=&" 
            style={{ border: 0 }}
            title="Resistance Radio Live Player"
            allow="autoplay"
          />
        </div>
      )}
    </div>
  );
};

export default GlobalRadioPlayer;
