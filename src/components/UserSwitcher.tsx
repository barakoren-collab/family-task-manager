'use client';

import { useUser } from './UserContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User } from '@/types';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { Lock, ArrowRight, X } from 'lucide-react';

export function UserSwitcher() {
    const { users, setCurrentUser } = useUser();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (selectedUser.password && password === selectedUser.password) {
            setCurrentUser(selectedUser);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const handleSelectUser = (user: User) => {
        if (!user.password) {
            setCurrentUser(user);
            return;
        }
        setSelectedUser(user);
        setPassword('');
        setError(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">

            <AnimatePresence mode="wait">
                {!selectedUser ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full max-w-sm"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h1>
                            <p className="text-gray-500">Select your profile to start.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            {users.map((user) => (
                                <motion.button
                                    key={user.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelectUser(user)}
                                    className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-100 ring-4 ring-transparent hover:ring-indigo-50 transition-all relative overflow-hidden group"
                                >
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        <UserAvatar user={user} size="2xl" showBorder />
                                    </div>
                                    <span className="font-bold text-gray-800 text-lg mb-1">{user.name}</span>
                                    <RoleBadge role={user.role} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm relative"
                    >
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center mb-8 mt-2">
                            <div className="mb-4">
                                <UserAvatar user={selectedUser} size="3xl" showBorder />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Hello, {selectedUser.name}!</h2>
                            <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={cn(
                                        "w-full pl-11 pr-4 py-4 rounded-2xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 transition-all text-lg",
                                        error
                                            ? "border-red-300 ring-red-100 placeholder:text-red-300"
                                            : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    )}
                                    autoFocus
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">Incorrect password</p>}

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
                            >
                                Sign In <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
