import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Calendar, Clock, FileText, Info } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = showUnreadOnly ? '/notifications/unread' : '/notifications';
      const response = await API.get(endpoint);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get('/notifications/unread/count');
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
        return <Calendar className="h-5 w-5 text-cyan-500" />;
      case 'APPOINTMENT_CANCELLED':
        return <X className="h-5 w-5 text-red-500" />;
      case 'APPOINTMENT_REMINDER':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PLAN_EXPIRY':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#111827] shadow border-b border-gray-800-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-cyan-500 mr-3" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  showUnreadOnly
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400">
                {showUnreadOnly 
                  ? "You have no unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-[#1F2937] transition-colors ${
                  !notification.isRead ? 'bg-[#1F2937]' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-900 text-cyan-200">
                              New
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-400 whitespace-pre-line">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                      title="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
