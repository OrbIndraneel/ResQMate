"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, AlertCircle, Clock, Users, ArrowRight, Loader2, BarChart3, TrendingUp } from 'lucide-react';
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
    completion: "85%",
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 tracking-tight">Synchronizing Command...</p>
          <p className="text-sm text-slate-400 font-medium">Fetching active operational data</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      <main className="container mx-auto py-10 px-6 space-y-10 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">NGO Operations</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live System Monitor
            </p>
          </div>
          <Link href="/ngo/tasks/new">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 group">
              <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" /> Post Relief Mission
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Missions", value: stats.active, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Total Responders", value: stats.volunteers, icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
            { label: "Success Rate", value: stats.completion, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
            { label: "Alerts Level", value: stats.alerts, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl group hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
              <div>
                <CardTitle className="text-2xl font-black">Live Deployment List</CardTitle>
                <CardDescription className="font-medium">Real-time tracking of active humanitarian tasks.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-slate-50/50">
                  <div className="bg-slate-200 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No active deployments</h3>
                  <p className="text-slate-500 font-medium mt-1">Start by publishing a new relief mission.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-6 rounded-3xl border-2 border-slate-50 bg-white hover:border-primary/20 hover:shadow-xl transition-all group">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={task.urgency === 'emergency' ? 'destructive' : 'secondary'} className="rounded-full px-3 uppercase text-[10px] font-black">
                          {task.urgency}
                        </Badge>
                        <h3 className="font-bold text-lg text-slate-900">{task.title}</h3>
                      </div>
                      <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"><Users className="h-4 w-4" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5}</span>
                        <span className="uppercase text-[10px] tracking-widest font-black text-indigo-500">{task.status?.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full group-hover:bg-primary group-hover:text-white transition-all shadow-inner" asChild>
                      <Link href={`/volunteer/tasks/${task.id}`}>
                        <ArrowRight className="h-6 w-6" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <CardHeader className="relative">
                <CardTitle className="text-xl font-black">Organization Profile</CardTitle>
                <CardDescription className="text-white/70 font-medium">Internal identity overview.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Access Level</p>
                    <p className="text-lg font-bold">NGO Administrator</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Authenticated Email</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl bg-white text-primary font-bold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10" asChild>
                  <Link href="/ngo/profile">Modify Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500">Infrastructure</span>
                  <span className="text-green-500 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Nominal</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500">AI Assist</span>
                  <span className="text-primary flex items-center gap-1.5"><Zap className="h-4 w-4" /> Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}