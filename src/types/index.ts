export type UserRole = 'parent' | 'kid';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
    xp: number;
    points: number;
    level: number;
    password?: string;
}

export type TaskStatus = 'pending' | 'completed' | 'approved';

export interface Task {
    id: string;
    title: string;
    description?: string;
    points_reward: number;
    assigned_to: string | 'unassigned'; // User ID or 'unassigned'
    status: TaskStatus;
    is_recurring: boolean;
    recurrence_pattern?: 'daily' | 'weekly';
    required_count: number; // How many times (e.g. 2 for "Brush Teeth twice")
    current_count: number;
    created_by: string; // User ID
    created_at: string;
}

export interface Reward {
    id: string;
    title: string;
    cost: number;
    icon?: string;
}

export interface Activity {
    id: string;
    user_id: string;
    type: 'task_complete' | 'levelup' | 'purchase';
    details: string;
    created_at: string;
}
