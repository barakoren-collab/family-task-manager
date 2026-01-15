'use client';

import { useUser } from './UserContext';
import { store } from '@/lib/store';
import { Notification } from '@/types';
import { Bell, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
    const { currentUser } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = async () => {
        if (!currentUser) return;
        const fetched = await store.getNotifications(currentUser.id);
        setNotifications(fetched);
        setUnreadCount(fetched.filter(n => !n.is_read).length);
    };

    useEffect(() => {
        refreshNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(refreshNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleMarkAsRead = async (notificationId: string) => {
        await store.markNotificationAsRead(notificationId);
        refreshNotifications();
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
        await store.markAllNotificationsAsRead(currentUser.id);
        refreshNotifications();
    };

    const handleDelete = async (notificationId: string) => {
        await store.deleteNotification(notificationId);
        refreshNotifications();
    };

    if (!currentUser) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                                    >
                                        <Check size={14} /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="overflow-y-auto max-h-80">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <Bell size={48} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-indigo-50/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                                                        )}
                                                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                            {notification.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
