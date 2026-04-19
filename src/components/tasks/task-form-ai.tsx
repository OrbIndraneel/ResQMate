"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Send, Users, ShieldAlert } from 'lucide-react';
import { generateNGOTaskDescription } from '@/ai/flows/ngo-task-description-generator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState('');
  const [detailed, setDetailed] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [pointsValue, setPointsValue] = useState('50');
  const [volunteersNeeded, setVolunteersNeeded] = useState('5');
  const { toast } = useToast();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Validating Command Auth...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="rounded-[2rem] border-2">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>You must be signed in as an NGO administrator to deploy new missions.</AlertDescription>
      </Alert>
    );
  }

  const handleGenerateDescription = async () => {
    if (!brief) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter a brief overview first." });
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
      
      if (result && result.detailedDescription) {
        setDetailed(result.detailedDescription);
        toast({ title: "AI Generation Complete", description: "Mission parameters have been optimized." });
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({ 
        variant: "destructive",
        title: "AI Optimization Failed", 
        description: "Could not connect to AI services. Please try manually drafting the mission."
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: brief,
        description: detailed || brief,
        urgency,
        category,
        location,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s),
        status: 'open',
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        volunteersNeeded: parseInt(volunteersNeeded) || 5,
        volunteersJoined: 0,
        pointsValue: parseInt(pointsValue) || 50,
      });

      toast({ title: "Mission Deployed", description: "Responder network has been notified." });
      router.push('/ngo/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deployment Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary p-2 rounded-xl">
            <Send className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-black">Mission Dispatch</CardTitle>
        </div>
        <CardDescription className="text-slate-400 font-medium">Deploy high-impact tasks to our verified responder network.</CardDescription>
      </CardHeader>
      <CardContent className="p-10">
        {!detailed && (
          <Alert className="mb-10 bg-blue-50 border-blue-100 text-blue-800 rounded-3xl border-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <AlertTitle className="font-black text-lg">AI Assistance Ready</AlertTitle>
            <AlertDescription className="font-medium">Enter a quick summary and click "AI Expand" to generate professional operational instructions.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brief" className="text-slate-700 font-black px-1 uppercase text-xs tracking-widest">Mission Summary</Label>
              <div className="flex flex-col md:flex-row gap-4">
                <Input 
                  id="brief" 
                  placeholder="e.g. Emergency Food Supply Delivery to Sector 4" 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  required
                  className="h-16 rounded-2xl border-slate-200 shadow-sm text-lg font-bold"
                />
                <Button 
                  type="button" 
                  className="shrink-0 h-16 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                  onClick={handleGenerateDescription}
                  disabled={generating}
                >
                  {generating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 mr-2" />}
                  AI Expand
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 font-black px-1 text-xs tracking-widest">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency" className="text-slate-700 font-black px-1 text-xs tracking-widest">Urgency</Label>
                <Select value={urgency} onValueChange={(val: any) => setUrgency(val)}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-700 font-black px-1 text-xs tracking-widest">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. City Hall Plaza" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-slate-200 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteersNeeded" className="text-slate-700 font-black px-1 text-xs tracking-widest">Cap</Label>
                <Input 
                  id="volunteersNeeded" 
                  type="number"
                  placeholder="5" 
                  value={volunteersNeeded}
                  onChange={(e) => setVolunteersNeeded(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-slate-200 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points" className="text-slate-700 font-black px-1 text-xs tracking-widest">Impact Pts</Label>
                <Input 
                  id="points" 
                  type="number"
                  placeholder="50" 
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-slate-700 font-black px-1 text-xs tracking-widest">Required Expertise (Comma separated)</Label>
              <Input 
                id="skills" 
                placeholder="e.g. Driving, First Aid, Logistics" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailed" className="text-slate-700 font-black px-1 text-xs tracking-widest">Mission Plan & Instructions</Label>
            <Textarea 
              id="detailed" 
              className="min-h-[300px] rounded-[2.5rem] border-slate-200 font-medium text-slate-600 leading-relaxed p-8 text-lg" 
              placeholder="Use 'AI Expand' or manually draft the mission plan here..."
              value={detailed}
              onChange={(e) => setDetailed(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-20 rounded-[2rem] bg-slate-900 hover:bg-black text-white text-xl font-black shadow-2xl transition-all active:scale-95" disabled={loading}>
            {loading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <Send className="mr-3 h-8 w-8" />}
            Deploy Mission to Responders
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}