import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer, { type ToastData } from '../components/ToastContainer';
import { type ToastType, type ToastAction } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number, action?: ToastAction) => void;
  success: (message: string, duration?: number, action?: ToastAction) => void;
  error: (message: string, duration?: number, action?: ToastAction) => void;
  warning: (message: string, duration?: number, action?: ToastAction) => void;
  info: (message: string, duration?: number, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration: number = 5000, action?: ToastAction) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = { id, message, type, duration, action };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const success = useCallback((message: string, duration?: number, action?: ToastAction) => {
    showToast(message, 'success', duration, action);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number, action?: ToastAction) => {
    showToast(message, 'error', duration, action);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number, action?: ToastAction) => {
    showToast(message, 'warning', duration, action);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number, action?: ToastAction) => {
    showToast(message, 'info', duration, action);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
