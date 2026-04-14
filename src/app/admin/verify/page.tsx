
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2, ShieldCheck, FileText, User, Building2, LogOut } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminVerifyPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check session
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { expiry } = JSON.parse(session);
    if (Date.now() > expiry) {
      localStorage.removeItem('admin_session');
      router.push('/admin/login');
      return;
    }

    setIsAuthorized(true);

    const q = query(
      collection(db, 'users'),
      where('verificationStatus', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingUsers(users);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to sync with the verification database.",
      });
    });

    return () => unsubscribe();
  }, [toast, router]);

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: status,
        verifiedAt: new Date().toISOString()
      });
      
      toast({
        title: status === 'verified' ? "User Approved" : "User Rejected",
        description: `The account status has been updated successfully.`,
      });
      
      if (selectedUser?.id === userId) {
        setIsViewOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Admin Verification Portal</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="outline" className="border-green-500 text-green-500 hidden sm:flex tracking-widest">SECURE SESSION</Badge>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Registration Approval Queue</h1>
            <p className="text-muted-foreground">Review submitted credentials for NGOs and Volunteers.</p>
          </div>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Verifications
              <Badge variant="secondary" className="rounded-full px-2">{pendingUsers.length}</Badge>
            </CardTitle>
            <CardDescription>Manually verify professional IDs and NGO certifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-24 border rounded-xl border-dashed bg-white">
                <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold">Queue is Clear</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">No new registrations require manual verification at this time.</p>
              </div>
            ) : (
              <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>Entity Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Proof Info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/5">
                        <TableCell>
                          <Badge variant={user.role === 'ngo' ? 'secondary' : 'default'} className="capitalize flex items-center gap-1 w-fit">
                            {user.role === 'ngo' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {user.role === 'ngo' ? user.organizationName : `${user.firstName} ${user.lastName}`}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {user.role === 'ngo' ? user.location : user.volunteerId}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1.5" /> Review
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="h-8 bg-green-600 hover:bg-green-700 hidden sm:flex"
                              onClick={() => handleVerify(user.id, 'verified')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="bg-primary p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                Document Review
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Verifying {selectedUser?.role === 'ngo' ? selectedUser?.organizationName : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedUser && (
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-xl border">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Applicant Profile</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge className="capitalize">{selectedUser.role}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Entity ID</span>
                        <span className="text-sm font-mono font-bold">{selectedUser.volunteerId || 'NGO-LOC'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Specialization</span>
                        <span className="text-sm font-semibold">{selectedUser.profession || selectedUser.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedUser.role === 'volunteer' && (
                    <div className="bg-muted/40 p-4 rounded-xl border">
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Expertise Declared</h4>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="bg-white">{selectedUser.primarySkill || selectedUser.skills?.[0]}</Badge>
                        {selectedUser.additionalSkills?.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/10">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Proof of Identity / NGO Status</h4>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed bg-black/5 flex items-center justify-center group">
                    {selectedUser.proofImage ? (
                      <img 
                        src={selectedUser.proofImage} 
                        alt="Identity Proof" 
                        className="object-contain w-full h-full transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-10">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                        <p className="text-sm text-muted-foreground mt-2">No document provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  variant="outline"
                  className="flex-1 h-12 order-3 sm:order-1"
                  onClick={() => setIsViewOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-12 order-2"
                  onClick={() => handleVerify(selectedUser.id, 'rejected')}
                >
                  <X className="mr-2 h-5 w-5" /> Reject Application
                </Button>
                <Button 
                  className="flex-[2] bg-green-600 hover:bg-green-700 h-12 order-1 sm:order-3" 
                  onClick={() => handleVerify(selectedUser.id, 'verified')}
                >
                  <Check className="mr-2 h-5 w-5" /> Approve Registration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
