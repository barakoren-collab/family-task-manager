'use client';

import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Repeat, UserPlus } from 'lucide-react';
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
    const isPendingApproval = task.status === 'completed';
    const isApproved = task.status === 'approved'; // Shouldn't show usually

    // Determine interaction permission
    const canInteract = (isAssignedToMe || isUnassigned) && task.status === 'pending';

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
            // FULL COMPLETION
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            className={cn(
                "bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden",
                isPendingApproval && "bg-gray-50 opacity-80",
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

                {isPendingApproval && (
                    <div className="h-12 w-12 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={28} />
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

            {isPendingApproval && (
                <div className="text-xs text-orange-500 flex items-center gap-1 mt-2">
                    <Clock size={12} /> Pending Parent Verification
                </div>
            )}

        </motion.div>
    );
}
