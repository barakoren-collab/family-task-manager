import { supabase } from './supabase';
import { User, Task, Reward } from '@/types';

// Fallback Mock Data for initial load before DB connection if needed, 
// strictly not used if Supabase is connected, but types are useful.

class SupabaseService {

    // USERS
    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase.from('users').select('*').order('name');
        if (error) {
            console.error('Error fetching users:', error);
            console.warn('Check server console for Supabase initialization warnings if locally running.');
            return [];
        }
        return data as User[];
    }

    async updateUser(user: User): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .update(user)
            .eq('id', user.id)
            .select()
            .single();

        if (error) console.error('Error updating user:', error);
        return data as User;
    }

    // TASKS
    async getTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
        return data as Task[];
    }

    async addTask(task: Task) {
        const { error } = await supabase.from('tasks').insert(task);
        if (error) console.error('Error adding task:', error);
    }

    async updateTask(taskId: string, updates: Partial<Task>) {
        const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId);

        if (error) console.error('Error updating task:', error);
    }

    async deleteTask(taskId: string) {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) console.error('Error deleting task:', error);
    }

    // REWARDS
    async getRewards(): Promise<Reward[]> {
        const { data, error } = await supabase.from('rewards').select('*');
        if (error) {
            // Return defaults if empty (first run) or error
            return [
                { id: 'r1', title: '1 Hour TV', cost: 100, icon: '📺' },
                { id: 'r2', title: 'Ice Cream', cost: 500, icon: '🍦' },
            ];
        }
        return data as Reward[];
    }
}

export const store = new SupabaseService();
