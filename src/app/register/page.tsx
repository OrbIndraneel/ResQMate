"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'volunteer';
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API registration
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Account Created",
        description: "Registration successful. Please verify your email via OTP.",
      });
      router.push('/login');
    }, 1500);
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
          <Tabs defaultValue={initialRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="ngo">NGO Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteer">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-first">First Name</Label>
                    <Input id="v-first" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-last">Last Name</Label>
                    <Input id="v-last" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-email">Email Address</Label>
                  <Input id="v-email" type="email" placeholder="alex@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-phone">Phone Number</Label>
                  <Input id="v-phone" type="tel" placeholder="+1 (555) 000-0000" required />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register as Volunteer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="ngo">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n-org">Organization Name</Label>
                  <Input id="n-org" placeholder="Red Cross, UNICEF, etc." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-reg">NGO Registration Number</Label>
                  <Input id="n-reg" placeholder="Official Reg ID" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-email">Admin Email Address</Label>
                  <Input id="n-email" type="email" placeholder="admin@org.org" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-phone">Office Contact</Label>
                  <Input id="n-phone" type="tel" required />
                </div>
                <Button type="submit" className="w-full bg-secondary" disabled={loading}>
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
