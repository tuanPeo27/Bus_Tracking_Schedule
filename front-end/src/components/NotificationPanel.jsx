import React from 'react';
import { useNotifications } from './NotificationContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success':
      return 'border-l-green-500 bg-green-50 dark:bg-green-950';
    case 'error':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950';
    case 'warning':
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    case 'info':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
    default:
      return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
  }
};

const formatTime = (date) => {
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const NotificationItem = React.forwardRef(
  ({ notification, onRemove }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 300, scale: 0.3 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.5 }}
        transition={{ 
          duration: 0.3,
          ease: "easeOut"
        }}
        layout
      >
      <Card className={`border-l-4 ${getNotificationColor(notification.type)} shadow-lg hover:shadow-xl transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm truncate">
                  {notification.title}
                </h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {formatTime(notification.timestamp)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(notification.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {notification.message && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {notification.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export function NotificationPanel() {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="space-y-3 max-h-[calc(100vh-2rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg shadow-lg border p-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Thông báo</span>
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          </div>
          
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRemove={removeNotification}
              />
            ))}
          </AnimatePresence>
          
          {notifications.length > 10 && (
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Và {notifications.length - 10} thông báo khác...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
