"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VOLUNTEER_SKILLS = [
  "First Aid", "Nursing", "Heavy Lifting", "Logistics", "Driving", 
  "Translation", "IT Support", "Cooking", "Construction", 
  "Counseling", "Security", "Search & Rescue", "Other"
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'volunteer';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Volunteer Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [primarySkill, setPrimarySkill] = useState('');
  const [otherSkillText, setOtherSkillText] = useState('');
  const [selectedAdditionalSkills, setSelectedAdditionalSkills] = useState<string[]>([]);
  const [volunteerProofBase64, setVolunteerProofBase64] = useState<string | null>(null);
  
  // NGO Fields
  const [orgName, setOrgName] = useState('');
  const [orgLocation, setOrgLocation] = useState('');
  const [orgProofBase64, setOrgProofBase64] = useState<string | null>(null);
  
  const [role, setRole] = useState(initialRole);
  const router = useRouter();
  const { toast } = useToast();

  const isConfigMissing = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'undefined';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'volunteer' | 'ngo') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload a JPEG image.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'volunteer') setVolunteerProofBase64(reader.result as string);
        else setOrgProofBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAdditionalSkill = (skill: string) => {
    setSelectedAdditionalSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const generateVolunteerId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VOL-${new Date().getFullYear()}-${random}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase configuration is missing." });
      return;
    }

    if (role === 'volunteer' && !volunteerProofBase64) {
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload proof of your profession." });
      return;
    }

    if (role === 'ngo' && !orgProofBase64) {
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload proof of NGO existence." });
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const displayName = role === 'volunteer' ? `${firstName} ${lastName}` : orgName;
      await updateProfile(user, { displayName });

      const volunteerId = role === 'volunteer' ? generateVolunteerId() : null;
      const finalPrimarySkill = primarySkill === 'Other' ? otherSkillText : primarySkill;

      const userData = {
        uid: user.uid,
        email,
        role: role,
        createdAt: new Date().toISOString(),
        verificationStatus: 'pending',
        ...(role === 'volunteer' ? {
          firstName,
          lastName,
          profession,
          primarySkill: finalPrimarySkill,
          additionalSkills: selectedAdditionalSkills,
          proofImage: volunteerProofBase64,
          volunteerId: volunteerId,
        } : {
          organizationName: orgName,
          location: orgLocation,
          proofImage: orgProofBase64,
        })
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      toast({
        title: "Registration Successful",
        description: role === 'volunteer' 
          ? `Welcome! Your ID ${volunteerId} is awaiting verification.` 
          : "Your NGO profile has been created and is pending verification.",
      });

      router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-2xl shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join ResQMate</CardTitle>
          <CardDescription>
            Help coordinate humanitarian efforts across the globe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigMissing && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>Firebase API keys are missing in the environment.</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={initialRole} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="ngo">NGO Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteer">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-first">First Name</Label>
                    <Input id="v-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-last">Last Name</Label>
                    <Input id="v-last" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-profession">Profession</Label>
                  <Input id="v-profession" placeholder="e.g. Registered Nurse, Logistics Expert" required value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Primary Expertise</Label>
                  <Select onValueChange={setPrimarySkill} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOLUNTEER_SKILLS.map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {primarySkill === 'Other' && (
                    <Input 
                      className="mt-2" 
                      placeholder="Please specify your skill" 
                      required 
                      value={otherSkillText}
                      onChange={(e) => setOtherSkillText(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Additional Skills</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {VOLUNTEER_SKILLS.filter(s => s !== 'Other').map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`} 
                          checked={selectedAdditionalSkills.includes(skill)}
                          onCheckedChange={() => toggleAdditionalSkill(skill)}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-xs font-medium cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-proof">Professional ID / Certification (JPEG)</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <input id="v-proof" type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, 'volunteer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {volunteerProofBase64 ? (
                      <div className="flex items-center text-primary gap-2">
                        <CheckCircle2 className="h-8 w-8" />
                        <span className="text-sm font-medium">Document Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground gap-2">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Upload Professional Proof</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-email">Email</Label>
                    <Input id="v-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-password">Password</Label>
                    <Input id="v-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register as Volunteer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="ngo">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n-org">Organization Name</Label>
                  <Input id="n-org" placeholder="e.g. Hope Relief International" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-location">Headquarters / Main Location</Label>
                  <Input id="n-location" placeholder="City, Country" required value={orgLocation} onChange={(e) => setOrgLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-proof">Proof of NGO Existence (Registration/Charter JPEG)</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <input id="n-proof" type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, 'ngo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {orgProofBase64 ? (
                      <div className="flex items-center text-secondary gap-2">
                        <CheckCircle2 className="h-8 w-8" />
                        <span className="text-sm font-medium">Registration Document Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground gap-2">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Upload NGO Certification</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="n-email">Admin Email</Label>
                    <Input id="n-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="n-password">Password</Label>
                    <Input id="n-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary text-secondary-foreground" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register NGO Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Log in here</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
