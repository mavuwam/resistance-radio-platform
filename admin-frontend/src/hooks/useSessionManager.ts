import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from 'shared';

interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
}

interface SessionManagerState {
  showWarning: boolean;
  timeUntilExpiry: number;
}

const WARNING_TIME_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const RETURN_URL_KEY = 'admin_return_url';

/**
 * Decode JWT token to extract expiry time
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Hook to manage session expiry and warnings
 */
export function useSessionManager() {
  const { token, logout } = useAuth();
  const [state, setState] = useState<SessionManagerState>({
    showWarning: false,
    timeUntilExpiry: 0
  });
  
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Store current URL before logout for return redirect
   */
  const storeReturnUrl = useCallback(() => {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login' && currentPath !== '/admin/login') {
      localStorage.setItem(RETURN_URL_KEY, currentPath);
    }
  }, []);

  /**
   * Get stored return URL and clear it
   */
  const getAndClearReturnUrl = useCallback((): string | null => {
    const returnUrl = localStorage.getItem(RETURN_URL_KEY);
    if (returnUrl) {
      localStorage.removeItem(RETURN_URL_KEY);
    }
    return returnUrl;
  }, []);

  /**
   * Handle session expiry
   */
  const handleExpiry = useCallback(() => {
    storeReturnUrl();
    logout();
    // Navigation will be handled by ProtectedRoute
  }, [logout, storeReturnUrl]);

  /**
   * Extend session by refreshing the token
   * For now, this just dismisses the warning since we don't have a refresh endpoint
   */
  const extendSession = useCallback(() => {
    // TODO: Call backend refresh endpoint when available
    // For now, just dismiss the warning
    setState(prev => ({ ...prev, showWarning: false }));
    
    // Clear existing timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    // Note: In a real implementation, we would:
    // 1. Call backend /api/auth/refresh endpoint
    // 2. Get new token with extended expiry
    // 3. Update token in localStorage and axios headers
    // 4. Reset timers with new expiry time
  }, []);

  /**
   * Dismiss warning without extending session
   */
  const dismissWarning = useCallback(() => {
    setState(prev => ({ ...prev, showWarning: false }));
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  /**
   * Setup timers for warning and expiry
   */
  useEffect(() => {
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

    if (!token) {
      setState({ showWarning: false, timeUntilExpiry: 0 });
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      console.warn('Token does not contain expiry time');
      return;
    }

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // If token is already expired, logout immediately
    if (timeUntilExpiry <= 0) {
      handleExpiry();
      return;
    }

    // If token expires in less than warning time, show warning immediately
    if (timeUntilExpiry <= WARNING_TIME_MS) {
      setState({ showWarning: true, timeUntilExpiry });
      
      // Update countdown every second
      updateIntervalRef.current = setInterval(() => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
          handleExpiry();
        } else {
          setState(prev => ({ ...prev, timeUntilExpiry: remaining }));
        }
      }, 1000);

      // Set expiry timer
      expiryTimerRef.current = setTimeout(handleExpiry, timeUntilExpiry);
    } else {
      // Set warning timer
      const timeUntilWarning = timeUntilExpiry - WARNING_TIME_MS;
      warningTimerRef.current = setTimeout(() => {
        setState({ showWarning: true, timeUntilExpiry: WARNING_TIME_MS });
        
        // Update countdown every second
        updateIntervalRef.current = setInterval(() => {
          const remaining = expiryTime - Date.now();
          if (remaining <= 0) {
            handleExpiry();
          } else {
            setState(prev => ({ ...prev, timeUntilExpiry: remaining }));
          }
        }, 1000);
      }, timeUntilWarning);

      // Set expiry timer
      expiryTimerRef.current = setTimeout(handleExpiry, timeUntilExpiry);
    }

    // Cleanup function
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [token, handleExpiry]);

  return {
    showWarning: state.showWarning,
    timeUntilExpiry: state.timeUntilExpiry,
    extendSession,
    dismissWarning,
    getAndClearReturnUrl
  };
}
