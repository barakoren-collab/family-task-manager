'use client';

import { Notification } from '@/types';
import { X, Bell, CheckCircle, AlertCircle, TrendingUp, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { store } from '@/lib/store';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: () => void;
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    const handleDismiss = async () => {
        await store.markNotificationAsRead(notification.id);
        onDismiss();
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'task_completed':
                return <CheckCircle className="text-green-500" size={24} />;
            case 'task_assigned':
                return <Bell className="text-indigo-500" size={24} />;
            case 'task_approved':
                return <CheckCircle className="text-emerald-500" size={24} />;
            case 'leaderboard_change':
                return <TrendingUp className="text-purple-500" size={24} />;
            case 'consequence_applied':
                return <Ban className="text-red-500" size={24} />;
            default:
                return <Bell className="text-gray-500" size={24} />;
        }
    };

    const getColor = () => {
        switch (notification.type) {
            case 'task_completed':
            case 'task_approved':
                return 'from-green-50 to-emerald-50 border-green-200';
            case 'task_assigned':
                return 'from-indigo-50 to-blue-50 border-indigo-200';
            case 'leaderboard_change':
                return 'from-purple-50 to-pink-50 border-purple-200';
            case 'consequence_applied':
                return 'from-red-50 to-orange-50 border-red-200';
            default:
                return 'from-gray-50 to-slate-50 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`bg-gradient-to-r ${getColor()} border rounded-2xl shadow-2xl p-4 max-w-sm w-full`}
        >
            <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </motion.div>
    );
}

interface NotificationToastContainerProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
}

export function NotificationToastContainer({ notifications, onDismiss }: NotificationToastContainerProps) {
    return (
        <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map(notification => (
                    <div key={notification.id} className="pointer-events-auto">
                        <NotificationToast
                            notification={notification}
                            onDismiss={() => onDismiss(notification.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
