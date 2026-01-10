'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { User, Task } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Check, Lock } from 'lucide-react';

export default function AdminPage() {
    const { currentUser, users } = useUser();
    const router = useRouter();

    // Penalty State
    const [penaltyReason, setPenaltyReason] = useState('');
    const [penaltyPoints, setPenaltyPoints] = useState(50);
    const [penaltyTarget, setPenaltyTarget] = useState('');

    if (!currentUser || currentUser.role !== 'parent') {
        return (
            <div className="p-8 text-center text-gray-500">
                Only parents can see this page! 🔒
            </div>
        );
    }

    const handleApplyPenalty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!penaltyReason || !penaltyTarget || !penaltyPoints) return;

        const targetUser = users.find(u => u.id === penaltyTarget);
        if (!targetUser) return;

        // Apply deduction (negative points)
        const newPoints = targetUser.points - penaltyPoints;
        await store.updateUser({
            ...targetUser,
            points: newPoints
        });

        alert(`Deducted ${penaltyPoints} points from ${targetUser.name} for "${penaltyReason}"`);

        // Reset
        setPenaltyReason('');
        setPenaltyPoints(50);
        setPenaltyTarget('');
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-gray-500">Manage the family and handle penalties.</p>
            </header>

            {/* PENALTY SECTION */}
            <div className="p-6 rounded-2xl shadow-sm border border-red-100 bg-red-50/50">
                <h2 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                    <Trash2 size={20} /> Give Penalty
                </h2>
                <form onSubmit={handleApplyPenalty} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-red-900 mb-1">Reason</label>
                        <input
                            type="text"
                            value={penaltyReason}
                            onChange={e => setPenaltyReason(e.target.value)}
                            placeholder="e.g. Phone after 8pm"
                            className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-red-900 mb-1">Kid</label>
                            <select
                                value={penaltyTarget}
                                onChange={e => setPenaltyTarget(e.target.value)}
                                className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">Select Kid...</option>
                                {users.filter(u => u.role === 'kid').map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-red-900 mb-1">Points</label>
                            <input
                                type="number"
                                min={1}
                                value={penaltyPoints}
                                onChange={e => setPenaltyPoints(Number(e.target.value))}
                                className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-600 font-bold"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!penaltyReason || !penaltyTarget}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply Penalty (-{penaltyPoints} pts)
                    </button>
                </form>
            </div>

            {/* MANAGE FAMILY SECTION */}
            <div className="p-6 rounded-2xl shadow-sm border border-indigo-100 bg-white">
                <h2 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Check size={20} className="text-indigo-600" /> Manage Family Passwords
                </h2>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    {user.avatar_url?.startsWith('http') ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-xl">{user.avatar_url}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase mt-1">{user.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const newPwd = prompt(`Enter new password for ${user.name}:`, user.password);
                                    if (newPwd && newPwd.length >= 3) {
                                        await store.updateUser({ ...user, password: newPwd });
                                        alert(`${user.name}'s password updated!`);
                                    } else if (newPwd !== null) {
                                        alert('Password must be at least 3 characters.');
                                    }
                                }}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-1 shadow-sm"
                            >
                                <Lock size={12} /> Reset
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
