'use client';

import { useUser } from '@/components/UserContext';
import { store } from '@/lib/store';
import { User, Task } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminPage() {
    const { currentUser, users } = useUser();
    const router = useRouter();

    // Form State
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(10);
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
    const [requiredCount, setRequiredCount] = useState(1);

    // Multi-select state
    const [selectedKids, setSelectedKids] = useState<string[]>([]); // Empty = Unassigned

    const [isEditing, setIsEditing] = useState<string | null>(null);

    // Penalty State
    const [penaltyReason, setPenaltyReason] = useState('');
    const [penaltyPoints, setPenaltyPoints] = useState(50);
    const [penaltyTarget, setPenaltyTarget] = useState('');

    // Data State
    const [allTasks, setAllTasks] = useState<Task[]>([]);

    const refreshTasks = async () => {
        const tasks = await store.getTasks();
        setAllTasks(tasks);
    };

    useEffect(() => {
        refreshTasks();
    }, []);

    if (!currentUser || currentUser.role !== 'parent') {
        return (
            <div className="p-8 text-center text-gray-500">
                Only parents can see this page! 🔒
            </div>
        );
    }

    const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        if (isEditing) {
            // Update existing (Single task mode)
            await store.updateTask(isEditing, {
                title,
                points_reward: Number(points),
                is_recurring: recurrence !== 'none',
                recurrence_pattern: recurrence === 'none' ? undefined : recurrence,
                required_count: Number(requiredCount),
            });
            alert('Task Updated!');
            setIsEditing(null);
        } else {
            // Create Logic
            if (selectedKids.length === 0) {
                // Create Single Unassigned Task
                await createTask('unassigned');
                alert('Created 1 Unassigned Task');
            } else {
                // Create copy for each selected kid
                // Use Promise.all for parallel creation
                await Promise.all(selectedKids.map(kidId => createTask(kidId)));
                alert(`Created tasks for ${selectedKids.length} kid(s)!`);
            }
        }

        // Reset Form
        setTitle('');
        setPoints(10);
        setRecurrence('none');
        setRequiredCount(1);
        setSelectedKids([]);
        refreshTasks();
    };

    const createTask = async (assignee: string) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            points_reward: Number(points),
            assigned_to: assignee,
            status: 'pending',
            is_recurring: recurrence !== 'none',
            recurrence_pattern: recurrence === 'none' ? undefined : recurrence,
            required_count: Number(requiredCount),
            current_count: 0,
            created_by: currentUser.id,
            created_at: new Date().toISOString(),
        };
        await store.addTask(newTask);
    };

    const handleEditClick = (task: Task) => {
        setIsEditing(task.id);
        setTitle(task.title);
        setPoints(task.points_reward);
        setRecurrence(task.recurrence_pattern || 'none');
        setRequiredCount(task.required_count || 1);
        // For editing, we just set the array to the single assignee
        setSelectedKids(task.assigned_to === 'unassigned' ? [] : [task.assigned_to]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await store.deleteTask(taskId);
            refreshTasks();
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setTitle('');
        setPoints(10);
        setRecurrence('none');
        setRequiredCount(1);
        setSelectedKids([]);
    };

    const toggleKid = (kidId: string) => {
        if (selectedKids.includes(kidId)) {
            setSelectedKids(selectedKids.filter(id => id !== kidId));
        } else {
            setSelectedKids([...selectedKids, kidId]);
        }
    };

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

    const toggleAll = () => {
        const allKidIds = users.filter(u => u.role === 'kid').map(u => u.id);
        if (selectedKids.length === allKidIds.length) {
            setSelectedKids([]); // Deselect all
        } else {
            setSelectedKids(allKidIds); // Select all
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-gray-500">Create tasks and manage the family.</p>
            </header>

            {/* CREATE / EDIT FORM */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isEditing ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                {/* ... existing form content ... */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                    {isEditing && (
                        <button onClick={handleCancelEdit} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X size={14} /> Cancel
                        </button>
                    )}
                </div>

                <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
                    {/* ... Inputs ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Empty Dishwasher"
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                        <input
                            type="number"
                            value={points}
                            onChange={e => setPoints(Number(e.target.value))}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                                <select
                                    value={recurrence}
                                    onChange={e => setRecurrence(e.target.value as any)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="none">One-off</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Times</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={requiredCount}
                                    onChange={e => setRequiredCount(Number(e.target.value))}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                {!isEditing && (
                                    <button type="button" onClick={toggleAll} className="text-xs text-indigo-600 font-bold">
                                        {selectedKids.length === users.filter(u => u.role === 'kid').length ? 'Clear All' : 'Select All'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {users.filter(u => u.role === 'kid').map(user => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => toggleKid(user.id)}
                                        disabled={!!isEditing} // Disable changing assignee in edit mode for simplicity in this version
                                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${selectedKids.includes(user.id) ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 bg-white'
                                            } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>
                                            {user.avatar_url?.startsWith('http') ? (
                                                <img src={user.avatar_url} className="w-6 h-6 rounded-full object-cover" />
                                            ) : user.avatar_url}
                                        </span>
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedKids.length === 0 && (
                                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                    ⚠️ Task will be <strong>Unassigned</strong> (First to grab it)
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!title}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isEditing ? <Check size={20} /> : null}
                            {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>

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

            {/* EXISTING TASKS LIST */}
            <div className="space-y-4">
                <h2 className="font-bold text-gray-900 border-t pt-6">Manage Tasks</h2>
                {allTasks.length === 0 ? (
                    <p className="text-gray-400 text-center italic">No tasks created yet.</p>
                ) : (
                    <div className="space-y-3">
                        {allTasks.map(task => {
                            const assignee = users.find(u => u.id === task.assigned_to);
                            return (
                                <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className="font-bold text-indigo-600">{task.points_reward} XP</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                {assignee?.avatar_url?.startsWith('http') ? (
                                                    <img src={assignee.avatar_url} className="w-4 h-4 rounded-full object-cover" />
                                                ) : (
                                                    <span>{assignee?.avatar_url || '👤'}</span>
                                                )}
                                                {assignee?.name || 'Unknown'}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">{task.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(task)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(task.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
