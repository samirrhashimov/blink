import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={20} />;
      case 'error':
        return <AlertCircle className="toast-icon" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={20} />;
      case 'info':
        return <Info className="toast-icon" size={20} />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {getIcon()}
        <p className="toast-message">{message}</p>
      </div>
      <button onClick={() => onClose(id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
