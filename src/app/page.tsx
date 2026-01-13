'use client';

import { useUser } from '@/components/UserContext';
import { TaskCard } from '@/components/TaskCard';
import { store } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Task, User } from '@/types';
import { Flame, Star, Trophy, CreditCard, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rank, setRank] = useState<number>(0);

  const fetchData = async () => {
    if (!currentUser) return;

    // Fetch all needed data
    const [allTasks, allUsers] = await Promise.all([
      store.getTasks(),
      store.getUsers()
    ]);

    // Calculate Rank
    const sortedUsers = [...allUsers].sort((a, b) => b.xp - a.xp);
    const myRank = sortedUsers.findIndex(u => u.id === currentUser.id) + 1;
    setRank(myRank);

    // Filter Tasks: (mine) OR (unassigned) OR (all)
    const relevantTasks = allTasks.filter(t => {
      const isVisible = t.assigned_to === currentUser.id ||
        t.assigned_to === 'unassigned' ||
        t.assigned_to === 'all';

      if (currentUser.role === 'kid') {
        return isVisible && t.status !== 'approved';
      } else {
        // Parents see their own tasks OR tasks needing approval
        return (isVisible && t.assigned_to === currentUser.id) || t.status === 'completed';
      }
    });
    setTasks(relevantTasks);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <main className="p-4 space-y-6">
      {/* Header with simple welcome */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {currentUser.name}!</h1>
          <p className="text-gray-500 text-sm">Let's get things done.</p>
        </div>
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
          {currentUser.avatar_url?.startsWith('http') ? (
            <img src={currentUser.avatar_url} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div className="text-2xl">{currentUser.avatar_url}</div>
          )}
        </div>
      </header>

      {/* STATS GRID - New Section */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Trophy size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Rank</span>
          </div>
          <p className="text-2xl font-black text-gray-900">#{rank}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Zap size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Current XP</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{currentUser.xp}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <BarChart3 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total XP</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{currentUser.total_xp || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <CreditCard size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">XP Spent</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{currentUser.xp_spent || 0}</p>
        </div>
      </section>

      {/* Streak / Motivation Section - RELOCATED */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="fill-orange-400 text-orange-400" size={20} />
            <span className="font-bold opacity-90 text-sm">Daily Streak</span>
          </div>
          <h2 className="text-3xl font-bold">5 Days</h2>
          <p className="text-indigo-100 text-xs mt-1">Keep it up to earn a bonus!</p>
        </div>
        {/* Decorative element instead of avatar here */}
        <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 capitalize font-black text-5xl italic pointer-events-none">
          STREAK
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
              <TaskCard key={task.id} task={task} onUpdate={fetchData} />
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
