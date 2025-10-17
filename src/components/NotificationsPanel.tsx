import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Trash2, CheckCheck } from 'lucide-react';
import { NotificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  // ESC key to close panel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // click-outside to close (since we don't render a full-page backdrop)
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await NotificationService.getUserNotifications(userId);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invite':
        return '📨';
      case 'share':
        return '🔗';
      case 'comment':
        return '💬';
      case 'mention':
        return '@';
      case 'update':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (modal-like) */}
      <div
        className="fixed inset-0"
        style={{ background: 'rgba(0,0,0,0.35)', zIndex: 10000, backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Full-screen Panel */}
      <div
        ref={panelRef}
        className="notifications-panel"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10001,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          borderRadius: 0,
          overflow: 'auto',
          animation: 'fadeIn 0.18s ease',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.96))',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          boxShadow: 'none',
          border: 'none'
        }}
      >
        <style>{`
          .dark .notifications-panel {
            background: linear-gradient(180deg, rgba(10,12,18,0.85), rgba(15,18,25,0.8)) !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
          }
          @media (max-width: 640px) {
            .notifications-panel { right: 0.5rem !important; left: 0.5rem !important; width: calc(100% - 1rem) !important; }
          }
        `}</style>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50"
          style={{
            background: 'transparent'
          }}
        >
          <style>{`
            .dark .flex.items-center.justify-between.p-6 {
              background: rgba(17, 24, 39, 0.6) !important;
            }
          `}</style>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-300 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-2 py-2" style={{background: 'transparent'}}>
          <style>{`
            .dark .flex-grow.overflow-y-auto {
              background: rgba(17, 24, 39, 0.3) !important;
            }
          `}</style>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3">
                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                      !notification.read ? 'ring-1 ring-primary/30 bg-blue-50/80 dark:bg-blue-900/12' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 text-2xl" style={{width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <div style={{fontSize: 18}}>{getNotificationIcon(notification.type)}</div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{notification.title}</h3>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatTime(notification.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
