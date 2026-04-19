"use client";

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, Search, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  "All Categories",
  "Food Distribution",
  "Medical Assistance",
  "Logistics & Transport",
  "Shelter & Housing",
  "Water & Sanitation",
  "Education",
  "Search & Rescue"
];

export default function BrowseTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open')
    );

    if (categoryFilter !== "All Categories") {
      q = query(q, where('category', '==', categoryFilter));
    }

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
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryFilter]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName="Volunteer" />
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <h1 className="text-3xl font-bold text-primary">Browse Relief Tasks</h1>
            <p className="text-muted-foreground">Filter by category or search for specific needs.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-muted-foreground">No tasks found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => {
              const isFull = (task.volunteersJoined || 0) >= (task.volunteersNeeded || 5);
              return (
                <Card key={task.id} className={cn(
                  "border-none shadow-md transition-all bg-card flex flex-col",
                  isFull ? "opacity-75" : "hover:ring-2 ring-primary/20"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-secondary border-secondary">
                        {task.category || 'General'}
                      </Badge>
                      <Badge className={cn(
                        isFull ? "bg-slate-500" : task.urgency === 'emergency' ? 'bg-destructive' : 'bg-secondary'
                      )}>
                        {isFull ? "MISSION FULL" : task.urgency}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1 text-primary" /> {task.location}
                      </div>
                      <div className="flex items-center text-[10px] font-black uppercase text-slate-400">
                        <Users className="h-3 w-3 mr-1" /> {task.volunteersJoined || 0}/{task.volunteersNeeded || 5}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {task.requiredSkills?.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>
                      ))}
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 mt-auto" asChild disabled={isFull}>
                      <Link href={`/volunteer/tasks/${task.id}`}>
                        {isFull ? "Mission Capacity Reached" : "Apply to Help"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}