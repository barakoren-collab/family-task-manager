'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { Reward } from '@/types';
import { cn } from '@/lib/utils';
import { ShoppingBag, Lock, Plus, Pencil, Trash2, X, Check, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Activity } from '@/types';

export default function StorePage() {
    const { currentUser, refreshUsers } = useUser();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [suggestions, setSuggestions] = useState<Activity[]>([]);

    // State Management
    const [isAddingReward, setIsAddingReward] = useState(false);
    const [isSuggestingReward, setIsSuggestingReward] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [newReward, setNewReward] = useState<Partial<Reward>>({
        title: '',
        cost: 100,
        icon: '🎁'
    });

    const fetchData = async () => {
        const [r, a] = await Promise.all([
            store.getRewards(),
            store.getActivities()
        ]);
        setRewards(r);
        setSuggestions(a.filter(act => act.type === 'suggestion'));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePurchase = async (reward: Reward) => {
        if (!currentUser) return;
        if (currentUser.points < reward.cost) {
            alert("Not enough points!");
            return;
        }

        if (confirm(`Buy ${reward.title} for ${reward.cost} points?`)) {
            await store.updateUser({
                ...currentUser,
                points: currentUser.points - reward.cost,
                xp_spent: (currentUser.xp_spent || 0) + reward.cost
            });
            await store.addActivity({
                user_id: currentUser.id,
                type: 'purchase',
                details: `Purchased ${reward.title} for ${reward.cost} pts`
            });
            await refreshUsers();

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500']
            });
        }
    };

    const handleSaveReward = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReward.title || !newReward.cost) return;

        if (editingReward) {
            await store.updateReward(editingReward.id, newReward);
        } else {
            await store.addReward({
                id: Math.random().toString(36).substr(2, 9),
                title: newReward.title,
                cost: newReward.cost,
                icon: newReward.icon || '🎁'
            } as Reward);
        }

        setIsAddingReward(false);
        setEditingReward(null);
        setNewReward({ title: '', cost: 100, icon: '🎁' });
        fetchData();
    };

    const handleSuggestReward = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newReward.title || !newReward.cost) return;

        await store.addActivity({
            user_id: currentUser.id,
            type: 'suggestion',
            details: JSON.stringify({
                title: newReward.title,
                cost: newReward.cost,
                icon: newReward.icon || '🎁',
                userName: currentUser.name
            })
        });

        setIsSuggestingReward(false);
        setNewReward({ title: '', cost: 100, icon: '🎁' });
        alert("Suggestion sent to parents! 🚀");
        fetchData();
    };

    const handleApproveSuggestion = async (suggestion: Activity) => {
        try {
            const data = JSON.parse(suggestion.details);
            await store.addReward({
                id: Math.random().toString(36).substr(2, 9),
                title: data.title,
                cost: data.cost,
                icon: data.icon || '🎁'
            } as Reward);

            // Delete the suggestion activity (marking as handled)
            // Note: Since we don't have deleteActivity, we'll just ignore it for now or assume it's one-off
            // In a real app we'd update its status.
            fetchData();
        } catch (e) {
            console.error("Invalid suggestion data");
        }
    };

    const handleDeleteReward = async (id: string) => {
        if (confirm('Delete this reward?')) {
            await store.deleteReward(id);
            fetchData();
        }
    };

    const startEdit = (reward: Reward) => {
        setEditingReward(reward);
        setNewReward(reward);
        setIsAddingReward(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-4 space-y-8 pb-24">
            <header className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h1 className="text-2xl font-bold text-gray-900">Rewards Store</h1>
                        <div className="flex gap-2">
                            {currentUser?.role === 'parent' && !isAddingReward && (
                                <button
                                    onClick={() => setIsAddingReward(true)}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <Plus size={14} /> Add Reward
                                </button>
                            )}
                            {!isSuggestingReward && (
                                <button
                                    onClick={() => setIsSuggestingReward(true)}
                                    className="bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <MessageSquare size={14} /> Suggest Reward
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Spend your hard-earned points</p>
                </div>
                <div className="flex flex-col items-end pr-24 shrink-0">
                    <div className="bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full text-sm border border-amber-200">
                        {currentUser?.points || 0} pts
                    </div>
                </div>
            </header>

            {/* CREATE / EDIT / SUGGEST FORM */}
            {(isAddingReward || isSuggestingReward) && (
                <div className={cn(
                    "p-6 rounded-2xl shadow-sm border transition-all animate-in fade-in slide-in-from-top-4",
                    isSuggestingReward ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-gray-100"
                )}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold">
                            {isSuggestingReward ? '💡 Suggest a Reward' : (editingReward ? '✏️ Edit Reward' : '✨ Add New Reward')}
                        </h2>
                        <button
                            onClick={() => {
                                setIsAddingReward(false);
                                setIsSuggestingReward(false);
                                setEditingReward(null);
                                setNewReward({ title: '', cost: 100, icon: '🎁' });
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={isSuggestingReward ? handleSuggestReward : handleSaveReward} className="space-y-4">
                        <section>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Choose an Icon</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                                {['🎁', '🎮', '🍕', '🍦', '🍿', '🎬', '🧸', '🚲', '⚽', '🍭', '📚', '🎒', '💸', '🏆', '🌟', '🦄'].map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setNewReward({ ...newReward, icon: emoji })}
                                        className={cn(
                                            "text-2xl p-2 rounded-xl transition-all border-2",
                                            newReward.icon === emoji
                                                ? "bg-indigo-50 border-indigo-500 scale-110 shadow-sm"
                                                : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                                        )}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Custom</label>
                                <input
                                    type="text"
                                    value={newReward.icon}
                                    onChange={e => setNewReward({ ...newReward, icon: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white text-center text-2xl"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newReward.title}
                                    onChange={e => setNewReward({ ...newReward, title: e.target.value })}
                                    placeholder="e.g. Movie Night"
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proposed Cost (Points)</label>
                            <input
                                type="number"
                                value={newReward.cost}
                                onChange={e => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                            {isSuggestingReward ? <MessageSquare size={18} /> : (editingReward ? <Check size={18} /> : <Plus size={18} />)}
                            {isSuggestingReward ? 'Send Suggestion' : (editingReward ? 'Update Reward' : 'Create Reward')}
                        </button>
                    </form>
                </div>
            )}

            {/* SUGGESTIONS LIST (Parent Only) */}
            {currentUser?.role === 'parent' && suggestions.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <MessageSquare size={14} /> Pending Suggestions
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {suggestions.map(s => {
                            let data;
                            try { data = JSON.parse(s.details); } catch (e) { return null; }
                            return (
                                <div key={s.id} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{data.icon}</span>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{data.title}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase">{data.userName} suggested for {data.cost} pts</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApproveSuggestion(s)}
                                            className="bg-white p-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button className="bg-white p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 transition-all shadow-sm">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Available Rewards</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map(reward => {
                        const canAfford = (currentUser?.points || 0) >= reward.cost;
                        const isParent = currentUser?.role === 'parent';

                        return (
                            <div key={reward.id} className="relative group">
                                <button
                                    onClick={() => !isParent && handlePurchase(reward)}
                                    disabled={!canAfford && !isParent}
                                    className={cn(
                                        "w-full flex flex-col items-center p-4 rounded-2xl border transition-all text-center relative overflow-hidden",
                                        (canAfford || isParent)
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
                                        (canAfford || isParent) ? "text-indigo-600 bg-indigo-50" : "text-gray-400 bg-gray-200"
                                    )}>
                                        {reward.cost} pts
                                    </div>

                                    {!canAfford && !isParent && (
                                        <div className="absolute top-2 right-2 text-gray-300">
                                            <Lock size={16} />
                                        </div>
                                    )}
                                </button>

                                {isParent && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(reward)}
                                            className="p-1.5 bg-white shadow-md rounded-lg text-gray-400 hover:text-indigo-600"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReward(reward.id)}
                                            className="p-1.5 bg-white shadow-md rounded-lg text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {rewards.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 italic">
                        No rewards available yet.
                    </div>
                )}
            </section>
        </div>
    );
}
