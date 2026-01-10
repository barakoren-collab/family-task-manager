'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
    const { currentUser } = useUser();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Sort by XP descending
        const fetch = async () => {
            const users = await store.getUsers();
            setUsers([...users].sort((a, b) => b.xp - a.xp));
        };
        fetch();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 fill-yellow-400" size={24} />;
            case 1: return <Medal className="text-gray-400 fill-gray-400" size={24} />;
            case 2: return <Award className="text-amber-600 fill-amber-600" size={24} />;
            default: return <span className="text-gray-400 font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="p-4 space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-500">Who's winning this week?</p>
            </header>

            <div className="space-y-4">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                            user.id === currentUser?.id
                                ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200"
                                : "bg-white border-gray-100 shadow-sm"
                        )}
                    >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                            {getRankIcon(index)}
                        </div>

                        <div className="relative">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm overflow-hidden">
                                {user.avatar_url?.startsWith('http') ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.avatar_url
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-[10px] font-bold border shadow-sm z-10">
                                Lvl {user.level}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className={cn("font-bold", user.id === currentUser?.id ? "text-indigo-900" : "text-gray-900")}>
                                {user.name}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>

                        <div className="text-right">
                            <span className="block font-bold text-lg text-gray-900">{user.xp}</span>
                            <span className="text-xs text-gray-400 uppercase font-medium">XP</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
