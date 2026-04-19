
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Clock, Users, ShieldCheck, Loader2, BarChart3, Edit3, Trash2, Camera, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, onSnapshot, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsQR from 'jsqr';
import { cn } from '@/lib/utils';

export default function NGOTaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  
  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!params.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'tasks', params.id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
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

  const handleFinalizeMission = async () => {
    if (!confirm("Mark this mission as officially completed? This will lock the deployment registry.")) return;
    setCompleting(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      toast({ title: "Mission Finalized", description: "The task status has been updated to completed across the network." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setCompleting(false);
    }
  };

  const startScanner = async () => {
    if (task.status === 'completed') {
      toast({ variant: "destructive", title: "Mission Closed", description: "Cannot verify responders for a completed mission." });
      return;
    }
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      toast({
        variant: "destructive",
        title: "Scanner Blocked",
        description: "Please allow camera access to verify mission completion.",
      });
      setShowScanner(false);
    }
  };

  useEffect(() => {
    let request: number;
    const scan = () => {
      if (cameraActive && videoRef.current && canvasRef.current && !verifying) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleVerify(code.data);
          }
        }
      }
      request = requestAnimationFrame(scan);
    };

    if (cameraActive) {
      request = requestAnimationFrame(scan);
    }

    return () => cancelAnimationFrame(request);
  }, [cameraActive, verifying]);

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
    setShowScanner(false);
    setVerifying(false);
  };

  const handleVerify = async (qrData: string) => {
    if (verifying) return;
    
    if (!qrData.startsWith('RESQMATE_VERIFY:')) return;

    setVerifying(true);
    const [, volunteerId, taskId] = qrData.split(':');

    if (taskId !== task.id) {
      toast({
        variant: "destructive",
        title: "Task Mismatch",
        description: "This QR code is for a different mission.",
      });
      setVerifying(false);
      return;
    }

    try {
      const responseRef = doc(db, 'task_responses', `${volunteerId}_${taskId}`);
      const responseSnap = await getDoc(responseRef);

      if (!responseSnap.exists()) {
        throw new Error("Mission response not found in registry.");
      }

      const responseData = responseSnap.data();
      if (responseData.status === 'completed') {
        throw new Error("This responder has already been verified.");
      }

      await updateDoc(responseRef, {
        status: 'completed',
        verifiedAt: new Date().toISOString()
      });

      const points = task.pointsValue || 50;
      await updateDoc(doc(db, 'users', volunteerId), {
        points: increment(points),
        tasksCompleted: increment(1),
        hoursContributed: increment(2)
      });

      toast({
        title: "Handoff Verified",
        description: `Mission completed by responder. ${points} points awarded.`,
      });
      
      stopScanner();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
      setVerifying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>;
  if (!task) return <div className="p-10 text-center">Mission dossier not found.</div>;

  const isCompleted = task.status === 'completed';

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
                  <Badge className={cn(
                    "border-none px-4 py-2 rounded-xl font-black",
                    isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
                  )}>
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
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                  <p className="text-3xl font-black">{task.volunteersJoined || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Confirmed</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                  <p className="text-3xl font-black">{task.volunteersNeeded || 5}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Target</p>
                </div>
                <div className="p-6 bg-primary/20 rounded-3xl border border-primary/20 flex flex-col justify-center text-center">
                  <p className="text-xl font-black text-primary">{( (task.volunteersJoined || 0) / (task.volunteersNeeded || 5) * 100 ).toFixed(0)}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Fill Rate</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-28">
              <div className={cn("h-3 w-full", isCompleted ? "bg-emerald-500" : "bg-primary")} />
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black">Tactical Command</CardTitle>
                <CardDescription className="font-bold">
                  {isCompleted ? "This mission is finalized." : "On-site verification portal."}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                <Button 
                  className="w-full h-20 rounded-[1.5rem] font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  onClick={startScanner}
                  disabled={isCompleted}
                >
                  <Camera className="h-7 w-7" /> Verify Completion
                </Button>
                
                <div className="h-px bg-slate-100 my-2" />
                
                {!isCompleted && (
                   <Button 
                    className="w-full h-14 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg active:scale-95 transition-all"
                    onClick={handleFinalizeMission}
                    disabled={completing}
                  >
                    {completing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Finalize Mission
                  </Button>
                )}
                
                <Button variant="ghost" className="w-full h-14 rounded-xl font-bold text-slate-500 hover:text-slate-900">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Parameters
                </Button>
                <Button variant="ghost" className="w-full h-14 rounded-xl font-bold text-slate-500 hover:text-slate-900">
                  <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                </Button>
                
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-xl font-bold shadow-lg shadow-rose-50"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
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

      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] bg-slate-950">
          <DialogHeader className="p-8 pb-4 text-center">
            <DialogTitle className="text-white text-2xl font-black tracking-tight">On-Site Verification</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
             {cameraActive ? (
               <div className="relative w-full h-full">
                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                 <div className="absolute inset-0 border-[40px] border-slate-950/40 pointer-events-none">
                    <div className="w-full h-full border-2 border-primary/50 relative">
                       <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                       <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                       <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                       <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />
                       
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/20 rounded-3xl animate-pulse" />
                    </div>
                 </div>
                 {verifying && (
                   <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center gap-4">
                     <Loader2 className="h-12 w-12 animate-spin text-primary" />
                     <p className="font-black text-xl tracking-tight">Verifying Credentials...</p>
                   </div>
                 )}
               </div>
             ) : (
               <div className="p-10 text-center space-y-6">
                 <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
                   <Camera className="h-10 w-10 text-slate-500" />
                 </div>
                 <p className="text-slate-400 font-bold">Waiting for tactical optics...</p>
               </div>
             )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="p-8 text-center space-y-6">
            <p className="text-slate-500 text-sm font-medium">Position the volunteer's ResQMate QR code within the scanning frame.</p>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-black border-2 border-slate-800 text-slate-400 hover:text-white" onClick={stopScanner}>
              <X className="mr-2 h-5 w-5" /> Cancel Scan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
