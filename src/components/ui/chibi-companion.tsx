
"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Bot, BarChart3, Users, Globe, X, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function ChibiCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    volunteers: 0,
    tasks: 0,
    activeTasks: 0,
    ngos: 0
  });
  const [mood, setMood] = useState(0);
  const [lastSync, setLastSync] = useState<string>('');

  const moods = [
    { icon: Bot, label: "Scanning network...", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Sparkles, label: "Optimizing relief...", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Heart, label: "Calculating impact...", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Activity, label: "Monitoring live tasks...", color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  useEffect(() => {
    // Set initial client-side time to avoid hydration mismatch
    setLastSync(new Date().toLocaleTimeString());

    // Real-time stats syncing
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = snapshot.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        volunteers: docs.filter(u => u.role === 'volunteer').length,
        ngos: docs.filter(u => u.role === 'ngo').length
      }));
      setLastSync(new Date().toLocaleTimeString());
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const docs = snapshot.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        tasks: docs.length,
        activeTasks: docs.filter(t => t.status === 'open').length
      }));
      setLastSync(new Date().toLocaleTimeString());
    });

    const moodInterval = setInterval(() => {
      setMood((prev) => (prev + 1) % moods.length);
    }, 5000);

    return () => {
      unsubUsers();
      unsubTasks();
      clearInterval(moodInterval);
    };
  }, []);

  const CurrentMoodIcon = moods[mood].icon;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Analytics Panel */}
      <div className={cn(
        "absolute bottom-20 right-0 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 transition-all duration-500 transform origin-bottom-right",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
      )}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Operation Briefing</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Volunteers</span>
            </div>
            <span className="font-black text-blue-700">{stats.volunteers}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Active Tasks</span>
            </div>
            <span className="font-black text-emerald-700">{stats.activeTasks}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">NGO Partners</span>
            </div>
            <span className="font-black text-amber-700">{stats.ngos}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center">
            Last Sync: {lastSync || '--:--:--'}
          </p>
        </div>
      </div>

      {/* Chibi Bot Trigger */}
      <div className="relative flex flex-col items-center group">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 border-4 border-white cursor-pointer active:scale-90",
            moods[mood].bg,
            moods[mood].color,
            isOpen ? "rotate-0 scale-110" : "animate-bounce hover:rotate-12"
          )}
          style={{ animationDuration: '3s' }}
        >
          <CurrentMoodIcon className="h-9 w-9" />
          
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative text-[10px] font-black text-white">!</span>
          </span>
        </button>

        {/* Thought Bubble */}
        {!isOpen && (
          <div className="absolute bottom-full mb-4 px-3 py-2 rounded-2xl bg-slate-900 text-white shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
            <p className="text-[10px] font-black uppercase tracking-widest">{moods[mood].label}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </div>
        )}

        {/* Shadow */}
        <div className="w-10 h-2 bg-black/10 rounded-full blur-sm mt-2 animate-pulse" />
      </div>
    </div>
  );
}
