
"use client";

import { SiteHeader } from '@/components/layout/site-header';
import { TaskFormAI } from '@/components/tasks/task-form-ai';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function NewTaskPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader userRole="ngo" userName={user?.displayName || "NGO Admin"} />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/ngo/dashboard">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        <TaskFormAI />
      </main>
    </div>
  );
}
