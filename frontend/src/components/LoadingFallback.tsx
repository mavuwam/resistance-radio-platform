import React from 'react';
import './LoadingFallback.css';

const LoadingFallback: React.FC = () => {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingFallback;
