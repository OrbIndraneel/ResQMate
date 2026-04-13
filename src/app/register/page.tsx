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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const VOLUNTEER_SKILLS = [
  "First Aid", "Nursing", "Heavy Lifting", "Logistics", "Driving", "Translation", "IT Support", "Cooking"
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'volunteer';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState(initialRole);
  const router = useRouter();
  const { toast } = useToast();

  const isConfigMissing = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'undefined';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setProofBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
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
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase API keys are missing.",
      });
      return;
    }

    if (role === 'volunteer' && !proofBase64) {
      toast({
        variant: "destructive",
        title: "Proof Required",
        description: "Please upload a JPEG proof of your profession.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const volunteerId = role === 'volunteer' ? generateVolunteerId() : null;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        role: role,
        firstName: role === 'volunteer' ? firstName : '',
        lastName: role === 'volunteer' ? lastName : '',
        organizationName: role === 'ngo' ? orgName : '',
        profession: role === 'volunteer' ? profession : '',
        skills: role === 'volunteer' ? selectedSkills : [],
        proofImage: role === 'volunteer' ? proofBase64 : null,
        volunteerId: volunteerId,
        verificationStatus: role === 'volunteer' ? 'pending' : 'verified',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Account Created",
        description: role === 'volunteer' 
          ? `Welcome! Your ID ${volunteerId} is pending verification.` 
          : "Welcome to ResQMate! Your profile is ready.",
      });

      router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
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
              <AlertTitle>Environment Keys Missing</AlertTitle>
              <AlertDescription>
                Please ensure you have added your Firebase keys to the .env file.
              </AlertDescription>
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
                  <Input id="v-profession" placeholder="e.g. Registered Nurse, Civil Engineer" required value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>

                <div className="space-y-3">
                  <Label>Key Skills</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {VOLUNTEER_SKILLS.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`} 
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-xs font-medium cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-proof">Proof of Profession (JPEG Format Only)</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <input 
                      id="v-proof" 
                      type="file" 
                      accept="image/jpeg" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {proofBase64 ? (
                      <div className="flex items-center text-primary gap-2">
                        <CheckCircle2 className="h-8 w-8" />
                        <span className="text-sm font-medium">Image Uploaded Successfully</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground gap-2">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Click or drag to upload JPEG</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-email">Email Address</Label>
                  <Input id="v-email" type="email" placeholder="alex@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-password">Password</Label>
                  <Input id="v-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="ngo">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n-org">Organization Name</Label>
                  <Input id="n-org" placeholder="Red Cross, UNICEF, etc." required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-email">Admin Email Address</Label>
                  <Input id="n-email" type="email" placeholder="admin@org.org" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-password">Password</Label>
                  <Input id="n-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-secondary" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register as NGO Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
