
"use client";

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, MapPin, Navigation, ArrowRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock recognition stats (could be fetched from a user profile doc)
  const userStats = {
    points: 850,
    nextMilestone: 1000,
    tasksCompleted: 12,
    hoursContributed: 45
  };

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || 'Hero'}</h1>
            <p className="text-muted-foreground">Ready to help? There are critical tasks nearby matching your skills.</p>
          </div>
          <Link href="/volunteer/tasks">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Find More Tasks <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-md bg-primary text-primary-foreground lg:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Your Recognition</CardTitle>
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Elite Volunteer Rank</span>
                  <span>{userStats.points} / {userStats.nextMilestone} pts</span>
                </div>
                <Progress value={(userStats.points / userStats.nextMilestone) * 100} className="bg-white/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-80">Tasks</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{userStats.hoursContributed}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-80">Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Available Tasks Nearby</CardTitle>
                <CardDescription>Based on your GPS location and skills profile.</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 border-accent text-accent">
                <MapPin className="h-3 w-3" /> GPS Active
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <p className="text-muted-foreground">No active tasks available right now.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="p-4 rounded-xl border bg-card hover:border-accent transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{task.title}</h3>
                          <Badge className={task.urgency === 'emergency' ? 'bg-destructive' : 'bg-secondary'}>{task.urgency}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {task.location}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> AI Matched</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills?.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <Link href={`/volunteer/tasks/${task.id}`}>
                        <Button className="w-full md:w-auto bg-destructive hover:bg-destructive/90 text-white font-bold">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" className="w-full text-primary font-medium" asChild>
                <Link href="/volunteer/tasks">View all tasks</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
