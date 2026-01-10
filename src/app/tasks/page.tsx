'use client';

import { TaskCard } from '@/components/TaskCard';
import { store } from '@/lib/store';
import { Task } from '@/types';
import { useEffect, useState } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Show all tasks for now, maybe filtered by "Not Completed" later
        const fetch = async () => {
            setTasks(await store.getTasks());
        };
        fetch();
    }, []);

    return (
        <div className="p-4 space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
                <p className="text-gray-500">Everything that needs doing.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
