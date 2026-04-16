"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, AlertCircle, Clock, Users, ArrowRight, Loader2, BarChart3, TrendingUp, Calendar, Heart, Shield } from 'lucide-react';
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
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-3xl border-4 border-primary/20 animate-spin" />
          <div className="absolute inset-4 rounded-xl border-4 border-primary/40 animate-pulse" />
          <Shield className="h-10 w-10 text-primary absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black text-slate-900 tracking-tighter">Establishing Secure Link</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Syncing Operational Data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      
      <main className="container mx-auto py-16 px-8 space-y-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter text-slate-950">Command Dashboard</h1>
            <p className="text-slate-500 font-bold text-lg">Managing {tasks.length} strategic relief missions in real-time.</p>
          </div>
          <Link href="/ngo/tasks/new">
            <Button size="lg" className="rounded-[1.5rem] h-20 px-10 text-xl font-black shadow-2xl shadow-primary/20 group">
              <Plus className="mr-3 h-8 w-8 group-hover:rotate-90 transition-transform" /> Deploy New Mission
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Deployments", val: stats.active, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Responders Engaged", val: stats.volunteers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Operational Success", val: stats.completion, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
            { label: "Emergency States", val: stats.alerts, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" }
          ].map((s, i) => (
            <div key={i} className="premium-card p-8 group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                  <s.icon className="h-8 w-8" />
                </div>
                <div className="h-2 w-10 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-950 tracking-tighter">{s.val}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-3xl font-black tracking-tighter">Mission Registry</h2>
              <Button variant="outline" className="rounded-full border-2 font-black px-6">Export Data</Button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-32 rounded-[3rem] border-4 border-dashed border-slate-100 bg-white/50 space-y-8">
                <div className="bg-white h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="h-10 w-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950">No Active Missions</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">Your command registry is empty. Deploy your first task to start coordinating responders.</p>
                </div>
                <Link href="/ngo/tasks/new" className="inline-block">
                  <Button variant="secondary" className="rounded-2xl h-14 px-10 font-black">Begin Deployment</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {tasks.map(task => (
                  <div key={task.id} className="premium-card p-8 group">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex gap-6 items-center">
                        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black ${task.urgency === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-slate-900 text-white'}`}>
                          {task.urgency === 'emergency' ? '!' : '#'}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-black text-2xl text-slate-950 group-hover:text-primary transition-colors">{task.title}</h3>
                            <Badge className={task.urgency === 'emergency' ? 'bg-rose-500' : 'bg-slate-100 text-slate-900'} variant="secondary">
                              {task.urgency.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5} Responders</span>
                            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> {task.status?.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-primary/10 transition-all group-hover:translate-x-2" asChild>
                        <Link href={`/volunteer/tasks/${task.id}`}>
                          <ArrowRight className="h-7 w-7 text-slate-300 group-hover:text-primary" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[3rem] bg-slate-950 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
              <CardHeader className="pt-12 px-10 pb-8">
                <CardTitle className="text-2xl font-black tracking-tighter">Organization Profile</CardTitle>
                <CardDescription className="text-slate-400 font-bold">Authorized Entity Data</CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-12 space-y-10">
                <div className="flex items-center gap-6">
                   <div className="h-20 w-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-4xl font-black border border-white/10">
                     {(user?.displayName || "N")[0]}
                   </div>
                   <div className="space-y-1">
                     <p className="text-2xl font-black tracking-tight leading-none">{user?.displayName}</p>
                     <p className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Verified Operational Hub</p>
                   </div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Access Token</p>
                   <p className="text-xs font-mono text-slate-400 break-all leading-relaxed">{user?.uid}</p>
                </div>
                <Button className="w-full h-16 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-lg transition-all" asChild>
                  <Link href="/ngo/profile">Update Credentials</Link>
                </Button>
              </CardContent>
            </Card>
            
            <div className="premium-card p-10 bg-primary/5 border-primary/10 space-y-6">
              <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-950">Mission Support</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">Our AI response specialists are active 24/7 to help you optimize mission descriptions for rapid mobilization.</p>
              </div>
              <Button variant="link" className="p-0 h-auto text-primary font-black group">
                Access AI Protocol <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}