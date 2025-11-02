import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notificationData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = {
      ...notificationData,
      id,
      timestamp: new Date(),
      duration: notificationData.duration || 5000
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto remove after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification,
        clearAll 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
