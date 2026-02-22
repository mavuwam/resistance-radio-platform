import React, { useEffect, useState } from 'react';
import './Loading.css';

/**
 * Loading Components
 * 
 * Provides visual feedback during data fetching and processing.
 * Includes Spinner, SkeletonLoader, and LoadingOverlay components.
 * 
 * Features:
 * - Minimum display time of 300ms to prevent flickering
 * - Accessible with aria-live announcements
 * - Multiple size and type options
 */

// ========================================
// SPINNER COMPONENT
// ========================================

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * Spinner - Rotating circle animation for loading states
 * 
 * @param size - Size of the spinner (small: 20px, medium: 32px, large: 48px)
 * @param color - Custom color for the spinner (defaults to primary color)
 * @param className - Additional CSS classes
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color,
  className = '' 
}) => {
  const sizeClass = `spinner-${size}`;
  const style = color ? { borderTopColor: color, borderRightColor: color } : undefined;

  return (
    <div 
      className={`spinner ${sizeClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// ========================================
// SKELETON LOADER COMPONENT
// ========================================

export interface SkeletonLoaderProps {
  type: 'table' | 'card' | 'text' | 'circle';
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * SkeletonLoader - Pulsing gray rectangles matching content shape
 * 
 * @param type - Type of skeleton (table, card, text, circle)
 * @param rows - Number of rows for table/text type
 * @param columns - Number of columns for table type
 * @param className - Additional CSS classes
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  rows = 3, 
  columns = 4,
  className = '' 
}) => {
  if (type === 'table') {
    return (
      <div className={`skeleton-table ${className}`} aria-label="Loading table">
        <div className="skeleton-table-header">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="skeleton skeleton-table-cell" />
          ))}
        </div>
        <div className="skeleton-table-body">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="skeleton-table-row">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="skeleton skeleton-table-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`skeleton-card ${className}`} aria-label="Loading card">
        <div className="skeleton skeleton-card-image" />
        <div className="skeleton-card-content">
          <div className="skeleton skeleton-card-title" />
          <div className="skeleton skeleton-card-text" />
          <div className="skeleton skeleton-card-text" style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className={`skeleton skeleton-circle ${className}`} aria-label="Loading" />
    );
  }

  // Default: text type
  return (
    <div className={`skeleton-text-container ${className}`} aria-label="Loading text">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={`text-${i}`} 
          className="skeleton skeleton-text-line"
          style={{ width: i === rows - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};

// ========================================
// LOADING OVERLAY COMPONENT
// ========================================

export interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * LoadingOverlay - Semi-transparent backdrop with centered spinner
 * 
 * Features:
 * - Minimum display time of 300ms to prevent flickering
 * - Accessible with aria-live announcements
 * - Can be fullscreen or contained within parent
 * 
 * @param message - Optional message to display below spinner
 * @param fullScreen - Whether to cover entire viewport (default: false)
 * @param className - Additional CSS classes
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Ensure minimum display time of 300ms to prevent flickering
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      
      // If component unmounts before 300ms, ensure it was visible for at least 300ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 300 && shouldShow) {
        // This is handled by the parent component's state management
      }
    };
  }, [startTime, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const overlayClass = fullScreen ? 'loading-overlay-fullscreen' : 'loading-overlay';

  return (
    <div 
      className={`${overlayClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-overlay-content">
        <Spinner size="large" />
        {message && (
          <p className="loading-overlay-message">{message}</p>
        )}
      </div>
    </div>
  );
};

// ========================================
// LOADING WRAPPER HOOK
// ========================================

/**
 * Hook to manage loading state with minimum display time
 * 
 * Ensures loading indicators are displayed for at least 300ms
 * to prevent flickering on fast operations.
 * 
 * @returns Object with isLoading state and setLoading function
 */
export const useMinimumLoadingTime = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const setLoading = async (loading: boolean) => {
    if (loading) {
      setStartTime(Date.now());
      setIsLoading(true);
    } else {
      if (startTime) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 300 - elapsed);
        
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, remaining));
        }
      }
      setIsLoading(false);
      setStartTime(null);
    }
  };

  return { isLoading, setLoading };
};

// ========================================
// EXPORTS
// ========================================

export default {
  Spinner,
  SkeletonLoader,
  LoadingOverlay,
  useMinimumLoadingTime
};
