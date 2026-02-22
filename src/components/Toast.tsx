import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, action, onClose }) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    // Only set up interval if there's an action, as the countdown is purely visual for the action button
    let interval: ReturnType<typeof setInterval>;
    if (action) {
      interval = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [id, duration, onClose, action]);

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
      <div className="toast-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {getIcon()}
        <p className="toast-message" style={{ margin: 0 }}>{message}</p>
      </div>

      {action && (
        <button
          onClick={() => { action.onClick(); onClose(id); }}
          className="toast-action-btn"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'inherit',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto',
            marginRight: '8px',
            fontSize: '0.85rem'
          }}
        >
          {action.label} ({Math.ceil(remainingTime / 1000)}s)
        </button>
      )}

      <button onClick={() => onClose(id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
