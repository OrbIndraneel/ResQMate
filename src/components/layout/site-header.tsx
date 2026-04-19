
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shield, Bell, LogOut, LayoutDashboard, Settings, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const logoAsset = PlaceHolderImages.find(img => img.id === 'main-logo');

interface SiteHeaderProps {
  userRole: 'ngo' | 'volunteer';
  userName: string;
}

export function SiteHeader({ userRole, userName }: SiteHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout Error:", error);
      router.push('/');
    }
  };

  return (
    <header className="px-4 md:px-8 h-20 md:h-24 flex items-center nav-blur sticky top-0 z-50">
      <div className="flex items-center gap-3 md:gap-6">
        <Link className="flex items-center gap-2 md:gap-3 group" href={userRole === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard'}>
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl overflow-hidden shadow-lg group-hover:rotate-12 transition-transform shrink-0">
            {logoAsset && <Image src={logoAsset.imageUrl} alt="ResQMate" width={40} height={40} className="object-cover" />}
          </div>
          <span className="font-headline font-black text-xl md:text-2xl tracking-tighter text-slate-900 truncate max-w-[120px] md:max-w-none">ResQMate</span>
        </Link>
        
        <Link href="/">
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 rounded-xl font-bold text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
        </Link>
      </div>
      
      <div className="ml-auto flex items-center gap-3 md:gap-5">
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Sync Active</span>
        </div>

        <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-slate-50 hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 md:top-3.5 md:right-3.5 h-2 w-2 md:h-2.5 md:w-2.5 bg-rose-500 rounded-full ring-2 md:ring-4 ring-slate-50" />
        </Button>
        
        <div className="h-6 md:h-8 w-px bg-slate-200" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl p-0.5 border-2 border-transparent hover:border-primary/20">
              <Avatar className="h-full w-full rounded-xl md:rounded-2xl">
                <AvatarFallback className="rounded-xl md:rounded-2xl bg-primary/10 text-primary font-black text-base md:text-lg">
                  {userName.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 md:w-72 rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-3 mt-4 shadow-2xl border-none glass-panel" align="end">
            <DropdownMenuLabel className="font-normal p-4 md:p-5">
              <div className="flex flex-col space-y-2">
                <p className="text-base md:text-lg font-black leading-none text-slate-950 truncate">{userName}</p>
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase w-fit">
                  {userRole} NODE
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-1 md:p-2 space-y-1">
              <DropdownMenuItem className="rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 font-bold cursor-pointer" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard'}>
                  <LayoutDashboard className="mr-3 md:mr-4 h-5 w-5 text-slate-400" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 font-bold cursor-pointer" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/profile' : '/volunteer/profile'}>
                  <Settings className="mr-3 md:mr-4 h-5 w-5 text-slate-400" /> Settings
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1 md:p-2">
              <DropdownMenuItem className="rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 font-bold cursor-pointer text-rose-500 hover:bg-rose-50" onClick={handleLogout}>
                <LogOut className="mr-3 md:mr-4 h-5 w-5" /> Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
