'use client';

import { useState } from 'react';
import { useUser } from './UserContext';
import { store } from '@/lib/store';
import { X, Lock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { currentUser, setCurrentUser, users, refreshUsers } = useUser();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!currentUser) return null;

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 3) {
            setErrorMessage('Password must be at least 3 characters');
            setStatus('error');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            setStatus('error');
            return;
        }

        setStatus('loading');
        try {
            const updatedUser = await store.updateUser({
                ...currentUser,
                password: newPassword
            });
            if (updatedUser) {
                setCurrentUser(updatedUser);
                setStatus('success');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    setStatus('idle');
                    onClose();
                }, 2000);
            } else {
                throw new Error('Failed to update password');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Something went wrong. Try again.');
        }
    };

    const handleSignOut = () => {
        setCurrentUser(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 mb-4 shadow-sm">
                                    {currentUser.avatar_url?.startsWith('http') ? (
                                        <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-4xl">{currentUser.avatar_url}</div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                                <p className="text-gray-500 text-sm capitalize">{currentUser.role} Account</p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Change Your PIN</h3>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="New PIN"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (status === 'error') setStatus('idle');
                                            }}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Confirm New PIN"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (status === 'error') setStatus('idle');
                                            }}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <p className="flex items-center gap-2 text-red-500 text-xs font-medium">
                                        <AlertCircle size={14} /> {errorMessage}
                                    </p>
                                )}

                                {status === 'success' && (
                                    <p className="flex items-center gap-2 text-green-500 text-xs font-medium">
                                        <CheckCircle size={14} /> PIN updated successfully!
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-md text-sm",
                                        status === 'loading' ? "bg-indigo-400 cursor-wait" :
                                            status === 'success' ? "bg-green-500" :
                                                "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                    )}
                                >
                                    {status === 'loading' ? 'Updating...' :
                                        status === 'success' ? 'Updated!' : 'Update PIN'}
                                </button>
                            </form>

                            {/* FAMILY MANAGEMENT FOR PARENTS */}
                            {currentUser.role === 'parent' && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Manage Family PINs</h3>
                                    <div className="space-y-3">
                                        {users.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm shrink-0">
                                                        {user.avatar_url?.startsWith('http') ? (
                                                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-xs font-bold">{user.avatar_url}</div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]">{user.name}</span>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        const newPwd = prompt(`Enter new PIN for ${user.name}:`, user.password);
                                                        if (newPwd && newPwd.length >= 3) {
                                                            await store.updateUser({ ...user, password: newPwd });
                                                            alert(`${user.name}'s PIN updated!`);
                                                            refreshUsers();
                                                        } else if (newPwd !== null) {
                                                            alert('PIN must be at least 3 characters.');
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold transition-colors text-sm"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
