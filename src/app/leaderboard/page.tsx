'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
    const { currentUser } = useUser();
    const [users, setUsers] = useState<User[]>([]);

    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const [usersData, historyData] = await Promise.all([
                store.getUsers(),
                store.getLeaderboardHistory()
            ]);
            setUsers([...usersData].sort((a, b) => b.xp - a.xp));
            setHistory(historyData);
        };
        fetch();
    }, []);

    const lastWeekWinner = history.find(h => h.period === 'week');
    const lastMonthWinner = history.find(h => h.period === 'month');

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 fill-yellow-400" size={24} />;
            case 1: return <Medal className="text-gray-400 fill-gray-400" size={24} />;
            case 2: return <Award className="text-amber-600 fill-amber-600" size={24} />;
            default: return <span className="text-gray-400 font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="p-4 space-y-8 pb-24">
            <header className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                        <p className="text-gray-500">Who's winning this week?</p>
                    </div>
                </div>

                {currentUser?.role === 'parent' && (
                    <div className="flex justify-start">
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to reset the weekly leaderboard? This will archive the current winner.')) {
                                    await store.resetLeaderboard();
                                    window.location.reload();
                                }
                            }}
                            className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Reset Weekly Scoreboard
                        </button>
                    </div>
                )}
            </header>

            {/* Historical Winners Grid */}
            {(lastWeekWinner || lastMonthWinner) && (
                <section className="grid grid-cols-2 gap-3">
                    {lastWeekWinner && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Last Week</span>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-amber-200 shadow-sm overflow-hidden">
                                {lastWeekWinner.user.avatar_url?.startsWith('http') ? (
                                    <img src={lastWeekWinner.user.avatar_url} className="w-full h-full object-cover" />
                                ) : lastWeekWinner.user.avatar_url}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{lastWeekWinner.user.name}</span>
                        </div>
                    )}
                    {lastMonthWinner && (
                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Last Month</span>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-indigo-200 shadow-sm overflow-hidden">
                                {lastMonthWinner.user.avatar_url?.startsWith('http') ? (
                                    <img src={lastMonthWinner.user.avatar_url} className="w-full h-full object-cover" />
                                ) : lastMonthWinner.user.avatar_url}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{lastMonthWinner.user.name}</span>
                        </div>
                    )}
                </section>
            )}

            <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Current Standings</h2>
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
