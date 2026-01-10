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

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    const refreshUsers = async () => {
        const fetchedUsers = await store.getUsers();
        setUsers(fetchedUsers);
    };

    useEffect(() => {
        refreshUsers();
        // Auto-login first user for dev convenience if needed, but better to let user pick
        // const allUsers = store.getUsers();
        // if (allUsers.length > 0) setCurrentUser(allUsers[0]);
    }, []);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, users, refreshUsers }}>
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
