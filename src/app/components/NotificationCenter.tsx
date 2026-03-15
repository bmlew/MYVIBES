import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Trash2, Star, Calendar, ArrowLeft } from 'lucide-react';
import * as api from '@/utils/api';
import { Button } from './ui/button';

interface Notification {
  id: string;
  user_id: string;
  business_id: string;
  business_name: string;
  business_logo?: string;
  type: 'special' | 'event' | 'event-interested' | 'event-going' | 'reservation-confirmed' | 'reservation-rejected';
  title: string;
  message: string;
  special_id?: string;
  event_id?: string;
  event_title?: string;
  event_date?: string;
  reservation_id?: string;
  reservation_date?: string;
  reservation_time?: string;
  party_size?: number;
  rejection_reason?: string;
  image_url?: string;
  created_at: string;
  read: boolean;
  read_at?: string;
}

interface NotificationCenterProps {
  userId: string;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationCenter({ userId, onClose, onNotificationClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(userId);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await api.markNotificationAsRead(userId, notificationId);
    if (success) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
      
      // Trigger parent to refresh unread count
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await api.markAllNotificationsAsRead(userId);
    if (success) {
      setNotifications(notifications.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      
      // Trigger parent to refresh unread count
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }
  };

  const handleDelete = async (notificationId: string) => {
    const success = await api.deleteNotification(userId, notificationId);
    if (success) {
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      // Trigger parent to refresh unread count
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Call parent handler
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs opacity-90">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread' 
                  ? 'You\'re all caught up!'
                  : 'You\'ll see notifications here when your favorite venues post new specials or events.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors cursor-pointer hover:bg-gray-100 ${
                  !notification.read ? 'bg-blue-50' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {/* Business Logo or Icon */}
                  <div className="flex-shrink-0">
                    {notification.business_logo ? (
                      <img
                        src={notification.business_logo}
                        alt={notification.business_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        {notification.type === 'special' ? (
                          <Star className="w-6 h-6 text-white" />
                        ) : (
                          <Calendar className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                    
                    {/* Show rejection reason if present */}
                    {notification.type === 'reservation-rejected' && notification.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                        <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-xs text-red-700">{notification.rejection_reason}</p>
                      </div>
                    )}
                    
                    {/* Show reservation details if present */}
                    {(notification.type === 'reservation-confirmed' || notification.type === 'reservation-rejected') && (
                      <div className="flex gap-4 text-xs text-gray-600 mt-2">
                        {notification.reservation_date && (
                          <span>📅 {notification.reservation_date}</span>
                        )}
                        {notification.reservation_time && (
                          <span>🕐 {notification.reservation_time}</span>
                        )}
                        {notification.party_size && (
                          <span>👥 {notification.party_size} guests</span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;