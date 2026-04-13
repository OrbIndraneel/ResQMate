"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Clock, Users, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, 'tasks', params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  const handleJoin = async () => {
    if (!user || !task) return;
    setProcessing(true);
    try {
      const docRef = doc(db, 'tasks', task.id);
      await updateDoc(docRef, {
        volunteersJoined: increment(1)
      });
      setTask({ ...task, volunteersJoined: (task.volunteersJoined || 0) + 1 });
      toast({
        title: "Joined Successfully",
        description: "You have been registered for this relief task.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !task) return;
    setProcessing(true);
    try {
      const taskPoints = task.pointsValue || 50;
      
      // Update Task status
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'completed'
      });

      // Update User stats
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(taskPoints),
        tasksCompleted: increment(1),
        hoursContributed: increment(2) // Mocking 2 hours per task
      });

      toast({
        title: "Task Completed!",
        description: `Excellent work. You earned ${taskPoints} impact points!`,
      });
      
      router.push('/volunteer/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!task) {
    return <div className="p-10 text-center">Task not found.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      <main className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <Link href="/volunteer/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant={task.urgency === 'emergency' ? 'destructive' : 'secondary'} className="uppercase">
                    {task.urgency}
                  </Badge>
                  <div className="flex items-center text-primary font-bold gap-1 bg-primary/10 px-3 py-1 rounded-full">
                    <Sparkles className="h-4 w-4" />
                    <span>{task.pointsValue || 50} Pts</span>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">{task.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {task.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> Posted {new Date(task.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5} Volunteers</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {task.description}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Required Expertise</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {task.requiredSkills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-sm px-4 py-1">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-accent w-full" />
              <CardHeader>
                <CardTitle className="text-lg">Deployment Action</CardTitle>
                <CardDescription>Join this mission to provide immediate relief.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.status === 'completed' ? (
                  <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-bold">Mission Completed</span>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" 
                      onClick={handleJoin}
                      disabled={processing || (task.volunteersJoined >= task.volunteersNeeded)}
                    >
                      {processing ? <Loader2 className="animate-spin mr-2" /> : "I'm Ready to Help"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-12 font-bold border-2"
                      onClick={handleComplete}
                      disabled={processing}
                    >
                      Mark as Completed
                    </Button>
                    
                    <p className="text-[10px] text-center text-muted-foreground">
                      By marking as completed, you verify the task is finished site-side.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
