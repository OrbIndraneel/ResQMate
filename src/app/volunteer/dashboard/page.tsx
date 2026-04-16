
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, MapPin, Navigation, ArrowRight, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 hero-gradient">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-4 left-4" />
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Synching Mission Intel...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      
      <main className="container mx-auto py-10 px-6 space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Duty Feed</h1>
            <p className="text-slate-500 font-medium text-lg">Welcome back, {user?.displayName || 'Responder'}. {tasks.length} missions require your expertise.</p>
          </div>
          <Link href="/volunteer/tasks">
            <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 group">
              Browse Mission Map <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Progress Card */}
          <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <CardHeader className="pt-10 px-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-black">Impact Rank</CardTitle>
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-10 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Progress to Elite Rank</span>
                  <span className="text-white">{profile?.points || 0} / {MILESTONE} Pts</span>
                </div>
                <Progress value={Math.min(((profile?.points || 0) / MILESTONE) * 100, 100)} className="h-3 bg-white/10" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-black text-white">{profile?.tasksCompleted || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Deployments</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-black text-white">{profile?.hoursContributed || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Impact Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missions Card */}
          <Card className="lg:col-span-8 border-none shadow-xl rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">AI Recommendations</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Missions prioritized by your skill profile.</CardDescription>
              </div>
              <Badge variant="outline" className="h-8 rounded-full border-2 border-emerald-500/20 text-emerald-600 flex items-center gap-1.5 px-4 font-black text-[10px] tracking-widest">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> GPS ACTIVE
              </Badge>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-20 border-4 border-dashed rounded-[2rem] border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No active deployments in sector</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-primary/30 hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">{task.title}</h3>
                          <Badge className={task.urgency === 'emergency' ? 'bg-rose-100 text-rose-600 hover:bg-rose-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'} variant="secondary">
                             {task.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Navigation className="h-4 w-4 text-primary" /> {task.location}</span>
                          <span className="flex items-center gap-1.5 text-emerald-600"><Sparkles className="h-4 w-4" /> +{task.pointsValue || 50} Impact Pts</span>
                        </div>
                        <div className="flex gap-2">
                           {task.requiredSkills?.slice(0, 3).map((s: string) => (
                             <Badge key={s} variant="outline" className="text-[10px] font-bold py-1 px-3 rounded-lg border-slate-100 text-slate-500">{s}</Badge>
                           ))}
                        </div>
                      </div>
                      <Link href={`/volunteer/tasks/${task.id}`}>
                        <Button className="w-full md:w-auto h-14 rounded-2xl bg-slate-900 hover:bg-black text-white px-8 font-black shadow-lg shadow-slate-200 transition-all active:scale-95">
                          Mission Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
