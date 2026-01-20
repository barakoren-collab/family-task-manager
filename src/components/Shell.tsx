'use client';

import { useUser } from './UserContext';
import { UserSwitcher } from './UserSwitcher';
import { UserAvatar } from './UserAvatar';
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
            {/* Header - Top Right: Notification Bell and User Profile */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                <NotificationBell />
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="hover:scale-110 active:scale-95 transition-all outline-none"
                >
                    <UserAvatar user={currentUser} size="lg" showBorder />
                </button>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {children}
            <BottomNav />
        </div>
    );
}
