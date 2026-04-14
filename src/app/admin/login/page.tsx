
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2, Send, KeyRound, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendEmailOTP } from './actions';

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
  const [smtpWarning, setSmtpWarning] = useState(false);
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
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    try {
      const result = await sendEmailOTP(email, mockOtp);
      
      if (result?.error === "SMTP_MISSING") {
        setSmtpWarning(true);
        toast({
          variant: "destructive",
          title: "SMTP Not Configured",
          description: "Check server console for the code. Email couldn't be sent.",
        });
      } else {
        toast({
          title: "Code Sent",
          description: `Verification email sent to ${email}`,
        });
      }
      
      setStep('otp');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Dispatch Error",
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
        description: "The verification code you entered is incorrect.",
      });
      return;
    }

    setLoading(true);
    try {
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
          {smtpWarning && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold mb-1">Dev Note:</p>
                SMTP credentials not found in .env. The OTP was logged to the server terminal. In production, set SMTP_USER and SMTP_PASS.
              </div>
            </div>
          )}

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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Login Code</>}
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
            Authorized Personnel Only • ResQMate Core
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
