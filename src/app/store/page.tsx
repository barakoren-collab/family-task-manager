'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { Reward } from '@/types';
import { cn } from '@/lib/utils';
import { ShoppingBag, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function StorePage() {
    const { currentUser, refreshUsers } = useUser();
    const [rewards, setRewards] = useState<Reward[]>([]);

    useEffect(() => {
        const fetch = async () => {
            setRewards(await store.getRewards());
        };
        fetch();
    }, []);

    const handlePurchase = async (reward: Reward) => {
        if (!currentUser) return;
        if (currentUser.points < reward.cost) {
            alert("Not enough points!");
            return;
        }

        if (confirm(`Buy ${reward.title} for ${reward.cost} points?`)) {
            // Deduct points
            await store.updateUser({
                ...currentUser,
                points: currentUser.points - reward.cost
            });
            await refreshUsers(); // Refresh context to update UI

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500'] // Gold colors
            });
        }
    };

    return (
        <div className="p-4 space-y-6">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rewards Store</h1>
                    <p className="text-gray-500">Spend your hard-earned points</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
                    {currentUser?.points || 0} pts
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {rewards.map(reward => {
                    const canAfford = (currentUser?.points || 0) >= reward.cost;
                    return (
                        <button
                            key={reward.id}
                            onClick={() => handlePurchase(reward)}
                            disabled={!canAfford}
                            className={cn(
                                "flex flex-col items-center p-4 rounded-2xl border transition-all text-center relative overflow-hidden",
                                canAfford
                                    ? "bg-white border-gray-200 shadow-sm hover:border-indigo-300 active:scale-95"
                                    : "bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed"
                            )}
                        >
                            <div className="bg-indigo-50 text-3xl w-16 h-16 rounded-full flex items-center justify-center mb-3">
                                {reward.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{reward.title}</h3>
                            <div className={cn(
                                "font-bold text-sm px-2 py-0.5 rounded-md",
                                canAfford ? "text-indigo-600 bg-indigo-50" : "text-gray-400 bg-gray-200"
                            )}>
                                {reward.cost} pts
                            </div>

                            {!canAfford && (
                                <div className="absolute top-2 right-2 text-gray-300">
                                    <Lock size={16} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
