"use client";

import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const SKILLS_LIST = [
  "First Aid", "Nursing", "Heavy Lifting", "Construction", 
  "Logistics", "Driving (HGV)", "Translation", "IT Support",
  "Cooking", "Counseling", "Security", "Search & Rescue"
];

export default function VolunteerProfile() {
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["First Aid", "Driving (HGV)"]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your skills and preferences have been saved. AI matching is updated.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="volunteer" userName="Alex Rivera" />
      <main className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Volunteer Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 border-none shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                AR
              </div>
              <CardTitle>Alex Rivera</CardTitle>
              <CardDescription>Volunteer since Jan 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points</span>
                <span className="font-bold">850</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verification Rate</span>
                <span className="font-bold">100%</span>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>Select your verified skills for accurate AI matching.</CardDescription>
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
                      <label htmlFor={skill} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                <CardDescription>Used for emergency alerts and NGO communication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 (555) 000-1122" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Current Base City</Label>
                    <Input id="location" defaultValue="San Francisco, CA" />
                  </div>
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90" onClick={handleSave}>
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
