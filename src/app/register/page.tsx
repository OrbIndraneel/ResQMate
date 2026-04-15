
"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Upload, CheckCircle2, Send, KeyRound, Eye, EyeOff, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { sendEmailOTP } from '../admin/login/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [affiliationType, setAffiliationType] = useState<'independent' | 'ngo_affiliated'>('independent');
  const [affiliatedNgoName, setAffiliatedNgoName] = useState('');
  
  const [orgName, setOrgName] = useState('');
  const [orgLocation, setOrgLocation] = useState('');
  const [orgProofBase64, setOrgProofBase64] = useState<string | null>(null);
  const [volunteerProofBase64, setVolunteerProofBase64] = useState<string | null>(null);
  
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
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload professional verification." });
      return;
    }

    if (role === 'ngo' && !orgProofBase64) {
      toast({ variant: "destructive", title: "Proof Required", description: "Please upload NGO certification." });
      return;
    }

    setLoading(true);

    try {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);

      const result = await sendEmailOTP(email, mockOtp, false);
      
      if (result?.error === "SMTP_MISSING") {
        toast({ title: "Dev Mode", description: "Check server console for verification code." });
      } else {
        toast({ title: "Code Sent", description: `Verification code sent to ${email}` });
      }
      
      setStep('otp');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The code is incorrect." });
      return;
    }

    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;
      
      const displayName = role === 'volunteer' ? `${firstName} ${lastName}` : orgName;
      await updateProfile(user, { displayName });

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
          primarySkill,
          affiliationType,
          affiliatedNgoName: affiliationType === 'ngo_affiliated' ? affiliatedNgoName : 'Independent',
          proofImage: volunteerProofBase64,
          volunteerId: generateVolunteerId(),
        } : {
          organizationName: orgName,
          location: orgLocation,
          proofImage: orgProofBase64,
        })
      };

      await setDoc(doc(db, 'registrations', user.uid), registrationData);

      toast({
        title: "Success",
        description: "Application submitted for review.",
      });

      window.location.href = '/login';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12 hero-gradient">
      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-10 pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl text-white shadow-xl shadow-primary/20">
              <Shield className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-slate-900">Join the Network</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {step === 'details' ? "Coordinate global relief missions." : "Verify your identity."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          {step === 'details' ? (
            <Tabs defaultValue={initialRole} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 p-1 h-12 rounded-2xl">
                <TabsTrigger value="volunteer" className="rounded-xl font-bold">Volunteer</TabsTrigger>
                <TabsTrigger value="ngo" className="rounded-xl font-bold">NGO Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="volunteer">
                <form onSubmit={handleStartRegistration} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">First Name</Label>
                      <Input required className="h-12 rounded-xl border-slate-200" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Last Name</Label>
                      <Input required className="h-12 rounded-xl border-slate-200" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Professional Status</Label>
                    <Input placeholder="e.g. Paramedic, Structural Engineer" required className="h-12 rounded-xl border-slate-200" value={profession} onChange={(e) => setProfession(e.target.value)} />
                  </div>

                  <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <Label className="text-slate-900 font-black text-sm uppercase tracking-wider">Mission Affiliation</Label>
                    <RadioGroup value={affiliationType} onValueChange={(val: any) => setAffiliationType(val)} className="grid gap-4">
                      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <RadioGroupItem value="independent" id="independent" />
                        <Label htmlFor="independent" className="flex flex-col cursor-pointer">
                          <span className="font-bold text-slate-900">Independent Responder</span>
                          <span className="text-xs text-slate-500">I work across all NGO tasks in the network.</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <RadioGroupItem value="ngo_affiliated" id="ngo_affiliated" />
                        <Label htmlFor="ngo_affiliated" className="flex flex-col cursor-pointer">
                          <span className="font-bold text-slate-900">NGO Affiliated</span>
                          <span className="text-xs text-slate-500">I am a member of a specific organization.</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {affiliationType === 'ngo_affiliated' && (
                      <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-slate-700 font-bold ml-1 text-xs">Target Organization Name</Label>
                        <Input 
                          placeholder="Search or enter NGO name..." 
                          required 
                          className="h-12 rounded-xl border-slate-200 mt-2 bg-white"
                          value={affiliatedNgoName}
                          onChange={(e) => setAffiliatedNgoName(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Professional Verification (JPEG)</Label>
                    <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-[2rem] p-10 hover:bg-slate-50 transition-all cursor-pointer relative group">
                      <input type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, 'volunteer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {volunteerProofBase64 ? (
                        <div className="flex flex-col items-center text-primary gap-4">
                          <CheckCircle2 className="h-12 w-12" />
                          <span className="font-bold">Credential Attached</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 gap-4">
                          <Upload className="h-10 w-10 group-hover:-translate-y-2 transition-transform" />
                          <span className="text-sm font-bold uppercase tracking-widest">Upload Certification</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Contact Email</Label>
                      <Input type="email" required className="h-12 rounded-xl border-slate-200" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Secure Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          className="h-12 rounded-xl border-slate-200"
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Send className="mr-2 h-6 w-6" /> Start Verification</>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="ngo">
                <form onSubmit={handleStartRegistration} className="space-y-8">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Organization Legal Name</Label>
                    <Input placeholder="e.g. World Food Programme" required className="h-12 rounded-xl border-slate-200" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">HQ Location</Label>
                    <Input placeholder="City, Country" required className="h-12 rounded-xl border-slate-200" value={orgLocation} onChange={(e) => setOrgLocation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">NGO Certification (JPEG)</Label>
                    <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-[2rem] p-10 hover:bg-slate-50 transition-all cursor-pointer relative group">
                      <input type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, 'ngo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {orgProofBase64 ? (
                        <div className="flex flex-col items-center text-accent gap-4">
                          <CheckCircle2 className="h-12 w-12" />
                          <span className="font-bold">NGO Doc Attached</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 gap-4">
                          <Upload className="h-10 w-10 group-hover:-translate-y-2 transition-transform" />
                          <span className="text-sm font-bold uppercase tracking-widest">Upload NGO Proof</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Admin Email</Label>
                      <Input type="email" required className="h-12 rounded-xl border-slate-200" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Admin Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          className="h-12 rounded-xl border-slate-200"
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-2xl bg-slate-900 text-white text-lg font-black shadow-2xl" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Building2 className="mr-2 h-6 w-6" /> Register Organization</>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleFinalVerify} className="space-y-8 text-center">
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8">
                <p className="text-sm text-slate-600 font-medium">Verify your email address:</p>
                <p className="text-lg font-black text-primary mt-1">{email}</p>
              </div>
              <div className="space-y-4">
                <Label className="text-slate-700 font-bold uppercase tracking-widest text-xs">Enter 6-Digit Mission Code</Label>
                <Input 
                  type="text" 
                  placeholder="000000" 
                  required 
                  maxLength={6}
                  className="h-20 text-center text-4xl tracking-[0.5em] font-mono rounded-2xl border-2 border-primary/20 focus:border-primary transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><KeyRound className="mr-2 h-6 w-6" /> Verify & Complete</>}
              </Button>
              <Button variant="ghost" type="button" className="w-full text-slate-400 font-bold" onClick={() => setStep('details')}>
                Back to Details
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-8 pb-10">
          <div className="text-sm text-slate-500 font-medium">
            Joined already?{" "}
            <Link href="/login" className="text-primary hover:underline font-black">Secure Sign In</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
