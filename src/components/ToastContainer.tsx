import React from 'react';
import Toast, { type ToastType, type ToastAction } from './Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          action={toast.action}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
