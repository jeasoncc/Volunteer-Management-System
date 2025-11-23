import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Notification } from './Notification';

interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info', 
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, duration + 300); // 加上动画时间
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}