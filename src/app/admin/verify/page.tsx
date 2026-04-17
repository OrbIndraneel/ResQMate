"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2, ShieldCheck, FileText, User, Building2, LogOut, Trash2, AlertTriangle, Globe, MapPin, ArrowLeft } from 'lucide-react';
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
      toast({ title: "Database Reset Complete", description: "All records purged." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Wipe Failed", description: error.message });
    } finally {
      setWiping(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="px-6 h-20 flex items-center border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-black text-xl tracking-tight">Admin Operations</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white font-bold gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="outline" className="border-emerald-500 text-emerald-500 font-black text-[10px] tracking-widest">SECURE CHANNEL</Badge>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-10 px-6 space-y-10 max-w-6xl">
        <Tabs defaultValue="queue" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
              <p className="text-slate-500 font-medium">Reviewing {pendingRegistrations.length} mission applications.</p>
            </div>
            <TabsList className="bg-white border rounded-2xl p-1 h-14">
              <TabsTrigger value="queue" className="rounded-xl px-8 font-bold">Applications</TabsTrigger>
              <TabsTrigger value="danger" className="rounded-xl px-8 font-bold text-rose-500 data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4 mr-2" /> System Reset
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-primary opacity-20" /></div>
                ) : pendingRegistrations.length === 0 ? (
                  <div className="text-center py-32 space-y-6">
                    <div className="bg-slate-50 h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">Queue Cleared</h3>
                      <p className="text-slate-500 font-medium">No pending registration records found.</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-none">
                        <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Responder Type</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Entity Name</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Mission Affiliation</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 text-right px-8">Command</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRegistrations.map((reg) => (
                        <TableRow key={reg.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="px-8 py-6">
                            <Badge className={reg.role === 'ngo' ? 'bg-slate-900' : 'bg-primary'}>
                              {reg.role === 'ngo' ? <Building2 className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                              {reg.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-black text-slate-900">
                            {reg.role === 'ngo' ? reg.organizationName : `${reg.firstName} ${reg.lastName}`}
                            <p className="text-xs font-mono text-slate-400 font-medium mt-1">{reg.email}</p>
                          </TableCell>
                          <TableCell>
                            {reg.role === 'volunteer' ? (
                              <Badge variant="secondary" className="font-bold flex items-center gap-1.5 w-fit">
                                {reg.affiliationType === 'independent' ? <Globe className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                                {reg.affiliationType === 'independent' ? 'Independent' : reg.affiliatedNgoName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="font-bold border-slate-200">NGO HQ</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right px-8 py-6">
                            <Button 
                              variant="outline" 
                              className="rounded-xl font-bold border-2"
                              onClick={() => {
                                setSelectedReg(reg);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Review Mission
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-rose-50 border-2 border-rose-100 p-12 text-center">
              <div className="max-w-md mx-auto space-y-8">
                <div className="bg-rose-100 h-20 w-20 rounded-[2.5rem] flex items-center justify-center mx-auto">
                  <Trash2 className="h-10 w-10 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Database Purge</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">This will permanently delete all users, tasks, and registration history. This action cannot be reversed.</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-rose-200"
                  onClick={handleWipeData}
                  disabled={wiping}
                >
                  {wiping ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Trash2 className="mr-2 h-6 w-6" />}
                  Purge Operational Data
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden bg-white">
          <DialogHeader className="p-10 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-primary rounded-xl">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <DialogTitle className="text-2xl font-black">Credentials Verification</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 font-medium">Reviewing application for <strong>{selectedReg?.email}</strong></DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Details</p>
                    <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                      <p className="text-sm font-bold text-slate-900">Type: <span className="font-medium text-slate-600 capitalize">{selectedReg.role}</span></p>
                      <p className="text-sm font-bold text-slate-900">Legal Name: <span className="font-medium text-slate-600">{selectedReg.role === 'ngo' ? selectedReg.organizationName : `${selectedReg.firstName} ${selectedReg.lastName}`}</span></p>
                      {selectedReg.role === 'volunteer' && (
                        <p className="text-sm font-bold text-slate-900">Profession: <span className="font-medium text-slate-600">{selectedReg.profession}</span></p>
                      )}
                      <p className="text-sm font-bold text-slate-900">Affiliation: <span className="font-black text-primary uppercase text-xs tracking-wider">
                        {selectedReg.role === 'volunteer' ? (selectedReg.affiliationType === 'independent' ? 'Independent Responder' : `Affiliated: ${selectedReg.affiliatedNgoName}`) : 'NGO Command'}
                      </span></p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Identity</p>
                    <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-4">
                       <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 shadow-sm">
                         {selectedReg.email[0].toUpperCase()}
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-900">{selectedReg.email}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedReg.uid.substring(0, 12)}...</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Evidence</p>
                  <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner group">
                    {selectedReg.proofImage ? (
                      <img src={selectedReg.proofImage} alt="Verification Evidence" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <FileText className="h-12 w-12 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest">No evidence provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <Button variant="outline" className="h-14 rounded-2xl px-10 font-bold" onClick={() => setIsViewOpen(false)}>Defer Decision</Button>
                <Button variant="destructive" className="h-14 rounded-2xl px-10 font-bold" onClick={() => handleVerify(selectedReg.id, 'rejected')}>Reject Application</Button>
                <Button className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-black shadow-xl shadow-emerald-200" onClick={() => handleVerify(selectedReg.id, 'verified')}>
                   Approve & Deploy to Network
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}