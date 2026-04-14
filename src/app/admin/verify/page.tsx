
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2, ShieldCheck, FileText, User, Building2, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDocs, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminVerifyPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wiping, setWiping] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
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

    // READ FROM DEDICATED REGISTRATIONS TABLE
    const unsubscribe = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      const regs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingRegistrations(regs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, router]);

  const handleVerify = async (regId: string, status: 'verified' | 'rejected') => {
    try {
      const reg = pendingRegistrations.find(r => r.id === regId);
      if (!reg) return;

      if (status === 'verified') {
        // MOVE TO USERS TABLE
        await setDoc(doc(db, 'users', regId), {
          ...reg,
          verificationStatus: 'verified',
          verifiedAt: new Date().toISOString(),
          points: 0,
          tasksCompleted: 0,
          hoursContributed: 0,
          createdAt: new Date().toISOString()
        });
      }

      // REMOVE FROM REGISTRATIONS QUEUE
      await deleteDoc(doc(db, 'registrations', regId));
      
      toast({
        title: status === 'verified' ? "Application Approved" : "Application Rejected",
        description: `The registration for ${reg.email} has been processed.`,
      });
      
      setIsViewOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message,
      });
    }
  };

  const handleWipeData = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently delete ALL users, tasks, and registrations. Are you sure?")) {
      return;
    }

    setWiping(true);
    try {
      const batch = writeBatch(db);
      
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((doc) => batch.delete(doc.ref));

      const tasksSnap = await getDocs(collection(db, 'tasks'));
      tasksSnap.forEach((doc) => batch.delete(doc.ref));

      const regsSnap = await getDocs(collection(db, 'registrations'));
      regsSnap.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      
      toast({
        title: "Database Reset Complete",
        description: "All records have been purged.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Wipe Failed",
        description: error.message,
      });
    } finally {
      setWiping(false);
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
          <Badge variant="outline" className="border-green-500 text-green-500 tracking-widest uppercase text-[10px]">SECURE SESSION</Badge>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
        <Tabs defaultValue="queue" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Registrations Table</h1>
              <p className="text-muted-foreground">Manage incoming applications for NGOs and Volunteers.</p>
            </div>
            <TabsList className="bg-white border">
              <TabsTrigger value="queue">Pending Review ({pendingRegistrations.length})</TabsTrigger>
              <TabsTrigger value="danger" className="text-destructive data-[state=active]:bg-destructive data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4 mr-2" /> Danger Zone
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Incoming Applications
                </CardTitle>
                <CardDescription>Review credentials submitted to the <strong>registrations</strong> collection.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>
                ) : pendingRegistrations.length === 0 ? (
                  <div className="text-center py-24 border rounded-xl border-dashed bg-white">
                    <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold">Registration Queue is Empty</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">No new registration records found in the database.</p>
                  </div>
                ) : (
                  <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Entity Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRegistrations.map((reg) => (
                          <TableRow key={reg.id} className="hover:bg-muted/5">
                            <TableCell>
                              <Badge variant={reg.role === 'ngo' ? 'secondary' : 'default'} className="capitalize">
                                {reg.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {reg.role === 'ngo' ? reg.organizationName : `${reg.firstName} ${reg.lastName}`}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-mono">
                              {reg.email}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedReg(reg);
                                  setIsViewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1.5" /> Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive/20 border-2 shadow-xl bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-6 w-6" /> Database Purge
                </CardTitle>
                <CardDescription>
                  Wipe all operational data from the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="font-bold w-full h-14"
                  onClick={handleWipeData}
                  disabled={wiping}
                >
                  {wiping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Wipe Users, Tasks & Registrations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registration Review</DialogTitle>
            <DialogDescription>Reviewing {selectedReg?.email}</DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Details</p>
                  <p className="text-sm font-bold">Role: <span className="font-normal capitalize">{selectedReg.role}</span></p>
                  <p className="text-sm font-bold">Name: <span className="font-normal">{selectedReg.role === 'ngo' ? selectedReg.organizationName : `${selectedReg.firstName} ${selectedReg.lastName}`}</span></p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Identification</p>
                  {selectedReg.proofImage ? (
                    <img src={selectedReg.proofImage} alt="Proof" className="w-full aspect-video object-contain rounded border bg-white" />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No document image provided.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 border-t pt-6">
                <Button variant="outline" className="flex-1" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleVerify(selectedReg.id, 'rejected')}>Reject</Button>
                <Button className="flex-[2] bg-green-600 hover:bg-green-700" onClick={() => handleVerify(selectedReg.id, 'verified')}>Approve & Transfer to Users</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
