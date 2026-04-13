"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "A one-time password has been sent to your email.",
      });
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verification and redirect
    setTimeout(() => {
      setLoading(false);
      // Mock logic: if email contains "ngo", go to ngo dashboard, else volunteer
      if (email.toLowerCase().includes('ngo')) {
        router.push('/ngo/dashboard');
      } else {
        router.push('/volunteer/dashboard');
      }
    }, 1500);
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
            {step === 'credentials' 
              ? "Enter your email to receive a secure login code." 
              : "Enter the code sent to your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@organization.org" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Login Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center gap-2 mt-2">
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="123456" 
                    className="text-center text-2xl tracking-[1em] h-14" 
                    maxLength={6}
                    required 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Sign In"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('credentials')}>
                Back to email entry
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
