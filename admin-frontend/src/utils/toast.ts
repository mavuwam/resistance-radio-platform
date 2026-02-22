import { useToastContext } from '../contexts/ToastContext';
import { ToastType } from '../components/Toast';

/**
 * Custom hook to access toast notification functionality
 * 
 * @example
 * ```tsx
 * const { addToast } = useToast();
 * 
 * // Success notification
 * addToast('success', 'Show created successfully');
 * 
 * // Error notification
 * addToast('error', 'Failed to delete episode');
 * 
 * // Warning notification
 * addToast('warning', 'Session expires in 5 minutes');
 * 
 * // Info notification
 * addToast('info', 'Draft saved automatically');
 * 
 * // Custom duration (in milliseconds)
 * addToast('success', 'Operation completed', 3000);
 * ```
 */
export const useToast = () => {
  const { addToast, removeToast } = useToastContext();

  return {
    /**
     * Display a toast notification
     * @param type - Type of toast: 'success', 'error', 'warning', or 'info'
     * @param message - Message to display (string or error object)
     * @param duration - Auto-dismiss duration in milliseconds (default: 5000)
     */
    addToast: (type: ToastType, message: string | any, duration?: number) => {
      addToast(type, message, duration);
    },
    
    /**
     * Manually dismiss a toast by ID
     * @param id - Toast ID to dismiss
     */
    removeToast: (id: string) => {
      removeToast(id);
    },

    // Convenience methods for common toast types
    success: (message: string | any, duration?: number) => {
      addToast('success', message, duration);
    },

    error: (message: string | any, duration?: number) => {
      addToast('error', message, duration);
    },

    warning: (message: string | any, duration?: number) => {
      addToast('warning', message, duration);
    },

    info: (message: string | any, duration?: number) => {
      addToast('info', message, duration);
    },
  };
};
