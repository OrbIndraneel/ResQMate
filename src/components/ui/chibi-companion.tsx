
"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Coffee, Ghost, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChibiCompanion() {
  const [mood, setMood] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const moods = [
    { icon: Bot, label: "Scanning...", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Sparkles, label: "Excited!", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Heart, label: "Helping!", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Zap, label: "High Energy!", color: "text-yellow-500", bg: "bg-yellow-50" },
    { icon: Coffee, label: "Break time.", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Ghost, label: "Sneaking!", color: "text-slate-500", bg: "bg-slate-50" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setMood((prev) => (prev + 1) % moods.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, moods.length]);

  const CurrentMoodIcon = moods[mood].icon;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col items-center">
        {/* Thought Bubble */}
        <div className={cn(
          "absolute bottom-full mb-3 px-3 py-1.5 rounded-2xl bg-white shadow-xl border border-slate-100 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
          isHovered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90 pointer-events-none"
        )}>
          {moods[mood].label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
        </div>

        {/* Chibi Body */}
        <div className={cn(
          "h-14 w-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 border-4 border-white cursor-help active:scale-90",
          moods[mood].bg,
          moods[mood].color,
          isHovered ? "rotate-12 scale-110" : "animate-bounce"
        )} style={{ animationDuration: '3s' }}>
          <CurrentMoodIcon className="h-8 w-8" />
        </div>

        {/* Shadow */}
        <div className="w-8 h-1.5 bg-black/10 rounded-full blur-sm mt-1 animate-pulse" />
      </div>
    </div>
  );
}
