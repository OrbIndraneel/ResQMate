
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, LogIn, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>('volunteer');
  const [statusError, setStatusError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusError(null);

    try {
      // 1. Sign in with Auth first
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      // 2. Check USERS table (Verified)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== role) {
          throw new Error(`Account type mismatch. This is a ${data.role} account.`);
        }
        toast({ title: "Welcome Back", description: "Accessing dashboard..." });
        window.location.href = role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard';
        return;
      }

      // 3. Check REGISTRATIONS table (Pending)
      const regRef = doc(db, 'registrations', user.uid);
      const regDoc = await getDoc(regRef);

      if (regDoc.exists()) {
        setStatusError("Your application is currently being reviewed by an administrator. Please check back later.");
        setLoading(false);
        return;
      }

      // 4. Fallback: Not found anywhere
      setStatusError("Account record not found in the operational database. Please re-register.");
      setLoading(false);
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Security Check Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 hero-gradient">
      <Link href="/" className="mb-8 flex items-center gap-2 group transition-all hover:-translate-y-1">
        <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
          <Shield className="h-6 w-6" />
        </div>
        <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Sign In</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Access your mission control dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          {statusError && (
            <Alert variant="destructive" className="mb-6 bg-rose-50 border-rose-200 text-rose-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Pending</AlertTitle>
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 h-12 rounded-2xl">
              <TabsTrigger value="volunteer" className="rounded-xl data-[state=active]:shadow-sm font-bold">
                Volunteer
              </TabsTrigger>
              <TabsTrigger value="ngo" className="rounded-xl data-[state=active]:shadow-sm font-bold">
                NGO Admin
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@organization.org" 
                  required 
                  className="h-12 px-4 rounded-xl border-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-slate-700 font-bold">Password</Label>
                  <Link href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="h-12 px-4 rounded-xl border-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 mt-4" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Secure Access</>}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-10 pt-4">
          <div className="flex items-center gap-4 w-full px-8">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <div className="text-sm text-center text-slate-600">
            Need an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Join the Network
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
        <Lock className="h-3 w-3" /> Secure RSA-256 Protocol
      </p>
    </div>
  );
}
