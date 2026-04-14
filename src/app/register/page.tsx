
"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Upload, CheckCircle2, Send, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { sendEmailOTP } from '../admin/login/actions';
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
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [primarySkill, setPrimarySkill] = useState('');
  const [otherSkillText, setOtherSkillText] = useState('');
  const [selectedAdditionalSkills, setSelectedAdditionalSkills] = useState<string[]>([]);
  const [volunteerProofBase64, setVolunteerProofBase64] = useState<string | null>(null);
  
  const [orgName, setOrgName] = useState('');
  const [orgLocation, setOrgLocation] = useState('');
  const [orgProofBase64, setOrgProofBase64] = useState<string | null>(null);
  
  const [role, setRole] = useState(initialRole);
  const router = useRouter();
  const { toast } = useToast();

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

  const generateVolunteerId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VOL-${new Date().getFullYear()}-${random}`;
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'volunteer' && !volunteerProofBase64) {
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload proof of your profession." });
      return;
    }

    if (role === 'ngo' && !orgProofBase64) {
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload proof of NGO existence." });
      return;
    }

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
      return;
    }
    
    setLoading(true);

    try {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);

      const result = await sendEmailOTP(email, mockOtp, false);
      
      if (result?.error === "SMTP_MISSING") {
        toast({
          title: "Developer Mode",
          description: "Check server console for your verification code.",
        });
      } else {
        toast({
          title: "Code Sent",
          description: `Verification code sent to ${email}`,
        });
      }
      
      setStep('otp');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The verification code is incorrect.",
      });
      return;
    }

    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    try {
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        user = userCredential.user;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          try {
            const signInResult = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            user = signInResult.user;
          } catch (signInError: any) {
            throw new Error("Account exists with a different password. Please log in or reset your password.");
          }
        } else {
          throw authError;
        }
      }
      
      if (!user) throw new Error("Could not establish session.");

      const displayName = role === 'volunteer' ? `${firstName} ${lastName}` : orgName;
      await updateProfile(user, { displayName });

      const volunteerId = role === 'volunteer' ? generateVolunteerId() : null;
      const finalPrimarySkill = primarySkill === 'Other' ? otherSkillText : primarySkill;

      const registrationData = {
        uid: user.uid,
        email: normalizedEmail,
        role: role,
        submittedAt: new Date().toISOString(),
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

      // STORE IN DEDICATED REGISTRATIONS TABLE
      await setDoc(doc(db, 'registrations', user.uid), registrationData);

      toast({
        title: "Application Submitted",
        description: "Your credentials are now in the 'Registrations' table for admin review.",
      });

      window.location.href = '/login';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
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
            {step === 'details' ? "Help coordinate humanitarian efforts across the globe." : "Verify your identity to complete registration."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <Tabs defaultValue={initialRole} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
                <TabsTrigger value="ngo">NGO Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="volunteer">
                <form onSubmit={handleStartRegistration} className="space-y-6">
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

                  <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="v-email">Email Address</Label>
                      <Input id="v-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="v-password">Create Password</Label>
                      <div className="relative">
                        <Input 
                          id="v-password" 
                          type={showPassword ? "text" : "password"} 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Verify & Apply</>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="ngo">
                <form onSubmit={handleStartRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="n-org">Organization Name</Label>
                    <Input id="n-org" placeholder="e.g. Hope Relief International" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="n-location">Headquarters / Main Location</Label>
                    <Input id="n-location" placeholder="City, Country" required value={orgLocation} onChange={(e) => setOrgLocation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="n-proof">Proof of NGO Existence (JPEG)</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <input id="n-proof" type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, 'ngo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {orgProofBase64 ? (
                        <div className="flex items-center text-secondary gap-2">
                          <CheckCircle2 className="h-8 w-8" />
                          <span className="text-sm font-medium">NGO Proof Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground gap-2">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Upload NGO Certification</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="n-email">Admin Email Address</Label>
                      <Input id="n-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="n-password">Admin Password</Label>
                      <div className="relative">
                        <Input 
                          id="n-password" 
                          type={showPassword ? "text" : "password"} 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-secondary text-secondary-foreground" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Verify & Apply</>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleFinalVerify} className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg text-center mb-6">
                <p className="text-sm text-primary font-medium">Verification code sent to: <span className="font-bold">{email}</span></p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-otp">6-Digit Code</Label>
                <Input 
                  id="reg-otp" 
                  type="text" 
                  placeholder="000000" 
                  required 
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Submit Application</>}
              </Button>
              <Button variant="ghost" type="button" className="w-full text-muted-foreground" onClick={() => setStep('details')}>
                Back to Details
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Already applied?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Log in to check status</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
