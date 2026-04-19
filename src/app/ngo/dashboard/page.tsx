
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, AlertCircle, Clock, Users, ArrowRight, TrendingUp, Calendar, Heart, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function NGODashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    volunteers: 0,
    completion: "0%",
    alerts: 0
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('creatorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setTasks(taskList);
      
      const activeCount = taskList.filter(t => t.status !== 'completed').length;
      const totalVolunteers = taskList.reduce((acc, t) => acc + (t.volunteersJoined || 0), 0);
      
      setStats({
        active: activeCount,
        volunteers: totalVolunteers,
        completion: "92%",
        alerts: taskList.filter(t => t.urgency === 'emergency').length
      });
      
      setLoading(false);
    }, (error) => {
      console.error("Firestore Task Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-slate-50 hero-gradient">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-[2rem] border-4 border-primary/20 animate-spin" />
          <div className="absolute inset-5 rounded-2xl border-4 border-primary/40 animate-pulse" />
          <Shield className="h-10 w-10 text-primary absolute top-7 left-7" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Establishing Secure Link</p>
          <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Synchronizing Command Data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      
      <main className="container mx-auto py-8 md:py-16 px-4 md:px-8 space-y-12 md:space-y-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-10">
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950">Mission Control</h1>
            <p className="text-slate-500 font-bold text-lg md:text-xl">Coordinating {tasks.length} tactical relief operations.</p>
          </div>
          <Link href="/ngo/tasks/new" className="w-full lg:w-auto">
            <Button size="lg" className="w-full lg:w-auto rounded-[1.2rem] md:rounded-[1.5rem] h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl font-black shadow-2xl shadow-primary/30 group active:scale-95 transition-all">
              <Plus className="mr-3 h-6 w-6 md:h-8 md:w-8 group-hover:rotate-90 transition-transform" /> Deploy Mission
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Deployments", val: stats.active, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Responders On-Site", val: stats.volunteers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Success Rate", val: stats.completion, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
            { label: "Critical Alerts", val: stats.alerts, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" }
          ].map((s, i) => (
            <div key={i} className="premium-card p-6 md:p-10 group">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className={`p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                  <s.icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">{s.val}</div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-6 md:space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Mission Registry</h2>
              <Button variant="outline" className="rounded-xl md:rounded-2xl border-2 md:border-4 font-black px-6 md:px-8 h-10 md:h-12 hover:bg-white w-full sm:w-auto">Export Audit Log</Button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-24 md:py-40 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 bg-white/50 space-y-8 md:space-y-10">
                <div className="bg-white h-20 w-20 md:h-28 md:w-28 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
                </div>
                <div className="space-y-2 md:space-y-3 px-6">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-950">No Missions Active</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed text-base md:text-lg">Your operational registry is empty. Deploy your first mission to begin coordinating responders.</p>
                </div>
                <Link href="/ngo/tasks/new">
                  <Button variant="secondary" className="rounded-xl md:rounded-2xl h-14 md:h-16 px-8 md:px-12 text-base md:text-lg font-black shadow-lg">Begin Dispatch</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-8">
                {tasks.map(task => (
                  <div key={task.id} className="premium-card p-6 md:p-10 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 md:gap-10">
                      <div className="flex gap-4 md:gap-8 items-center">
                        <div className={`h-16 w-16 md:h-20 md:w-20 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl font-black shrink-0 ${task.urgency === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-slate-950 text-white'}`}>
                          {task.urgency === 'emergency' ? '!' : '#'}
                        </div>
                        <div className="space-y-2 md:space-y-3">
                          <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <h3 className="font-black text-2xl md:text-3xl text-slate-950 group-hover:text-primary transition-colors tracking-tighter line-clamp-1">{task.title}</h3>
                            <Badge className={task.urgency === 'emergency' ? 'bg-rose-500' : 'bg-slate-100 text-slate-950'} variant="secondary">
                              {task.urgency.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 md:gap-10 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            <span className="flex items-center gap-2 shrink-0"><Users className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5} Responders</span>
                            <span className="flex items-center gap-2 shrink-0"><CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" /> {task.status?.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-slate-50 hover:bg-primary/10 transition-all ml-auto sm:ml-0" asChild>
                        <Link href={`/ngo/tasks/${task.id}`}>
                          <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-slate-300 group-hover:text-primary" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 md:space-y-10">
            <Card className="rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-950 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
              <CardHeader className="pt-10 md:pt-14 px-8 md:px-12 pb-6 md:pb-8">
                <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter">Command Profile</CardTitle>
                <CardDescription className="text-slate-400 font-bold text-base md:text-lg">Authorized Operations Hub</CardDescription>
              </CardHeader>
              <CardContent className="px-8 md:px-12 pb-10 md:pb-14 space-y-8 md:space-y-12">
                <div className="flex items-center gap-6 md:gap-8">
                   <div className="h-16 w-16 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] bg-white/10 flex items-center justify-center text-3xl md:text-5xl font-black border border-white/10 shadow-inner shrink-0">
                     {(user?.displayName || user?.email || "C")[0].toUpperCase()}
                   </div>
                   <div className="space-y-1 md:space-y-2 overflow-hidden">
                     <p className="text-xl md:text-3xl font-black tracking-tighter leading-none truncate">{user?.displayName || 'Authorized User'}</p>
                     <p className="text-[8px] md:text-[10px] font-black text-emerald-400 tracking-[0.4em] uppercase">Verified Operational Hub</p>
                   </div>
                </div>
                <div className="p-6 md:p-8 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 space-y-3">
                   <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Network Access Token</p>
                   <p className="text-[10px] md:text-xs font-mono text-slate-400 break-all leading-relaxed opacity-70">{user?.uid}</p>
                </div>
                <Button className="w-full h-16 md:h-20 rounded-[1.2rem] md:rounded-[1.5rem] bg-white text-slate-950 hover:bg-slate-200 font-black text-lg md:text-xl transition-all shadow-2xl" asChild>
                  <Link href="/ngo/profile">Credential Management</Link>
                </Button>
              </CardContent>
            </Card>
            
            <div className="premium-card p-8 md:p-12 bg-primary/5 border-primary/20 space-y-6 md:space-y-8">
              <div className="h-16 w-16 md:h-20 md:w-20 bg-primary rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tighter">AI Mission Support</h3>
                <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed">Our Genkit AI layer is active. We recommend optimizing mission descriptions to increase responder engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
