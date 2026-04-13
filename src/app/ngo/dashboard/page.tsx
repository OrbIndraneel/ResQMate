import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, AlertCircle, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function NGODashboard() {
  // Mock data for NGO dashboard
  const activeTasks = [
    { id: '1', title: 'Food Distribution - Zone 4', urgency: 'emergency', volunteersNeeded: 5, volunteersJoined: 3, status: 'in-progress' },
    { id: '2', title: 'Medical Supplies Transport', urgency: 'normal', volunteersNeeded: 2, volunteersJoined: 2, status: 'ready' },
  ];

  const recentRequests = [
    { id: 'a', task: 'First Aid Support', volunteer: 'Sarah Jenkins', skills: ['First Aid', 'Nursing'], time: '2 mins ago' },
    { id: 'b', task: 'Shelter Assembly', volunteer: 'Mike Ross', skills: ['Construction', 'Logistics'], time: '15 mins ago' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="ngo" userName="Red Cross Relief" />
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">NGO Operations</h1>
            <p className="text-muted-foreground">Manage your relief tasks and volunteer coordination.</p>
          </div>
          <Link href="/ngo/tasks/new">
            <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-bold">
              <Plus className="mr-2 h-5 w-5" /> Post Relief Task
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">4 tasks nearing deadline</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Volunteers Active</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+12 since yesterday</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified Completion</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Verification rate is healthy</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Immediate action required</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader>
              <CardTitle>Current Relief Tasks</CardTitle>
              <CardDescription>Track real-time status of your posted operations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant={task.urgency === 'emergency' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                        {task.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {task.volunteersJoined}/{task.volunteersNeeded} Volunteers</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-muted text-[10px] font-bold">{task.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Active Tasks</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Qualified volunteers applying for tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentRequests.map(req => (
                <div key={req.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold">{req.volunteer}</p>
                    <span className="text-[10px] text-muted-foreground">{req.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Applied for: <span className="text-foreground font-medium">{req.task}</span></p>
                  <div className="flex flex-wrap gap-1">
                    {req.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-[9px] py-0">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1 h-7 text-xs">Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">Profile</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
