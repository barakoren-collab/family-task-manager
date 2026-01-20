import { supabase } from './supabase';
import { User, Task, Reward, Activity, Consequence, Notification } from '@/types';

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

        if (error) {
            console.error('Error updating user:', error.message, error.details, error.hint);
        }
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
            console.error('Error fetching rewards:', error);
            return [];
        }
        return data as Reward[];
    }

    async addReward(reward: Reward) {
        const { error } = await supabase.from('rewards').insert(reward);
        if (error) console.error('Error adding reward:', error);
    }

    async updateReward(rewardId: string, updates: Partial<Reward>) {
        const { error } = await supabase
            .from('rewards')
            .update(updates)
            .eq('id', rewardId);
        if (error) console.error('Error updating reward:', error);
    }

    async deleteReward(rewardId: string) {
        const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
        if (error) console.error('Error deleting reward:', error);
    }

    // LEADERBOARD HISTORY
    async getLeaderboardHistory(): Promise<any[]> {
        const { data, error } = await supabase
            .from('leaderboard_history')
            .select('*, user:users(*)')
            .order('period_end', { ascending: false });

        if (error || !data || data.length === 0) {
            // Fallback for demo/empty state
            const users = await this.getUsers();
            if (users.length < 2) return [];
            return [
                { period: 'week', user: users[0], award_date: new Date().toISOString() },
                { period: 'month', user: users[1] || users[0], award_date: new Date().toISOString() }
            ];
        }
        return data;
    }

    async addActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
        const { error } = await supabase.from('activities').insert({
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
        });
        if (error) console.error('Error adding activity:', error);
    }

    async getActivities(): Promise<Activity[]> {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching activities:', error.message, error.details, error.hint);
            return [];
        }
        return data as Activity[];
    }

    // CONSEQUENCES
    async getConsequences(): Promise<Consequence[]> {
        const { data, error } = await supabase
            .from('consequences')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching consequences:', error);
            return [];
        }
        return data as Consequence[];
    }

    async addConsequence(consequence: Consequence) {
        const { error } = await supabase.from('consequences').insert(consequence);
        if (error) console.error('Error adding consequence:', error);
    }

    async updateConsequence(consequenceId: string, updates: Partial<Consequence>) {
        const { error } = await supabase
            .from('consequences')
            .update(updates)
            .eq('id', consequenceId);
        if (error) console.error('Error updating consequence:', error);
    }

    async deleteConsequence(consequenceId: string) {
        const { error } = await supabase.from('consequences').delete().eq('id', consequenceId);
        if (error) console.error('Error deleting consequence:', error);
    }

    // NOTIFICATIONS
    async getNotifications(userId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data as Notification[];
    }

    async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
        const { error } = await supabase.from('notifications').insert({
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
        });
        if (error) console.error('Error creating notification:', error);
    }

    async markNotificationAsRead(notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        if (error) console.error('Error marking notification as read:', error);
    }

    async markAllNotificationsAsRead(userId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        if (error) console.error('Error marking all notifications as read:', error);
    }

    async deleteNotification(notificationId: string) {
        const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
        if (error) console.error('Error deleting notification:', error);
    }

    async resetLeaderboard() {
        const { data: users, error: fetchError } = await supabase.from('users').select('*');
        if (fetchError || !users) return;

        // Find the winner (highest XP)
        const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);
        const winner = sortedUsers[0];

        if (winner && winner.xp > 0) {
            // Archive the winner
            await supabase.from('leaderboard_history').insert({
                period: 'week',
                user_id: winner.id,
                xp_at_end: winner.xp,
                period_end: new Date().toISOString()
            });
        }

        // Reset weekly XP for all users
        const updates = users.map(u => ({ ...u, xp: 0 }));
        const { error: updateError } = await supabase.from('users').upsert(updates);
        if (updateError) console.error('Error resetting leaderboard:', updateError);
    }
    async resetDailyTasks() {
        // Reset all recurring tasks to pending with 0 progress
        // This runs nightly via Cron
        const { error } = await supabase
            .from('tasks')
            .update({
                status: 'pending',
                current_count: 0,
                completed_by: null // Clear who completed it
            })
            .eq('is_recurring', true);

        if (error) console.error('Error resetting daily tasks:', error);
    }
}

export const store = new SupabaseService();
