'use client';

import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Repeat, UserPlus, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUser } from './UserContext';
import { store } from '@/lib/store';

interface TaskCardProps {
    task: Task;
    onUpdate?: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
    const { currentUser } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);

    const isAssignedToMe = currentUser?.id === task.assigned_to;
    const isUnassigned = task.assigned_to === 'unassigned';
    const isAssignedToAll = task.assigned_to === 'all';
    const isPendingApproval = task.status === 'completed';
    const isApproved = task.status === 'approved';

    // Determine interaction permission
    const canInteract = (isAssignedToMe || isUnassigned || isAssignedToAll) && task.status === 'pending';
    const isParent = currentUser?.role === 'parent';

    const handleAction = async () => {
        if (!currentUser) return;
        setIsProcessing(true);

        if (isUnassigned) {
            // CLAIM TASK
            await store.updateTask(task.id, { assigned_to: currentUser.id });
            if (onUpdate) onUpdate();
            setIsProcessing(false);
            return;
        }

        // INCREMENT COUNT or COMPLETE
        const newCount = (task.current_count || 0) + 1;
        const required = task.required_count || 1;

        // Small confetti for progress
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#6366f1'] // Indigo
        });

        if (newCount >= required) {
            // FULL COMPLETION (Sets to completed for parent approval)
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } }); // Big boom
            await new Promise(r => setTimeout(r, 800));
            await store.updateTask(task.id, {
                status: 'completed',
                current_count: newCount
            });
        } else {
            // JUST PROGRESS
            await new Promise(r => setTimeout(r, 300));
            await store.updateTask(task.id, { current_count: newCount });
        }

        if (onUpdate) onUpdate();
        setIsProcessing(false);
    };

    const handleApprove = async () => {
        if (!isParent || !currentUser) return;
        setIsProcessing(true);

        // Find the user who did the task
        const workerId = task.assigned_to;
        if (workerId && workerId !== 'unassigned' && workerId !== 'all') {
            const users = await store.getUsers();
            const worker = users.find(u => u.id === workerId);
            if (worker) {
                // Award points and XP
                await store.updateUser({
                    ...worker,
                    points: worker.points + task.points_reward,
                    xp: worker.xp + task.points_reward,
                    total_xp: (worker.total_xp || 0) + task.points_reward
                });
            }
        }

        // Mark as approved (or delete if it's a one-off)
        if (task.is_recurring) {
            // Reset for next time
            await store.updateTask(task.id, {
                status: 'pending',
                current_count: 0
            });
        } else {
            await store.updateTask(task.id, { status: 'approved' });
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#22c55e'] // Emerald
        });

        if (onUpdate) onUpdate();
        setIsProcessing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            className={cn(
                "bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden",
                isPendingApproval && "bg-gray-50 border-orange-100",
                isUnassigned && "border-dashed border-indigo-300 bg-indigo-50/30"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-semibold text-gray-900 leading-tight", isPendingApproval && "text-gray-500")}>
                            {task.title}
                        </h3>
                        {task.is_recurring && <Repeat size={14} className="text-gray-400" />}
                    </div>

                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                            +{task.points_reward} XP
                        </span>
                        {isUnassigned && (
                            <span className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                                <UserPlus size={12} /> Anyone
                            </span>
                        )}
                        {isAssignedToAll && (
                            <span className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                                <Star size={12} /> Everyone
                            </span>
                        )}
                        {task.recurrence_pattern && (
                            <span className="text-gray-400 text-xs capitalize border border-gray-200 px-1.5 rounded-md">
                                {task.recurrence_pattern}
                            </span>
                        )}
                    </div>
                </div>

                {/* ACTION BUTTON */}
                {!isPendingApproval && (
                    <button
                        onClick={handleAction}
                        disabled={isProcessing || !canInteract}
                        className={cn(
                            "h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm",
                            isUnassigned
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95",
                            !canInteract && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isProcessing ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            />
                        ) : isUnassigned ? (
                            <UserPlus size={20} />
                        ) : (
                            <div className="relative flex items-center justify-center">
                                <Circle size={28} />
                                {(task.required_count || 1) > 1 && (
                                    <span className="absolute text-[10px] font-bold">
                                        {task.current_count || 0}/{task.required_count}
                                    </span>
                                )}
                            </div>
                        )}
                    </button>
                )}

                {isPendingApproval && isParent && (
                    <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {isProcessing ? '...' : <CheckCircle2 size={18} />} Approve
                    </button>
                )}

                {isPendingApproval && !isParent && (
                    <div className="h-12 w-12 flex items-center justify-center text-orange-500">
                        <Clock size={28} />
                    </div>
                )}
            </div>

            {/* Progress Bar for multi-step */}
            {(task.required_count || 1) > 1 && !isPendingApproval && !isUnassigned && (
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((task.current_count || 0) / (task.required_count || 1)) * 100}%` }}
                    />
                </div>
            )}

            {isPendingApproval && !isParent && (
                <div className="text-xs text-orange-500 flex items-center gap-1 mt-2 font-medium">
                    <Clock size={12} /> Waiting for Parent to Approve
                </div>
            )}

        </motion.div>
    );
}
