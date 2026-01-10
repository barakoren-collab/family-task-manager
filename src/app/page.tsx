'use client';

import { useUser } from '@/components/UserContext';
import { TaskCard } from '@/components/TaskCard';
import { store } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Task } from '@/types';
import { Flame, Star } from 'lucide-react';

export default function Home() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    if (!currentUser) return;
    const allTasks = await store.getTasks();

    if (currentUser.role === 'kid') {
      const myTasks = allTasks.filter(t =>
        (t.assigned_to === currentUser.id || t.assigned_to === 'unassigned') // Show mine OR unassigned
        && t.status !== 'approved'
      );
      setTasks(myTasks);
    } else {
      // Parents see tasks assigned to them OR tasks needing approval
      const relevantTasks = allTasks.filter(t =>
        t.assigned_to === currentUser.id || t.status === 'completed'
      );
      setTasks(relevantTasks);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <main className="p-4 space-y-6">
      <header className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {currentUser.name}!</h1>
          <p className="text-gray-500 text-sm">Let's get things done.</p>
        </div>
        <div className="bg-indigo-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 shadow-indigo-200 shadow-lg">
          <Star className="fill-yellow-400 text-yellow-400" size={20} />
          <span className="font-bold">{currentUser.points}</span>
        </div>
      </header>

      {/* Streak / Motivation Section */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="fill-orange-400 text-orange-400" size={20} />
              <span className="font-bold opacity-90">Daily Streak</span>
            </div>
            <h2 className="text-3xl font-bold">5 Days</h2>
            <p className="text-indigo-100 text-sm mt-1">Keep it up to earn a bonus!</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm w-20 h-20 flex items-center justify-center overflow-hidden">
            {currentUser.avatar_url?.startsWith('http') ? (
              <img src={currentUser.avatar_url} alt="You" className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl">{currentUser.avatar_url}</div>
            )}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Your Tasks</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tasks.length} active</span>
        </div>

        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-500">All caught up!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
