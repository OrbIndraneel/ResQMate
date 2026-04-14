"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, AlertCircle, Clock, Users, ArrowRight, Loader2, BarChart3, TrendingUp, Calendar } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 hero-gradient">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-4 left-4" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Syncing Operations</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Establishing Secure Channel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      
      <main className="container mx-auto py-10 px-6 space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">NGO Command Center</h1>
            <p className="text-slate-500 font-medium text-lg">Managing {tasks.length} active relief missions globally.</p>
          </div>
          <Link href="/ngo/tasks/new">
            <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 group">
              <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" /> Post New Task
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Tasks", val: stats.active, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Volunteers", val: stats.volunteers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Success Rate", val: stats.completion, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
            { label: "Emergency Alerts", val: stats.alerts, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" }
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <BarChart3 className="h-4 w-4 text-slate-200" />
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-black text-slate-900">{s.val}</div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <Card className="lg:col-span-8 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="px-8 pt-10 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">Operational Status</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Real-time tracking of mission progress.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-2 font-bold px-4">View Archive</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-20 border-4 border-dashed rounded-[2rem] border-slate-100 bg-slate-50/50 group hover:border-primary/20 transition-colors">
                  <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Calendar className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No Operations Scheduled</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">Deploy your first relief task to begin coordinating responders.</p>
                  <Link href="/ngo/tasks/new" className="mt-8 inline-block">
                    <Button variant="secondary" className="rounded-full font-bold px-8">Create Task</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-lg transition-all group">
                      <div className="flex gap-4 items-center">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold ${task.urgency === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                          {task.urgency === 'emergency' ? '!' : '#'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{task.title}</h3>
                            <Badge variant={task.urgency === 'emergency' ? 'destructive' : 'secondary'} className="uppercase text-[10px] rounded-md font-bold">
                              {task.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5} Responders</span>
                            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> {task.status?.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 group-hover:translate-x-2 transition-all" asChild>
                        <Link href={`/volunteer/tasks/${task.id}`}>
                          <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <CardHeader className="pt-10 px-8">
                <CardTitle className="text-xl">Organization Identity</CardTitle>
                <CardDescription className="text-slate-400">Your profile and verification status.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black">
                       {(user?.displayName || "N")[0]}
                     </div>
                     <div>
                       <p className="font-bold text-lg">{user?.displayName}</p>
                       <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Verified NGO</p>
                     </div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin ID</p>
                      <p className="text-xs font-mono text-slate-300 break-all">{user?.uid}</p>
                   </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/20 hover:bg-white/10 text-white font-bold" asChild>
                  <Link href="/ngo/profile">Edit Profile Details</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-primary/10 border border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Need Immediate Help?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Our AI response specialists are available 24/7 to help you structure your emergency tasks for maximum volunteer engagement.</p>
                <Button variant="link" className="p-0 h-auto text-primary font-bold group">
                  Open AI Assistant <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}