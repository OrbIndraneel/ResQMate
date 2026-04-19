
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Clock, Users, ShieldCheck, Loader2, BarChart3, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function NGOTaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'tasks', params.id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Security check: only creator can see full NGO detail
        if (user && data.creatorId !== user.uid) {
           router.push('/ngo/dashboard');
           return;
        }
        setTask({ id: docSnap.id, ...data });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id, user, router]);

  const handleDelete = async () => {
    if (!confirm("Terminate this mission? This action will remove it from all responder terminals.")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      toast({ title: "Mission Terminated", description: "The task has been removed from the network." });
      router.push('/ngo/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>;
  if (!task) return <div className="p-10 text-center">Mission dossier not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      
      <main className="container mx-auto py-10 px-6 max-w-5xl space-y-10">
        <Link href="/ngo/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-white rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Command
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-10 space-y-6">
                <div className="flex justify-between items-start">
                  <Badge variant={task.urgency === 'emergency' ? 'destructive' : 'secondary'} className="uppercase px-4 py-1 rounded-lg font-black tracking-widest text-[10px]">
                    {task.urgency}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-xl font-black">
                    {task.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-4xl font-black text-slate-900 leading-tight">{task.title}</CardTitle>
                <div className="flex flex-wrap gap-8 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {task.location}</span>
                  <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> DEPLOYED: {new Date(task.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-lg border-l-4 border-slate-100 pl-8 py-2">
                    {task.description}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Responder Engagement</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-3xl font-black">{task.volunteersJoined || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Confirmed</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-3xl font-black">{task.volunteersNeeded || 5}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Target</p>
                </div>
                <div className="p-6 bg-primary/20 rounded-3xl border border-primary/20 flex flex-col justify-center">
                  <p className="text-xl font-black text-primary">{( (task.volunteersJoined || 0) / (task.volunteersNeeded || 5) * 100 ).toFixed(0)}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Fill Rate</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-28">
              <div className="h-3 bg-primary w-full" />
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black">Mission Control</CardTitle>
                <CardDescription className="font-bold">Operational Command Center</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                <Button className="w-full h-16 rounded-[1.5rem] font-black bg-slate-900 hover:bg-black transition-all active:scale-95">
                  <Edit3 className="mr-2 h-5 w-5" /> Edit Parameters
                </Button>
                <Button variant="outline" className="w-full h-16 rounded-[1.5rem] font-black border-2 text-slate-700 hover:bg-slate-50">
                  <BarChart3 className="mr-2 h-5 w-5" /> Detailed Analytics
                </Button>
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-[1.5rem] font-black shadow-lg shadow-rose-100"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="animate-spin h-5 w-5" /> : <Trash2 className="mr-2 h-5 w-5" />}
                    Terminate Mission
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <h3 className="font-black text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Required Skillsets</h3>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-4 py-1.5 rounded-xl font-bold bg-slate-50 border border-slate-100 text-slate-600">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
