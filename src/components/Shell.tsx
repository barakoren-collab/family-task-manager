'use client';

import { useUser } from './UserContext';
import { UserSwitcher } from './UserSwitcher';
import { BottomNav } from './BottomNav';

export function Shell({ children }: { children: React.ReactNode }) {
    const { currentUser } = useUser();

    if (!currentUser) {
        return <UserSwitcher />;
    }

    // Add padding bottom for BottomNav
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {children}
            <BottomNav />
        </div>
    );
}
