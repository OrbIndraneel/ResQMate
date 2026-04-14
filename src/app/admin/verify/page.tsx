"use client";

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Loader2, ShieldCheck, FileText, User, Building2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';

export default function AdminVerifyPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-bold text-xl">ResQMate Admin Portal</span>
        </div>
        <Badge variant="outline" className="ml-4 border-white text-white">Developer Access</Badge>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Registration Approval Queue</h1>
          <p className="text-muted-foreground">Review submitted credentials for NGOs and Volunteers.</p>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Pending Verifications ({pendingUsers.length})</CardTitle>
            <CardDescription>Manually verify professional IDs and NGO certifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-20 border rounded-lg border-dashed">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">Clear! No pending verifications.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID / Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Badge variant={user.role === 'ngo' ? 'secondary' : 'default'} className="capitalize flex items-center gap-1 w-fit">
                          {user.role === 'ngo' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.role === 'ngo' ? user.organizationName : `${user.firstName} ${user.lastName}`}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {user.role === 'ngo' ? user.location : user.volunteerId}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerify(user.id, 'verified')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleVerify(user.id, 'rejected')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
            <DialogDescription>
              Verify the identity of {selectedUser?.role === 'ngo' ? selectedUser?.organizationName : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Registration Type</p>
                  <p className="font-semibold capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Profession / Location</p>
                  <p className="font-semibold">{selectedUser.profession || selectedUser.location || 'N/A'}</p>
                </div>
                {selectedUser.role === 'volunteer' && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Expertise</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline">{selectedUser.primarySkill}</Badge>
                      {selectedUser.additionalSkills?.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">Uploaded Proof Document:</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed bg-black/5 flex items-center justify-center">
                  {selectedUser.proofImage ? (
                    <img 
                      src={selectedUser.proofImage} 
                      alt="Identity Proof" 
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-center p-10">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                      <p className="text-sm text-muted-foreground mt-2">No document provided</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 h-12" 
                  onClick={() => handleVerify(selectedUser.id, 'verified')}
                >
                  <Check className="mr-2 h-5 w-5" /> Approve Registration
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-12"
                  onClick={() => handleVerify(selectedUser.id, 'rejected')}
                >
                  <X className="mr-2 h-5 w-5" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
