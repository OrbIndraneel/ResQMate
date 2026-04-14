
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, LogIn, Eye, EyeOff, User, Building2 } from 'lucide-react';
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
      // 1. Check if user exists in Firestore with the selected role
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

      // 2. Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);

      toast({
        title: "Login Successful",
        description: "Welcome back to ResQMate.",
      });

      // 3. Redirect to appropriate dashboard
      window.location.href = role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard';
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMsg = "Failed to establish a secure session.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMsg = "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        errorMsg = "No account found with this email.";
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMsg,
      });
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
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="volunteer" onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="volunteer" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Volunteer
              </TabsTrigger>
              <TabsTrigger value="ngo" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> NGO Admin
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
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
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><LogIn className="mr-2 h-4 w-4" /> Secure Login</>}
              </Button>
            </form>
          </Tabs>
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
