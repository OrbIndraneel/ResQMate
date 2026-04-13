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
import { Loader2 } from 'lucide-react';

const SKILLS_LIST = [
  "First Aid", "Nursing", "Heavy Lifting", "Construction", 
  "Logistics", "Driving (HGV)", "Translation", "IT Support",
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

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName={user?.displayName || "Volunteer"} />
      <main className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Volunteer Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 border-none shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                {profileData.firstName?.[0] || 'V'}
              </div>
              <CardTitle>{profileData.firstName} {profileData.lastName}</CardTitle>
              <CardDescription>Active Responder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold text-green-600">Verified</span>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>Select skills for AI-powered task matching.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {SKILLS_LIST.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox 
                        id={skill} 
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <label htmlFor={skill} className="text-sm font-medium leading-none">
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Current Base City</Label>
                    <Input id="location" value={profileData.location} onChange={(e) => setProfileData({...profileData, location: e.target.value})} />
                  </div>
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
