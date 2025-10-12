import React, { useState, useEffect } from 'react';
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
        onClick={onClose}
        style={{animation: 'fadeIn 0.2s ease'}}
      ></div>

      {/* Panel */}
      <div 
        className="fixed right-0 sm:right-4 top-0 sm:top-4 w-full sm:w-96 max-w-md h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl z-[10001] flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50" 
        style={{
          animation: 'slideDown 0.3s ease',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <style>{`
          .dark .fixed.right-0.sm\\:right-4 {
            background: rgba(17, 24, 39, 0.95) !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
          }
        `}</style>
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50"
          style={{
            background: 'rgba(249, 250, 251, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <style>{`
            .dark .flex.items-center.justify-between.p-6 {
              background: rgba(17, 24, 39, 0.6) !important;
            }
          `}</style>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}>Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto" style={{background: 'rgba(255, 255, 255, 0.5)'}}>
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
                <div
                  key={notification.id}
                  className={`p-4 transition-all ${
                    !notification.read ? 'bg-blue-50/80 dark:bg-blue-900/20' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                  }`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div 
                      className="flex-grow cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
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
