import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await apiRequest('/notifications?limit=25');
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Could not fetch notifications:', e.message);
    }
  }, [user]);

  // Initial fetch and poll every 20s
  useEffect(() => {
    fetchNotifications();
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  async function markAsRead(id) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  }

  async function markAllAsRead() {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
