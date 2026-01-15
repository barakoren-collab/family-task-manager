export type UserRole = 'parent' | 'kid';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
    xp: number;         // Current weekly XP
    points: number;     // Spendable points
    total_xp: number;   // Lifetime XP
    xp_spent: number;   // Total XP/Points spent (optional but useful)
    level: number;
    password?: string;
}

export type TaskStatus = 'pending' | 'completed' | 'approved';

export interface Task {
    id: string;
    title: string;
    description?: string;
    points_reward: number;
    assigned_to: string | 'unassigned' | 'all'; // User ID, 'unassigned', or 'all'
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

export interface Consequence {
    id: string;
    title: string;
    points_deduction: number;
    created_at: string;
}

export interface Activity {
    id: string;
    user_id: string;
    type: 'task_complete' | 'levelup' | 'purchase' | 'suggestion';
    details: string;
    created_at: string;
}

export type NotificationType = 'task_completed' | 'task_assigned' | 'leaderboard_change' | 'consequence_applied' | 'task_approved';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    related_id?: string; // Optional reference to task/user/etc
}
