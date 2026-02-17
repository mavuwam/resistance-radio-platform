import React, { createContext, useContext, useEffect, useState } from 'react';
import { preventClickjacking, setupSecureUnload, RateLimiter } from '../utils/security';

interface SecurityContextType {
  isSecure: boolean;
  rateLimiter: RateLimiter;
  checkRateLimit: (key: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [rateLimiter] = useState(() => new RateLimiter(5, 60000)); // 5 attempts per minute

  useEffect(() => {
    // Initialize security measures
    preventClickjacking();
    setupSecureUnload();
    
    // Check if running on HTTPS in production
    if (import.meta.env.PROD && window.location.protocol !== 'https:') {
      console.warn('Application should be served over HTTPS in production');
      setIsSecure(false);
    } else {
      setIsSecure(true);
    }
    
    // Disable right-click on sensitive pages (optional)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.sensitive-content')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Prevent drag and drop of sensitive content
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.sensitive-content')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const checkRateLimit = (key: string): boolean => {
    return rateLimiter.isAllowed(key);
  };

  return (
    <SecurityContext.Provider value={{ isSecure, rateLimiter, checkRateLimit }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};
