'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
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
      const res = await fetch(`http://localhost:8080/api/notifications/resident/${user.residentId}/unread`, {
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
    if (!token) return;

    try {
      await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Remove the notification from the list
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REQUEST_APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REQUEST_REJECTED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'REQUEST_APPROVED':
        return 'border-green-200 bg-green-50';
      case 'REQUEST_REJECTED':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No New Notifications</h3>
            <p className="text-gray-500">You dont have any notifications at the moment.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.notificationId}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getNotificationColor(notification.type)} border-l-8 relative`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
              >
                <button
                  onClick={() => markAsRead(notification.notificationId)}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-4 pr-8">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString('en-US')}
                    </p>
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