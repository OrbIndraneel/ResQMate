"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Send, AlertCircle } from 'lucide-react';
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState('');
  const [detailed, setDetailed] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [pointsValue, setPointsValue] = useState('50');
  const { toast } = useToast();
  const router = useRouter();

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
        description: "Could not connect to AI services. Please try manually drafting or check your connection."
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "You must be logged in to deploy tasks." });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: brief,
        description: detailed || brief, // Fallback to brief if detailed is empty
        urgency,
        category,
        location,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s),
        status: 'open',
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        volunteersNeeded: 5,
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
    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary p-2 rounded-xl">
            <Send className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-black">Mission Dispatch</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Deploy high-impact tasks to our verified responder network.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {!detailed && (
          <Alert className="mb-8 bg-blue-50 border-blue-100 text-blue-800 rounded-2xl">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-bold">AI Assistance Available</AlertTitle>
            <AlertDescription>Enter a quick summary and click "AI Expand" to generate professional operational instructions.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brief" className="text-slate-700 font-bold px-1">Mission Summary</Label>
              <div className="flex gap-3">
                <Input 
                  id="brief" 
                  placeholder="e.g. Emergency Food Supply Delivery to Sector 4" 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  required
                  className="h-14 rounded-2xl border-slate-200 shadow-sm"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="shrink-0 h-14 px-6 rounded-2xl bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                  onClick={handleGenerateDescription}
                  disabled={generating}
                >
                  {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                  AI Expand
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 font-bold px-1">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency" className="text-slate-700 font-bold px-1">Urgency</Label>
                <Select value={urgency} onValueChange={(val: any) => setUrgency(val)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-700 font-bold px-1">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. City Hall Plaza" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points" className="text-slate-700 font-bold px-1">Reward Points</Label>
                <Input 
                  id="points" 
                  type="number"
                  placeholder="50" 
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-slate-700 font-bold px-1">Required Skills (Comma separated)</Label>
              <Input 
                id="skills" 
                placeholder="e.g. Driving, First Aid, Logistics" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailed" className="text-slate-700 font-bold px-1">Operational Instructions</Label>
            <Textarea 
              id="detailed" 
              className="min-h-[250px] rounded-[2rem] border-slate-200 font-medium text-slate-600 leading-relaxed p-6" 
              placeholder="Use 'AI Expand' or manually draft the mission plan here..."
              value={detailed}
              onChange={(e) => setDetailed(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white text-lg font-black shadow-2xl transition-all" disabled={loading}>
            {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Send className="mr-3 h-6 w-6" />}
            Deploy Mission Now
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
