'use client';

import { useUser } from './UserContext';
import { UserSwitcher } from './UserSwitcher';
import { useState } from 'react';
import { ProfileModal } from './ProfileModal';
import { BottomNav } from './BottomNav';
import { NotificationBell } from './NotificationBell';

export function Shell({ children }: { children: React.ReactNode }) {
    const { currentUser } = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!currentUser) {
        return <UserSwitcher />;
    }

    // Add padding bottom for BottomNav
    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative">
            {/* Notification Bell - Top Left */}
            <div className="fixed top-4 left-4 z-50">
                <NotificationBell />
            </div>

            {/* User Profile - Top Right */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
                >
                    {currentUser.avatar_url?.startsWith('http') ? (
                        <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                            {currentUser.avatar_url}
                        </div>
                    )}
                </button>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {children}
            <BottomNav />
        </div>
    );
}
