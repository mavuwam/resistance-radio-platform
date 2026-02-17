import React, { useState } from 'react';
import './GlobalRadioPlayer.css';

const GlobalRadioPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`global-radio-widget ${isExpanded ? 'expanded' : 'compact'}`}>
      {!isExpanded ? (
        // Compact mode - small widget
        <button
          className="widget-compact-btn"
          onClick={() => setIsExpanded(true)}
          aria-label="Open radio player"
        >
          <span className="live-indicator">●</span>
          <span className="widget-text">LIVE</span>
        </button>
      ) : (
        // Expanded mode - full player
        <div className="widget-expanded">
          <div className="widget-header">
            <div className="widget-title">
              <span className="live-indicator">●</span>
              <span>Resistance Radio</span>
            </div>
            <button
              className="widget-collapse-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Minimize player"
            >
              ✕
            </button>
          </div>
          <div className="widget-player">
            <iframe 
              width="100%" 
              height="80" 
              src="https://s6.citrus3.com/AudioPlayer/resistanceradiostation?mount=&" 
              style={{ border: 0 }}
              title="Resistance Radio Live Player"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalRadioPlayer;
