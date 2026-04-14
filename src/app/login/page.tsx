
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Send, KeyRound, User, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendEmailOTP } from '../admin/login/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Internal consistent password for prototype authentication
const PROTO_PWD = "ResQMate-Internal-Auth-2024";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [role, setRole] = useState<string>('volunteer');
  const router = useRouter();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify user exists with the selected role
      const q = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase()),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Account Not Found",
          description: `No ${role === 'ngo' ? 'NGO' : 'Volunteer'} account is registered with this email.`,
        });
        setLoading(false);
        return;
      }

      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);

      const result = await sendEmailOTP(email, mockOtp, false);
      
      if (result?.error === "SMTP_MISSING") {
        toast({
          variant: "destructive",
          title: "SMTP Not Configured",
          description: "Developer Mode: Check server console for code.",
        });
      } else {
        toast({
          title: "Code Sent",
          description: `Verification code sent to ${email}`,
        });
      }
      
      setStep('otp');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
    try {
      // Officially sign in with Firebase Auth to establish a session
      await signInWithEmailAndPassword(auth, email, PROTO_PWD);

      toast({
        title: "Login Successful",
        description: "Welcome back to ResQMate.",
      });

      if (role === 'ngo') {
        router.push('/ngo/dashboard');
      } else {
        router.push('/volunteer/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to establish a secure session. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">ResQMate Login</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? "Select your role and enter your email." 
              : "Enter the 6-digit code sent to your inbox."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="volunteer" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Volunteer
                </TabsTrigger>
                <TabsTrigger value="ngo" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> NGO Admin
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder={role === 'ngo' ? "admin@organization.org" : "yourname@email.com"} 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Login Code</>}
                </Button>
              </form>
            </Tabs>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-primary/5 p-3 rounded-lg text-center mb-4">
                <p className="text-xs text-primary font-medium">
                  Verifying <span className="font-bold">{role.toUpperCase()}</span> access for {email}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="000000" 
                  required 
                  maxLength={6}
                  className="text-center text-xl tracking-[0.5em] font-mono h-12"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-primary" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Verify & Login</>}
              </Button>
              <Button variant="ghost" type="button" className="w-full text-muted-foreground" onClick={() => setStep('email')}>
                Back to Role Selection
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
