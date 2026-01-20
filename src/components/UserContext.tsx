'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { store } from '@/lib/store';

interface UserContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    users: User[];
    refreshUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'family_task_manager_user_id';

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    const handleSetUser = (user: User | null) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, user.id);
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    };

    const refreshUsers = async () => {
        const fetchedUsers = await store.getUsers();
        setUsers(fetchedUsers);

        // Restore session if exists and consistent
        const storedId = localStorage.getItem(USER_STORAGE_KEY);
        if (storedId && !currentUser) {
            const found = fetchedUsers.find(u => u.id === storedId);
            if (found) setCurrentUser(found);
        }
    };

    useEffect(() => {
        refreshUsers();
    }, []);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, users, refreshUsers }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
