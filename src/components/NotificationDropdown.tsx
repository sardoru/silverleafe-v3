import React, { useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  Truck, 
  Shield, 
  FileText, 
  RefreshCw, 
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../store';
import { Notification } from '../types';

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(id);
  };

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.icon || notification.type) {
      case 'truck':
      case 'custody':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'compliance':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'certification':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'refresh':
      case 'system':
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 relative touch-target"
        aria-expanded={isOpen}
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-[80vh] sm:max-h-96 overflow-hidden">
          <div className="py-2 px-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-green-600 hover:text-green-800 font-medium touch-target"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[calc(80vh-48px)] sm:max-h-[calc(24rem-48px)]">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 flex justify-between">
                          <span>{notification.title}</span>
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-green-600 hover:text-green-800 touch-target"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </div>
                        {notification.batchId && (
                          <Link
                            to={`/batches/${notification.batchId}`}
                            className="mt-1 text-xs text-green-600 hover:text-green-800 flex items-center touch-target"
                            onClick={() => markAsRead(notification.id)}
                          >
                            View batch details
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            )}
          </div>
          <div className="py-2 px-4 border-t border-gray-100 text-xs text-center text-gray-500">
            Showing {notifications.length} most recent notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;