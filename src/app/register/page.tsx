"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'volunteer';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState(initialRole);
  const router = useRouter();
  const { toast } = useToast();

  const isConfigMissing = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'undefined';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase API keys are missing. Please check your .env file.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        role: role,
        firstName: role === 'volunteer' ? firstName : '',
        lastName: role === 'volunteer' ? lastName : '',
        organizationName: role === 'ngo' ? orgName : '',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Account Created",
        description: "Welcome to ResQMate! Your profile is ready.",
      });

      router.push(role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard');
    } catch (error: any) {
      let errorMessage = error.message || "Something went wrong during registration.";
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase Authentication is not configured correctly. Ensure API keys are in .env and the Auth service is enabled in Firebase Console.";
      }

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join ResQMate</CardTitle>
          <CardDescription>
            Choose your role and help coordinate humanitarian efforts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigMissing && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Environment Keys Missing</AlertTitle>
              <AlertDescription>
                Please ensure you have added your Firebase keys to the .env file with the NEXT_PUBLIC_ prefix.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={initialRole} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="ngo">NGO Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteer">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-first">First Name</Label>
                    <Input id="v-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-last">Last Name</Label>
                    <Input id="v-last" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-email">Email Address</Label>
                  <Input id="v-email" type="email" placeholder="alex@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-password">Password</Label>
                  <Input id="v-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register as Volunteer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="ngo">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n-org">Organization Name</Label>
                  <Input id="n-org" placeholder="Red Cross, UNICEF, etc." required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-email">Admin Email Address</Label>
                  <Input id="n-email" type="email" placeholder="admin@org.org" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-password">Password</Label>
                  <Input id="n-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-secondary" disabled={loading || isConfigMissing}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register as NGO Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
