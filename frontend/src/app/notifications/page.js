'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, X, Circle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?.residentId) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user?.residentId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/notifications/resident/${user.residentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Marking notification as read:', notificationId);
    
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);
      
      if (response.ok) {
        // Update local state and refresh from database
        setNotifications(notifications.map(n =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        ));
        console.log('Notification marked as read successfully');
        
        // Refresh notifications to get latest data from database
        setTimeout(() => fetchNotifications(), 500);
      } else {
        console.error('Failed to mark notification as read:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to mark as read (network error):', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REQUEST_APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REQUEST_REJECTED':
      case 'ACCOUNT_REJECTED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    let baseColors = '';
    const unread = isUnread({ isRead }); // Use helper function
    switch (type) {
      case 'REQUEST_APPROVED':
        baseColors = unread ? 'border-green-200 bg-green-50' : 'border-green-100 bg-green-25';
        break;
      case 'REQUEST_REJECTED':
      case 'ACCOUNT_REJECTED':
        baseColors = unread ? 'border-red-200 bg-red-50' : 'border-red-100 bg-red-25';
        break;
      default:
        baseColors = unread ? 'border-blue-200 bg-blue-50' : 'border-blue-100 bg-blue-25';
    }
    return baseColors;
  };

  const getReadStatusIndicator = (isRead) => {
    const unread = isUnread({ isRead }); // Use helper function
    return unread ? (
      <Circle className="w-3 h-3 text-blue-500 fill-blue-500" />
    ) : (
      <Circle className="w-3 h-3 text-gray-400 fill-gray-400" />
    );
  };

  const getTextOpacity = (isRead) => {
    const unread = isUnread({ isRead }); // Use helper function
    return unread ? 'text-gray-900' : 'text-gray-600';
  };

  const isRejectionNotification = (type) => {
    return type === 'REQUEST_REJECTED' || type === 'ACCOUNT_REJECTED';
  };

  // Helper function to determine if notification is unread based on database isRead field
  const isUnread = (notification) => {
    // Database stores: 0 = unread, 1 = read
    return notification.isRead === 0;
  };

  if (loading) {
    return (
      <div className="pt-32 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-32 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="font-montserrat font-extrabold text-4xl text-blue-900 mb-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Notifications
        </motion.h1>

        {notifications.length === 0 ? (
          <motion.div
            className="bg-white rounded-xl shadow-md p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notifications</h3>
            <p className="text-gray-500">You don't have any notifications at the moment.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.notificationId}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getNotificationColor(notification.type, notification.isRead)} border-l-8 relative`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {getReadStatusIndicator(notification.isRead)}
                  {isUnread(notification) && (
                    <button
                      onClick={() => markAsRead(notification.notificationId)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-4 pr-12">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${getTextOpacity(notification.isRead)}`}>
                      {notification.title}
                    </h3>
                    <p className={`mb-2 ${getTextOpacity(notification.isRead)}`}>
                      {notification.message}
                    </p>
                    
                    {/* Show rejection reason if available */}
                    {isRejectionNotification(notification.type) && notification.additionalData && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="text-sm font-medium text-red-900 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Reason for Rejection:
                        </h4>
                        <p className="text-sm text-red-800">{notification.additionalData}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-3">
                      {new Date(notification.createdAt).toLocaleString('en-US')}
                    </p>
                    {isUnread(notification) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}