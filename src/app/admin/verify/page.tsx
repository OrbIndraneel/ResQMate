
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2, ShieldCheck, FileText, User, Building2, LogOut, Trash2, AlertTriangle, Globe, MapPin, ArrowLeft } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDocs, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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
      const collections = ['users', 'tasks', 'registrations', 'task_responses'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        snap.forEach((doc) => batch.delete(doc.ref));
      }
      await batch.commit();
      toast({ title: "Database Reset Complete", description: "All records purged." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Wipe Failed", description: error.message });
    } finally {
      setWiping(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    await signOut(auth);
    router.push('/admin/login');
  };

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="px-4 md:px-6 h-20 flex items-center border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="font-black text-lg md:text-xl tracking-tight hidden sm:inline">Admin Operations</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white font-bold gap-2">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden xs:inline">Home</span>
            </Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <Badge variant="outline" className="border-emerald-500 text-emerald-500 font-black text-[8px] md:text-[10px] tracking-widest hidden xs:flex">SECURE CHANNEL</Badge>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-6 md:py-10 px-4 md:px-6 space-y-8 md:space-y-10 max-w-6xl">
        <Tabs defaultValue="queue" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium">Reviewing {pendingRegistrations.length} mission applications.</p>
            </div>
            <TabsList className="bg-white border rounded-xl md:rounded-2xl p-1 h-12 md:h-14 w-full md:w-auto">
              <TabsTrigger value="queue" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-6 md:px-8 font-bold">Applications</TabsTrigger>
              <TabsTrigger value="danger" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-6 md:px-8 font-bold text-rose-500 data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4 mr-2" /> System Reset
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue">
            <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-20 md:py-24"><Loader2 className="animate-spin h-10 w-10 md:h-12 md:w-12 text-primary opacity-20" /></div>
                ) : pendingRegistrations.length === 0 ? (
                  <div className="text-center py-24 md:py-32 space-y-4 md:space-y-6">
                    <div className="bg-slate-50 h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                    </div>
                    <div className="space-y-1 px-6">
                      <h3 className="text-lg md:text-xl font-black text-slate-900">Queue Cleared</h3>
                      <p className="text-sm md:text-base text-slate-500 font-medium">No pending registration records found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-none">
                          <TableHead className="font-black uppercase tracking-widest text-[8px] md:text-[10px] py-4 md:py-6 px-6 md:px-8 whitespace-nowrap">Responder Type</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[8px] md:text-[10px] py-4 md:py-6 whitespace-nowrap">Entity Name</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[8px] md:text-[10px] py-4 md:py-6 whitespace-nowrap">Mission Affiliation</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[8px] md:text-[10px] py-4 md:py-6 text-right px-6 md:px-8 whitespace-nowrap">Command</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRegistrations.map((reg) => (
                          <TableRow key={reg.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="px-6 md:px-8 py-4 md:py-6">
                              <Badge className={reg.role === 'ngo' ? 'bg-slate-900' : 'bg-primary'}>
                                {reg.role === 'ngo' ? <Building2 className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                                {reg.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-black text-slate-900 py-4 md:py-6">
                              <div className="max-w-[150px] md:max-w-[200px] truncate">
                                {reg.role === 'ngo' ? reg.organizationName : `${reg.firstName} ${reg.lastName}`}
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 font-medium mt-1 truncate max-w-[150px] md:max-w-[200px]">{reg.email}</p>
                            </TableCell>
                            <TableCell className="py-4 md:py-6">
                              {reg.role === 'volunteer' ? (
                                <Badge variant="secondary" className="font-bold flex items-center gap-1.5 w-fit">
                                  {reg.affiliationType === 'independent' ? <Globe className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                                  <span className="truncate max-w-[80px] md:max-w-none">{reg.affiliationType === 'independent' ? 'Independent' : reg.affiliatedNgoName}</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="font-bold border-slate-200">NGO HQ</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right px-6 md:px-8 py-4 md:py-6">
                              <Button 
                                variant="outline" 
                                className="rounded-lg md:rounded-xl font-bold border-2 h-9 md:h-10 px-3 md:px-4"
                                onClick={() => {
                                  setSelectedReg(reg);
                                  setIsViewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Review Mission</span>
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
            <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-rose-50 border-2 border-rose-100 p-8 md:p-12 text-center">
              <div className="max-w-md mx-auto space-y-6 md:space-y-8">
                <div className="bg-rose-100 h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto">
                  <Trash2 className="h-8 w-8 md:h-10 md:w-10 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Database Purge</h3>
                  <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">This will permanently delete all users, tasks, and registration history. This action cannot be reversed.</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl text-base md:text-lg font-black shadow-xl shadow-rose-200"
                  onClick={handleWipeData}
                  disabled={wiping}
                >
                  {wiping ? <Loader2 className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5 md:h-6 md:w-6" />}
                  Purge Operational Data
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-0 overflow-hidden bg-white mx-4">
          <DialogHeader className="p-6 md:p-10 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-primary rounded-lg md:rounded-xl">
                 <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
               </div>
               <DialogTitle className="text-xl md:text-2xl font-black">Credentials Verification</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 font-medium text-xs md:text-sm">Reviewing application for <strong className="break-all">{selectedReg?.email}</strong></DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="p-6 md:p-10 space-y-8 md:space-y-10 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Details</p>
                    <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl space-y-3">
                      <p className="text-xs md:text-sm font-bold text-slate-900">Type: <span className="font-medium text-slate-600 capitalize">{selectedReg.role}</span></p>
                      <p className="text-xs md:text-sm font-bold text-slate-900">Legal Name: <span className="font-medium text-slate-600">{selectedReg.role === 'ngo' ? selectedReg.organizationName : `${selectedReg.firstName} ${selectedReg.lastName}`}</span></p>
                      {selectedReg.role === 'volunteer' && (
                        <p className="text-xs md:text-sm font-bold text-slate-900">Profession: <span className="font-medium text-slate-600">{selectedReg.profession}</span></p>
                      )}
                      <p className="text-xs md:text-sm font-bold text-slate-900">Affiliation: <span className="font-black text-primary uppercase text-[10px] md:text-xs tracking-wider">
                        {selectedReg.role === 'volunteer' ? (selectedReg.affiliationType === 'independent' ? 'Independent Responder' : `Affiliated: ${selectedReg.affiliatedNgoName}`) : 'NGO Command'}
                      </span></p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Identity</p>
                    <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4">
                       <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-slate-400 shadow-sm shrink-0">
                         {selectedReg.email[0].toUpperCase()}
                       </div>
                       <div className="overflow-hidden">
                         <p className="text-[10px] md:text-xs font-black text-slate-900 truncate">{selectedReg.email}</p>
                         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedReg.uid.substring(0, 12)}...</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Evidence</p>
                  <div className="aspect-video bg-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-2 md:border-4 border-slate-50 shadow-inner group">
                    {selectedReg.proofImage ? (
                      <img src={selectedReg.proofImage} alt="Verification Evidence" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 md:gap-4">
                        <FileText className="h-8 w-8 md:h-12 md:w-12 opacity-20" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">No evidence provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t border-slate-100">
                <Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl px-6 md:px-10 font-bold w-full sm:w-auto" onClick={() => setIsViewOpen(false)}>Defer Decision</Button>
                <Button variant="destructive" className="h-12 md:h-14 rounded-xl md:rounded-2xl px-6 md:px-10 font-bold w-full sm:w-auto" onClick={() => handleVerify(selectedReg.id, 'rejected')}>Reject Application</Button>
                <Button className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-base md:text-lg font-black shadow-xl shadow-emerald-200" onClick={() => handleVerify(selectedReg.id, 'verified')}>
                   Approve & Deploy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
