"use client";

import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, BadgeCheck, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SKILLS_LIST = [
  "First Aid", "Nursing", "Heavy Lifting", "Construction", 
  "Logistics", "Driving", "Translation", "IT Support",
  "Cooking", "Counseling", "Security", "Search & Rescue"
];

export default function VolunteerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    profession: '',
    volunteerId: '',
    verificationStatus: 'pending'
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            location: data.location || '',
            profession: data.profession || '',
            volunteerId: data.volunteerId || 'Assigning...',
            verificationStatus: data.verificationStatus || 'pending'
          });
          setSelectedSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        skills: selectedSkills,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save: " + error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const StatusIcon = () => {
    switch (profileData.verificationStatus) {
      case 'verified': return <BadgeCheck className="h-5 w-5 text-green-500" />;
      case 'rejected': return <ShieldAlert className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      <main className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Your Responder Identity</h1>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-xs font-bold text-muted-foreground uppercase">ID:</span>
            <span className="font-mono font-bold text-primary">{profileData.volunteerId}</span>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 border-4 border-white shadow-inner flex items-center justify-center text-primary text-3xl font-bold mb-4">
                  {profileData.firstName?.[0] || 'V'}
                </div>
                <CardTitle>{profileData.firstName} {profileData.lastName}</CardTitle>
                <CardDescription className="capitalize">{profileData.profession || 'Humanitarian Volunteer'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon />
                    <span className="text-sm font-bold capitalize">{profileData.verificationStatus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/5 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-primary">0</p>
                    <p className="text-[10px] uppercase font-bold opacity-70">Impact Points</p>
                  </div>
                  <div className="bg-secondary/5 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-secondary">0</p>
                    <p className="text-[10px] uppercase font-bold opacity-70">Deployments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>Verified responders receive higher priority for specialized tasks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-first">First Name</Label>
                    <Input id="v-first" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-last">Last Name</Label>
                    <Input id="v-last" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-profession">Profession</Label>
                    <Input id="v-profession" value={profileData.profession} onChange={(e) => setProfileData({...profileData, profession: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Current Base City</Label>
                    <Input id="location" value={profileData.location} onChange={(e) => setProfileData({...profileData, location: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Validated Skills</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {SKILLS_LIST.map(skill => (
                      <div key={skill} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Checkbox 
                          id={`skill-${skill}`} 
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-xs font-medium leading-none cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                  Save Responder Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
