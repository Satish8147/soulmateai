import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();

  // Load from local storage on mount or user change
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    const storageKey = `soulmate_notifications_${user.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    } else {
      // Seed with mock notifications if empty
      const initialNotifications: AppNotification[] = [
        {
          id: '1',
          type: 'system',
          title: 'Welcome to SoulmateAI',
          message: 'Complete your profile to get better recommendations.',
          timestamp: Date.now(),
          read: false,
          link: '/profile'
        },
        {
          id: '2',
          type: 'match',
          title: 'New Match Found',
          message: 'You matched with Sarah Thomas based on your preferences.',
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: false,
          link: '/matches/4'
        }
      ];
      setNotifications(initialNotifications);
      localStorage.setItem(storageKey, JSON.stringify(initialNotifications));
    }
  }, [user?.id]);

  // Save to local storage on change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      const storageKey = `soulmate_notifications_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (user?.id) {
      localStorage.removeItem(`soulmate_notifications_${user.id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};