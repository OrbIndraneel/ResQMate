"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, LogIn, Eye, EyeOff, User, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>('volunteer');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase()),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Access Restricted",
          description: `No active ${role === 'ngo' ? 'NGO' : 'Volunteer'} profile found with this email.`,
        });
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);

      toast({
        title: "Session Established",
        description: "Welcome back to the coordination center.",
      });

      window.location.href = role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard';
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMsg = "Credentials verification failed.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMsg = "Incorrect authentication parameters. Please check your password.";
      }

      toast({
        variant: "destructive",
        title: "Authentication Fault",
        description: errorMsg,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 gradient-bg">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center space-y-2">
          <Link className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4 shadow-xl shadow-primary/20" href="/">
            <Shield className="h-8 w-8 text-white" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Responder Access</h1>
          <p className="text-slate-500 font-medium">Verify your identity to enter the dashboard.</p>
        </div>

        <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
          <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/50">
              <TabsTrigger value="volunteer" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold">
                <User className="h-4 w-4 mr-2" /> Volunteer
              </TabsTrigger>
              <TabsTrigger value="ngo" className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold">
                <Building2 className="h-4 w-4 mr-2" /> NGO Admin
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="pt-8 px-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-900 font-bold ml-1">Secure Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@organization.org" 
                    required 
                    className="h-12 px-4 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" title="Password" className="text-slate-900 font-bold">Secret Password</Label>
                    <Link href="#" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Recovery</Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="h-12 px-4 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Authenticate</>}
                </Button>
              </form>
            </CardContent>
          </Tabs>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-sm text-center text-slate-500 font-medium">
              New responder?{" "}
              <Link href="/register" className="text-primary hover:underline font-bold">
                Create Account <ChevronRight className="inline-block h-4 w-4" />
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}