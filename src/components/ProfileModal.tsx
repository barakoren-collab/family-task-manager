'use client';

import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { store } from '@/lib/store';
import { X, Lock, CheckCircle, AlertCircle, LogOut, Edit2, Save, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AVATAR_COLORS = [
    '#4f46e5', // Indigo
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#0ea5e9', // Sky
    '#ec4899', // Pink
    '#ef4444', // Red
];

const PRESET_AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐲', '👻', '👽', '🤖'];

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { currentUser, setCurrentUser, users, refreshUsers } = useUser();

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editAvatar, setEditAvatar] = useState('');

    // PIN Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            setEditName(currentUser.name);
            setEditColor(currentUser.color || '#4f46e5');
            setEditAvatar(currentUser.avatar_url || '');
            setIsEditing(false);
        }
    }, [currentUser, isOpen]);

    if (!currentUser) return null;

    const handleSaveProfile = async () => {
        setStatus('loading');
        try {
            const updatedUser = await store.updateUser({
                ...currentUser,
                name: editName,
                color: editColor,
                avatar_url: editAvatar
            });
            if (updatedUser) {
                setCurrentUser(updatedUser);
                setIsEditing(false);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 2000);
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Failed to save profile');
        }
    };

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
                }, 2000);
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
                        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="flex flex-col items-center mb-6 relative">
                                <div className="mb-4 relative group">
                                    <UserAvatar
                                        user={isEditing ? { ...currentUser, avatar_url: editAvatar, color: editColor } : currentUser}
                                        size="3xl"
                                        showBorder
                                    />
                                </div>

                                {isEditing ? (
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-200 focus:border-indigo-600 focus:outline-none text-center bg-transparent w-full"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                                        <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-indigo-600">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="mt-2">
                                    <RoleBadge role={currentUser.role} />
                                </div>
                            </div>

                            {/* EDIT MODE CONTROLS */}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-2xl">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                                                    <Palette size={12} /> Theme Color
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {AVATAR_COLORS.map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setEditColor(c)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                                                editColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                                                            )}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Avatar</label>
                                                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1">
                                                    {PRESET_AVATARS.map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => setEditAvatar(emoji)}
                                                            className={cn(
                                                                "w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-white transition-colors",
                                                                editAvatar === emoji ? "bg-white shadow-sm ring-1 ring-indigo-200" : ""
                                                            )}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="mt-2">
                                                    <input
                                                        placeholder="Or paste image URL..."
                                                        value={editAvatar}
                                                        onChange={(e) => setEditAvatar(e.target.value)}
                                                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={status === 'loading'}
                                                    className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                                                >
                                                    <Save size={16} /> Save
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isEditing && (
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
                                            <CheckCircle size={14} /> Changes saved successfully!
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
                                        {status === 'loading' ? 'Saving...' :
                                            status === 'success' ? 'Saved!' : 'Update PIN'}
                                    </button>
                                </form>
                            )}

                            {/* FAMILY MANAGEMENT FOR PARENTS */}
                            {currentUser.role === 'parent' && !isEditing && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Manage Family</h3>
                                    <div className="space-y-3">
                                        {users.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar user={user} size="sm" />
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
