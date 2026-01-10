'use client';

import { TaskCard } from '@/components/TaskCard';
import { store } from '@/lib/store';
import { Task } from '@/types';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserContext';
import { Pencil, Trash2, X, Check, Plus } from 'lucide-react';

export default function TasksPage() {
    const { currentUser, users } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Management State
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(10);
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
    const [requiredCount, setRequiredCount] = useState(1);
    const [selectedKids, setSelectedKids] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);

    const refreshTasks = async () => {
        setTasks(await store.getTasks());
    };

    useEffect(() => {
        refreshTasks();
    }, []);

    const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !currentUser) return;

        if (isEditing) {
            await store.updateTask(isEditing, {
                title,
                points_reward: Number(points),
                is_recurring: recurrence !== 'none',
                recurrence_pattern: recurrence === 'none' ? undefined : recurrence,
                required_count: Number(requiredCount),
            });
            setIsEditing(null);
        } else {
            if (selectedKids.length === 0) {
                await createTask('unassigned');
            } else {
                await Promise.all(selectedKids.map(kidId => createTask(kidId)));
            }
        }

        // Reset
        setTitle('');
        setPoints(10);
        setRecurrence('none');
        setRequiredCount(1);
        setSelectedKids([]);
        setIsAddingTask(false);
        refreshTasks();
    };

    const createTask = async (assignee: string) => {
        if (!currentUser) return;
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
        setIsAddingTask(true);
        setTitle(task.title);
        setPoints(task.points_reward);
        setRecurrence(task.recurrence_pattern || 'none');
        setRequiredCount(task.required_count || 1);
        setSelectedKids(task.assigned_to === 'unassigned' ? [] : [task.assigned_to]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await store.deleteTask(taskId);
            refreshTasks();
        }
    };

    const toggleKid = (kidId: string) => {
        if (selectedKids.includes(kidId)) {
            setSelectedKids(selectedKids.filter(id => id !== kidId));
        } else {
            setSelectedKids([...selectedKids, kidId]);
        }
    };

    const toggleAll = () => {
        const allKidIds = users.filter(u => u.role === 'kid').map(u => u.id);
        if (selectedKids.length === allKidIds.length) {
            setSelectedKids([]);
        } else {
            setSelectedKids(allKidIds);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="flex justify-between items-start mb-6 pr-14">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500">Everything that needs doing.</p>
                </div>
                {currentUser?.role === 'parent' && !isAddingTask && (
                    <button
                        onClick={() => setIsAddingTask(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all font-bold text-sm shrink-0 mt-1"
                    >
                        <Plus size={18} /> Add Task
                    </button>
                )}
            </header>

            {/* CREATE / EDIT FORM (Parent Only) */}
            {currentUser?.role === 'parent' && isAddingTask && (
                <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isEditing ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                        <button
                            onClick={() => {
                                setIsAddingTask(false);
                                setIsEditing(null);
                                setTitle('');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X size={14} /> Close
                        </button>
                    </div>

                    <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={e => setPoints(Number(e.target.value))}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                            <div>
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

                        {!isEditing && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                    <button type="button" onClick={toggleAll} className="text-xs text-indigo-600 font-bold">
                                        {selectedKids.length === users.filter(u => u.role === 'kid').length ? 'Clear All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {users.filter(u => u.role === 'kid').map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => toggleKid(user.id)}
                                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedKids.includes(user.id) ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                                {user.avatar_url?.startsWith('http') ? (
                                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-xs">{user.avatar_url}</div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium truncate">{user.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!title}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isEditing ? <Check size={20} /> : null}
                            {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map(task => (
                    <div key={task.id} className="relative group">
                        <TaskCard task={task} />

                        {currentUser?.role === 'parent' && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditClick(task)}
                                    className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-gray-500 hover:text-indigo-600 hover:scale-105 transition-all"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(task.id)}
                                    className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-gray-500 hover:text-red-600 hover:scale-105 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 italic bg-white rounded-3xl border border-dashed border-gray-200">
                        No tasks yet. {currentUser?.role === 'parent' ? 'Click the + to add one!' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}
