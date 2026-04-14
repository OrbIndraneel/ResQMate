
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2, Send, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ADMIN_WHITELIST = [
  "indraneelmandal0387@gmail.com",
  "tanviacharya569@gmail.com",
  "krishxtech@gmail.com"
];

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_WHITELIST.includes(email.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "This email is not authorized for developer access.",
      });
      return;
    }

    setLoading(true);
    // Simulate OTP sending
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast({
        title: "Verification Code Sent",
        description: `DEBUG ONLY: Your code is ${mockOtp}`,
      });
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The verification code you entered is incorrect.",
      });
      return;
    }

    setLoading(true);
    try {
      // For the prototype, we use a fixed admin password or handle auth session
      // In a real app, this would use Firebase Email Link or a custom OTP function
      // Here we'll ensure an admin record exists in the database
      const adminRef = doc(db, 'admins', email.toLowerCase());
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          email: email.toLowerCase(),
          role: 'developer_admin',
          lastLogin: new Date().toISOString()
        });
      }

      localStorage.setItem('admin_session', JSON.stringify({
        email: email.toLowerCase(),
        expiry: Date.now() + 3600000 // 1 hour session
      }));

      toast({
        title: "Authentication Successful",
        description: "Welcome to the Developer Control Center.",
      });
      router.push('/admin/verify');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Gateway</CardTitle>
          <CardDescription className="text-slate-400">
            Developer credentials required for access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Developer Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@resqmate.dev" 
                  required 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Request Access Code</>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="6-digit OTP" 
                  required 
                  maxLength={6}
                  className="bg-slate-800 border-slate-700 text-white text-center text-xl tracking-[0.5em] font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-11 font-bold bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Verify & Enter</>}
              </Button>
              <Button variant="ghost" type="button" className="w-full text-slate-400 hover:text-white" onClick={() => setStep('email')}>
                Back to Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest w-full">
            Authorized Personnel Only • Secure Terminal
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
