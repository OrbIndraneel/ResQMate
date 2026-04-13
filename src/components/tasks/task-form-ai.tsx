"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { generateNGOTaskDescription } from '@/ai/flows/ngo-task-description-generator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  "Food Distribution",
  "Medical Assistance",
  "Logistics & Transport",
  "Shelter & Housing",
  "Water & Sanitation",
  "Education",
  "Search & Rescue"
];

export function TaskFormAI() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState('');
  const [detailed, setDetailed] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateDescription = async () => {
    if (!brief) {
      toast({ title: "Error", description: "Please enter a brief overview first." });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateNGOTaskDescription({
        briefDescription: brief,
        urgency: urgency,
        location: location,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s)
      });
      setDetailed(result.detailedDescription);
      toast({ title: "AI Generated", description: "Task description has been expanded." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate AI description." });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to post tasks." });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: brief,
        description: detailed,
        urgency,
        category,
        location,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s),
        status: 'open',
        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        volunteersNeeded: 5,
        volunteersJoined: 0,
      });

      toast({ title: "Task Posted", description: "Your relief task is now live and matching volunteers." });
      router.push('/ngo/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save task: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Create Relief Task</CardTitle>
        <CardDescription>Use AI to quickly generate comprehensive task details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 border-b pb-6">
            <div className="space-y-2">
              <Label htmlFor="brief">Quick Summary</Label>
              <div className="flex gap-2">
                <Input 
                  id="brief" 
                  placeholder="e.g., Deliver water to camp sector B" 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  required
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="shrink-0 bg-accent text-white hover:bg-accent/90"
                  onClick={handleGenerateDescription}
                  disabled={generating}
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI Expand
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={urgency} onValueChange={(val: any) => setUrgency(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="GPS or Building" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills (Comma separated)</Label>
              <Input 
                id="skills" 
                placeholder="First Aid, Heavy Lifting, Driver" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailed">Detailed Task Description (AI Assisted)</Label>
            <Textarea 
              id="detailed" 
              className="min-h-[200px] font-body text-sm" 
              placeholder="The AI will fill this in..."
              value={detailed}
              onChange={(e) => setDetailed(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-12" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publish Relief Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
