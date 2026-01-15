'use client';

import { TaskCard } from '@/components/TaskCard';
import { store } from '@/lib/store';
import { Task, Consequence } from '@/types';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserContext';
import { Pencil, Trash2, X, Check, Plus, AlertCircle, Ban } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TasksPage() {
    const { currentUser, users, refreshUsers } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [consequences, setConsequences] = useState<Consequence[]>([]);

    // Management State
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isAddingConsequence, setIsAddingConsequence] = useState(false);

    // Task Form State
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(10);
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
    const [requiredCount, setRequiredCount] = useState(1);
    const [selectedKids, setSelectedKids] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);

    // Consequence Form State
    const [consequenceTitle, setConsequenceTitle] = useState('');
    const [consequenceDeduction, setConsequenceDeduction] = useState(50);
    const [isEditingConsequence, setIsEditingConsequence] = useState<string | null>(null);

    const refreshData = async () => {
        const [fetchedTasks, fetchedConsequences] = await Promise.all([
            store.getTasks(),
            store.getConsequences()
        ]);

        if (currentUser?.role === 'kid') {
            setTasks(fetchedTasks.filter((t: Task) =>
                t.assigned_to === currentUser.id ||
                t.assigned_to === 'unassigned' ||
                t.assigned_to === 'all'
            ));
        } else {
            setTasks(fetchedTasks);
        }
        setConsequences(fetchedConsequences);
    };

    useEffect(() => {
        refreshData();
    }, [currentUser]);

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
            } else if (selectedKids.length === users.filter(u => u.role === 'kid').length) {
                await createTask('all');
            } else {
                await Promise.all(selectedKids.map(kidId => createTask(kidId)));
            }
        }

        setTitle('');
        setPoints(10);
        setRecurrence('none');
        setRequiredCount(1);
        setSelectedKids([]);
        setIsAddingTask(false);
        refreshData();
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

        // Create notification for assigned kid(s)
        if (assignee !== 'unassigned' && assignee !== 'all') {
            await store.createNotification({
                user_id: assignee,
                type: 'task_assigned',
                title: 'New Task Assigned!',
                message: `${title} - ${points} points`,
                is_read: false,
                related_id: newTask.id
            });
        } else if (assignee === 'all') {
            // Notify all kids
            const kids = users.filter(u => u.role === 'kid');
            for (const kid of kids) {
                await store.createNotification({
                    user_id: kid.id,
                    type: 'task_assigned',
                    title: 'New Task Assigned!',
                    message: `${title} - ${points} points`,
                    is_read: false,
                    related_id: newTask.id
                });
            }
        }
    };

    const handleCreateOrUpdateConsequence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consequenceTitle || !currentUser) return;

        if (isEditingConsequence) {
            await store.updateConsequence(isEditingConsequence, {
                title: consequenceTitle,
                points_deduction: Number(consequenceDeduction),
            });
            setIsEditingConsequence(null);
        } else {
            await store.addConsequence({
                id: Math.random().toString(36).substr(2, 9),
                title: consequenceTitle,
                points_deduction: Number(consequenceDeduction),
                created_at: new Date().toISOString()
            });
        }

        setConsequenceTitle('');
        setConsequenceDeduction(50);
        setIsAddingConsequence(false);
        refreshData();
    };

    const handleApplyConsequence = async (consequence: Consequence, targetUserId: string) => {
        const targetUser = users.find(u => u.id === targetUserId);
        if (!targetUser) return;

        if (confirm(`Apply "${consequence.title}" to ${targetUser.name}? (-${consequence.points_deduction} pts)`)) {
            await store.updateUser({
                ...targetUser,
                points: targetUser.points - consequence.points_deduction
            });

            await store.addActivity({
                user_id: targetUserId,
                type: 'suggestion', // Repurposing suggestion type or we could add 'consequence' type
                details: `Consequence Applied: ${consequence.title} (-${consequence.points_deduction} pts)`
            });

            // Create notification for the kid
            await store.createNotification({
                user_id: targetUserId,
                type: 'consequence_applied',
                title: 'Consequence Applied',
                message: `${consequence.title} - ${consequence.points_deduction} points deducted`,
                is_read: false,
                related_id: consequence.id
            });

            await refreshUsers();
            alert(`Consequence Applied to ${targetUser.name}!`);
        }
    };

    const handleEditTask = (task: Task) => {
        setIsEditing(task.id);
        setIsAddingTask(true);
        setIsAddingConsequence(false);
        setTitle(task.title);
        setPoints(task.points_reward);
        setRecurrence(task.recurrence_pattern || 'none');
        setRequiredCount(task.required_count || 1);
        setSelectedKids(task.assigned_to === 'unassigned' ? [] :
            (task.assigned_to === 'all' ? users.filter(u => u.role === 'kid').map(u => u.id) : [task.assigned_to]));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditConsequence = (consequence: Consequence) => {
        setIsEditingConsequence(consequence.id);
        setIsAddingConsequence(true);
        setIsAddingTask(false);
        setConsequenceTitle(consequence.title);
        setConsequenceDeduction(consequence.points_deduction);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await store.deleteTask(taskId);
            refreshData();
        }
    };

    const handleDeleteConsequence = async (consequenceId: string) => {
        if (confirm('Are you sure you want to delete this consequence?')) {
            await store.deleteConsequence(consequenceId);
            refreshData();
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

    const dailyTasks = tasks.filter(t => t.recurrence_pattern === 'daily');
    const weeklyTasks = tasks.filter(t => t.recurrence_pattern === 'weekly');
    const otherTasks = tasks.filter(t => t.recurrence_pattern !== 'daily' && t.recurrence_pattern !== 'weekly');

    return (
        <div className="p-4 space-y-8 pb-24">
            <header className="flex justify-between items-start pr-24">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks & Consequences</h1>
                    <p className="text-gray-500">Manage everything that needs doing (and what shouldn't have been done).</p>
                </div>
                {currentUser?.role === 'parent' && !isAddingTask && !isAddingConsequence && (
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => setIsAddingTask(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all font-bold text-xs shrink-0">
                            <Plus size={16} /> Add Task
                        </button>
                        <button onClick={() => setIsAddingConsequence(true)} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all font-bold text-xs shrink-0">
                            <AlertCircle size={16} /> Add Consequence
                        </button>
                    </div>
                )}
            </header>

            {/* TASK FORM */}
            {currentUser?.role === 'parent' && isAddingTask && (
                <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isEditing ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                        <button onClick={() => { setIsAddingTask(false); setIsEditing(null); setTitle(''); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X size={14} /> Close
                        </button>
                    </div>

                    <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Empty Dishwasher" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Times Required</label>
                                <input type="number" min={1} value={requiredCount} onChange={e => setRequiredCount(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                            <select value={recurrence} onChange={e => setRecurrence(e.target.value as any)} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
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
                                        {selectedKids.length === users.filter(u => u.role === 'kid').length ? 'Clear All' : 'Select All (Everyone)'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {users.filter(u => u.role === 'kid').map(user => (
                                        <button key={user.id} type="button" onClick={() => toggleKid(user.id)} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedKids.includes(user.id) ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 bg-white'}`}>
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                                {user.avatar_url?.startsWith('http') ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold">{user.avatar_url}</div>}
                                            </div>
                                            <span className="text-sm font-medium truncate">{user.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button type="submit" disabled={!title} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isEditing ? <Check size={20} /> : null} {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </form>
                </div>
            )}

            {/* PENALTY FORM */}
            {currentUser?.role === 'parent' && isAddingConsequence && (
                <div className={`p-6 rounded-2xl shadow-sm border border-red-100 transition-colors ${isEditingConsequence ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-red-900">{isEditingConsequence ? 'Edit Consequence' : 'Add New Consequence'}</h2>
                        <button onClick={() => { setIsAddingConsequence(false); setIsEditingConsequence(null); setConsequenceTitle(''); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X size={14} /> Close
                        </button>
                    </div>

                    <form onSubmit={handleCreateOrUpdateConsequence} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">Consequence Description</label>
                            <input type="text" value={consequenceTitle} onChange={e => setConsequenceTitle(e.target.value)} placeholder="e.g. Phone after 8pm" className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">Points to Deduct</label>
                            <input type="number" min={1} value={consequenceDeduction} onChange={e => setConsequenceDeduction(Number(e.target.value))} className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" />
                        </div>
                        <button type="submit" disabled={!consequenceTitle} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {isEditingConsequence ? 'Update Consequence' : 'Create Consequence'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-10">
                {/* PENALTIES LISTING */}
                {currentUser?.role === 'parent' && consequences.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="font-bold text-red-700 text-xs uppercase tracking-wider px-1">Consequence Definitions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {consequences.map(p => (
                                <div key={p.id} className="relative group p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-red-900">{p.title}</p>
                                        <p className="text-xs text-red-600 font-bold">-{p.points_deduction} pts</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <div className="flex flex-wrap gap-1 max-w-[120px] justify-end">
                                            {users.filter(u => u.role === 'kid').map(kid => (
                                                <button
                                                    key={kid.id}
                                                    onClick={() => handleApplyConsequence(p, kid.id)}
                                                    className="w-8 h-8 rounded-full bg-white border border-red-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all overflow-hidden"
                                                    title={`Apply to ${kid.name}`}
                                                >
                                                    {kid.avatar_url?.length === 2 ? kid.avatar_url : kid.name[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditConsequence(p)} className="p-1.5 bg-white shadow-sm border border-red-100 rounded-lg text-red-400 hover:text-red-900">
                                            <Pencil size={12} />
                                        </button>
                                        <button onClick={() => handleDeleteConsequence(p.id)} className="p-1.5 bg-white shadow-sm border border-red-100 rounded-lg text-red-400 hover:text-red-600">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <TaskSection title="Daily Tasks" tasksList={dailyTasks} />
                <TaskSection title="Weekly Tasks" tasksList={weeklyTasks} />
                <TaskSection title="Other Tasks" tasksList={otherTasks} />
                {tasks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 italic bg-white rounded-3xl border border-dashed border-gray-200">
                        No tasks yet. {currentUser?.role === 'parent' ? 'Click the + to add one!' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}

const TaskSection = ({ title, tasksList }: { title: string, tasksList: Task[] }) => {
    const { currentUser, refreshUsers } = useUser();

    return (
        tasksList.length > 0 ? (
            <section className="space-y-3">
                <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider px-1">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tasksList.map(task => (
                        <div key={task.id} className="relative group">
                            <TaskCard task={task} onUpdate={() => window.location.reload()} />
                        </div>
                    ))}
                </div>
            </section>
        ) : null
    );
};
