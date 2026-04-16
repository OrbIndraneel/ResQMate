"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, MapPin, Navigation, ArrowRight, Loader2, Sparkles, BrainCircuit, Activity, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, limit, doc } from 'firebase/firestore';

export default function VolunteerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const MILESTONE = 1000;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const profileUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });

    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      limit(5)
    );

    const tasksUnsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
      setLoading(false);
    });

    return () => {
      profileUnsubscribe();
      tasksUnsubscribe();
    };
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-slate-50 hero-gradient">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-3xl border-4 border-emerald-500/20 animate-spin" />
          <Activity className="h-10 w-10 text-emerald-500 absolute top-5 left-5 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Mission Intel...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      
      <main className="container mx-auto py-16 px-8 space-y-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-slate-950 tracking-tighter">Operational Feed</h1>
            <p className="text-slate-500 font-bold text-lg">Greetings, Responder {user?.displayName?.split(' ')[0]}. Sector status: {tasks.length} missions active.</p>
          </div>
          <Link href="/volunteer/tasks">
            <Button size="lg" className="rounded-[1.5rem] h-20 px-10 text-xl font-black shadow-2xl shadow-primary/20 group">
              Browse Mission Map <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Progress Card */}
          <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <CardHeader className="pt-12 px-10">
              <div className="flex justify-between items-center mb-6">
                <CardTitle className="text-3xl font-black tracking-tight">Impact Rank</CardTitle>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Elite Tier Alignment</span>
                  <span className="text-white">{profile?.points || 0} / {MILESTONE} Pts</span>
                </div>
                <Progress value={Math.min(((profile?.points || 0) / MILESTONE) * 100, 100)} className="h-4 bg-white/10" />
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-12 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group transition-all hover:bg-white/10">
                  <p className="text-4xl font-black text-white tracking-tighter">{profile?.tasksCompleted || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Deployments</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group transition-all hover:bg-white/10">
                  <p className="text-4xl font-black text-white tracking-tighter">{profile?.hoursContributed || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Relief Hours</p>
                </div>
              </div>
              <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <p className="text-xs font-bold text-slate-300">Verified Professional Responder Status</p>
              </div>
            </CardContent>
          </Card>

          {/* Missions Card */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
               <div className="space-y-1">
                 <h2 className="text-3xl font-black tracking-tighter">AI Mission Recommendations</h2>
                 <p className="text-slate-500 font-bold">Optimized for your verified skill profile.</p>
               </div>
               <Badge className="h-10 rounded-full border-2 border-emerald-500/20 bg-emerald-50 text-emerald-600 flex items-center gap-2 px-6 font-black text-[10px] tracking-widest uppercase">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Scanning
              </Badge>
            </div>
            
            <div className="space-y-6">
              {tasks.length === 0 ? (
                <div className="text-center py-32 premium-card bg-white/50 border-dashed border-4 border-slate-100">
                  <p className="text-slate-400 font-black uppercase tracking-widest">No active deployments in sector</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="premium-card p-10 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                          <h3 className="font-black text-3xl text-slate-950 group-hover:text-primary transition-colors tracking-tight">{task.title}</h3>
                          <Badge className={task.urgency === 'emergency' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900'} variant="default">
                             {task.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {task.location}</span>
                          <span className="flex items-center gap-2 text-emerald-600"><Sparkles className="h-5 w-5" /> +{task.pointsValue || 50} Impact Pts</span>
                        </div>
                        <div className="flex gap-2">
                           {task.requiredSkills?.slice(0, 4).map((s: string) => (
                             <Badge key={s} variant="outline" className="text-[10px] font-black py-2 px-4 rounded-xl border-slate-100 text-slate-500 uppercase tracking-wider">{s}</Badge>
                           ))}
                        </div>
                      </div>
                      <Link href={`/volunteer/tasks/${task.id}`}>
                        <Button className="w-full md:w-auto h-16 rounded-2xl bg-slate-950 hover:bg-black text-white px-10 font-black shadow-xl transition-all active:scale-95 text-lg">
                          Mission Brief
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}