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
import { doc, getDoc } from 'firebase/firestore';
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
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== role) {
          throw new Error(`Account mismatch. This node is registered as a ${data.role}.`);
        }
        toast({ title: "Verification Successful", description: "Establishing encrypted session..." });
        window.location.href = role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard';
        return;
      }

      const regRef = doc(db, 'registrations', user.uid);
      const regDoc = await getDoc(regRef);

      if (regDoc.exists()) {
        setStatusError("Registration Pending. Your credentials are under administrative review.");
        setLoading(false);
        return;
      }

      setStatusError("Access Denied. Node not found in the global registry.");
      setLoading(false);
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link href="/" className="fixed top-12 left-12 hidden md:flex items-center gap-4 group">
        <div className="bg-primary p-3 rounded-2xl text-white shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
          <Shield className="h-7 w-7" />
        </div>
        <span className="font-headline font-black text-3xl tracking-tighter text-slate-900">ResQMate</span>
      </Link>
      
      <Card className="w-full max-w-xl shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-none rounded-[3.5rem] overflow-hidden bg-white/90 backdrop-blur-xl">
        <CardHeader className="space-y-6 text-center pb-14 pt-20 px-16">
          <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-5xl font-black tracking-tighter text-slate-950">Secure Access</CardTitle>
          <CardDescription className="text-slate-500 font-bold text-xl leading-relaxed">
            Verify credentials to access the coordination terminal.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-16">
          {statusError && (
            <Alert variant="destructive" className="mb-10 rounded-3xl border-4 bg-rose-50 border-rose-100 text-rose-900 p-6">
              <AlertCircle className="h-6 w-6" />
              <AlertTitle className="font-black text-lg">System Alert</AlertTitle>
              <AlertDescription className="font-medium text-base">{statusError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 bg-slate-100 p-2 h-20 rounded-[1.75rem]">
              <TabsTrigger value="volunteer" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] data-[state=active]:shadow-2xl data-[state=active]:bg-white transition-all">
                Responder
              </TabsTrigger>
              <TabsTrigger value="ngo" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] data-[state=active]:shadow-2xl data-[state=active]:bg-white transition-all">
                Command
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Node Identifier</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@ops.network" 
                  required 
                  className="h-20 px-8 rounded-3xl border-slate-200 text-xl font-bold bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Key</Label>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline">Reset Key</Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="h-20 px-8 rounded-3xl border-slate-200 text-xl font-bold bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-24 rounded-[2rem] text-2xl font-black shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] shadow-primary/30 mt-10 active:scale-95 transition-all" disabled={loading}>
                {loading ? <Loader2 className="mr-4 h-10 w-10 animate-spin" /> : <><LogIn className="mr-4 h-10 w-10" /> Initiate Link</>}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-10 pb-20 pt-10">
          <div className="flex items-center gap-8 w-full px-16">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Auth Protocol</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>
          <div className="text-lg font-bold text-slate-500">
            Unauthorized?{" "}
            <Link href="/register" className="text-primary hover:underline font-black">
              Register Node
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}