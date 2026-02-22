import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType, ToastContainer } from '../components/Toast';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string | any, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string | any, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure message is always a string, handle error objects
    let messageStr: string;
    if (typeof message === 'string') {
      messageStr = message;
    } else if (message && typeof message === 'object') {
      // If message is an object (like an error object), extract the message property or stringify it
      messageStr = message.message || message.error || JSON.stringify(message);
    } else {
      messageStr = String(message);
    }
    
    const newToast: Toast = {
      id,
      type,
      message: messageStr,
      duration: duration || 5000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
