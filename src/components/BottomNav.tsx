'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, CheckSquare, Trophy, ShoppingBag, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from './UserContext';

export function BottomNav() {
    const { currentUser } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Rank', path: '/leaderboard', icon: Trophy },
        { name: 'Store', path: '/store', icon: ShoppingBag },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe pt-2 px-4 shadow-lg z-50">
            <div className="flex justify-around items-center h-16 pb-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => router.push(tab.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full transition-colors duration-200",
                                isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon size={24} className={cn(isActive && "fill-current")} />
                            <span className="text-xs font-medium mt-1">{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
