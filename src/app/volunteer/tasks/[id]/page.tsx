
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Clock, Users, ShieldCheck, Loader2, Sparkles, BrainCircuit, AlertTriangle, QrCode } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { volunteerTaskMatchingNotification } from '@/ai/flows/volunteer-task-matching-notification';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [aiMatch, setAiMatch] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [missionData, setMissionData] = useState<any>(null);

  useEffect(() => {
    if (!params.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'tasks', params.id as string), (docSnap) => {
      if (docSnap.exists()) {
        setTask({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  useEffect(() => {
    if (!user || !params.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'task_responses', `${user.uid}_${params.id}`), (docSnap) => {
      if (docSnap.exists()) {
        setIsJoined(true);
        setMissionData(docSnap.data());
      } else {
        setIsJoined(false);
        setMissionData(null);
      }
    });

    return () => unsubscribe();
  }, [user, params.id]);

  useEffect(() => {
    const getAiMatch = async () => {
      if (!user || !task || aiMatch || aiLoading) return;
      
      setAiLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData) {
          const result = await volunteerTaskMatchingNotification({
            volunteerSkills: userData.skills || userData.additionalSkills || [],
            volunteerLocation: userData.location || "Unknown",
            taskTitle: task.title,
            taskDescription: task.description,
            taskRequiredSkills: task.requiredSkills || [],
            taskLocation: task.location
          });
          setAiMatch(result);
        }
      } catch (error) {
        console.error("AI Matching Error:", error);
      } finally {
        setAiLoading(false);
      }
    };

    if (task && !isJoined) getAiMatch();
  }, [task, user, isJoined, aiMatch, aiLoading]);

  const handleJoin = async () => {
    if (!user || !task) return;
    if ((task.volunteersJoined || 0) >= (task.volunteersNeeded || 5)) {
      toast({
        variant: "destructive",
        title: "Mission Full",
        description: "This task has reached its maximum volunteer capacity.",
      });
      return;
    }
    setProcessing(true);
    try {
      const responseRef = doc(db, 'task_responses', `${user.uid}_${task.id}`);
      const qrPayload = `RESQMATE_VERIFY:${user.uid}:${task.id}`;
      
      await setDoc(responseRef, {
        taskId: task.id,
        volunteerId: user.uid,
        volunteerName: user.displayName || 'Responder',
        status: 'active',
        qrPayload,
        joinedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'tasks', task.id), {
        volunteersJoined: increment(1)
      });

      toast({
        title: "Mission Activated",
        description: "Your operational QR code has been generated. Present it to the NGO on-site for verification.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" />
      </div>
    );
  }

  if (!task) return <div className="p-10 text-center">Mission not found.</div>;

  const isFull = (task.volunteersJoined || 0) >= (task.volunteersNeeded || 5);
  const isCompleted = missionData?.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      
      <main className="container mx-auto py-10 px-6 max-w-5xl space-y-10">
        <Link href="/volunteer/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-white rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Intelligence Feed
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
                  <div className="flex items-center text-emerald-600 font-black gap-1.5 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">+{task.pointsValue || 50} Impact Pts</span>
                  </div>
                </div>
                
                <CardTitle className="text-4xl font-black text-slate-900 leading-tight">{task.title}</CardTitle>
                
                <div className="flex flex-wrap gap-8 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {task.location}</span>
                  <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> MISSION START: T-MINUS {new Date(task.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  <span className={cn(
                    "flex items-center gap-2",
                    isFull ? "text-rose-500 font-black" : "text-primary"
                  )}>
                    <Users className="h-5 w-5" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5} {isFull ? "RESPONSES FULL" : "RESPONDERS"}
                  </span>
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

            {!isJoined && (
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-950 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
                <CardHeader className="p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">AI Mission Insight</CardTitle>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-3 text-slate-400 font-bold animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Responder Alignment...
                    </div>
                  ) : aiMatch ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Badge className={aiMatch.isMatch ? "bg-emerald-500" : "bg-amber-500"}>
                           {aiMatch.isMatch ? "IDEAL MATCH" : "ADVISORY"}
                         </Badge>
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed italic border-l-2 border-primary/50 pl-6 py-1">
                        "{aiMatch.matchReason}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 font-bold">Analysis not available for this profile.</p>
                  )}
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-28">
              <div className="h-3 bg-primary w-full" />
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black">
                  {isJoined ? (isCompleted ? "Verification Success" : "Active Handoff") : "Deployment Status"}
                </CardTitle>
                <CardDescription className="font-bold">
                  {isJoined ? (isCompleted ? "Points awarded to registry." : "On-site verification required.") : "Engage with this mission to start contributing."}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                {isCompleted ? (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto h-24 w-24 rounded-[2rem] bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                      <ShieldCheck className="h-12 w-12" />
                    </div>
                    <div className="p-6 rounded-3xl bg-emerald-50 text-emerald-700 border-2 border-emerald-100">
                      <span className="font-black text-lg">MISSION SUCCESS</span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                      This mission has been cryptographically verified. Your impact points have been added to your global rank.
                    </p>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black" asChild>
                      <Link href="/volunteer/dashboard">Return to Feed</Link>
                    </Button>
                  </div>
                ) : isJoined ? (
                  <div className="space-y-8">
                    <div className="flex justify-center p-6 bg-white rounded-[2rem] shadow-inner border-4 border-slate-50">
                      <QRCodeSVG 
                        value={missionData?.qrPayload || ""} 
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <QrCode className="h-5 w-5 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Token Active</p>
                      </div>
                      <p className="text-xs text-center text-slate-400 font-bold leading-relaxed">
                        Present this code to the NGO site administrator once the task is complete. They will scan it to verify your contribution.
                      </p>
                    </div>
                  </div>
                ) : isFull ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-amber-50 text-amber-700 border-2 border-amber-100 flex items-center justify-center gap-3">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="font-black text-lg uppercase">Capacity Full</span>
                    </div>
                    <p className="text-xs text-center text-slate-400 font-bold px-4 leading-relaxed">
                      This deployment has met its personnel requirements. Browse other active sectors for open missions.
                    </p>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black" asChild>
                      <Link href="/volunteer/tasks">Browse Other Tasks</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <Button 
                      className="w-full h-16 rounded-[1.5rem] text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95" 
                      onClick={handleJoin}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : "Deploy to Site"}
                    </Button>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        By deploying, you agree to follow NGO field safety protocols and ResQMate verification standards.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white">
              <CardHeader className="p-8">
                <CardTitle className="text-lg font-black">Expertise Needed</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex flex-wrap gap-2">
                {task.requiredSkills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs font-bold px-4 py-1.5 rounded-xl border-slate-200">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
