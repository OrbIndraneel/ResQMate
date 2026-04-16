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
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== role) {
          throw new Error(`Account type mismatch. This is a ${data.role} node.`);
        }
        toast({ title: "Session Established", description: "Accessing tactical interface..." });
        window.location.href = role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard';
        return;
      }

      const regRef = doc(db, 'registrations', user.uid);
      const regDoc = await getDoc(regRef);

      if (regDoc.exists()) {
        setStatusError("Node synchronization pending. Your credentials are under administrative review.");
        setLoading(false);
        return;
      }

      setStatusError("Node not found in local registry. Please initiate registration.");
      setLoading(false);
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Session Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link href="/" className="fixed top-12 left-12 hidden md:flex items-center gap-3 group">
        <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform">
          <Shield className="h-6 w-6" />
        </div>
        <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
      </Link>
      
      <Card className="w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-none rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="space-y-4 text-center pb-12 pt-16 px-12">
          <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter text-slate-950">Secure Access</CardTitle>
          <CardDescription className="text-slate-500 font-bold text-lg">
            Access your mission coordination terminal.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-12">
          {statusError && (
            <Alert variant="destructive" className="mb-8 rounded-[1.5rem] border-2 bg-rose-50 border-rose-100 text-rose-900">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-black">Operational Delay</AlertTitle>
              <AlertDescription className="font-medium">{statusError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-100 p-1.5 h-16 rounded-[1.5rem]">
              <TabsTrigger value="volunteer" className="rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">
                Responder
              </TabsTrigger>
              <TabsTrigger value="ngo" className="rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">
                Command
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Node Identifier (Email)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@org.network" 
                  required 
                  className="h-16 px-6 rounded-2xl border-slate-200 text-lg font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</Label>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Reset Token</Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="h-16 px-6 rounded-2xl border-slate-200 text-lg font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-20 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20 mt-6" disabled={loading}>
                {loading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <><LogIn className="mr-3 h-8 w-8" /> Initiate Link</>}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-8 pb-16 pt-8">
          <div className="flex items-center gap-6 w-full px-12">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>
          <div className="text-sm font-bold text-slate-500">
            Unregistered?{" "}
            <Link href="/register" className="text-primary hover:underline font-black">
              Join the Network
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}