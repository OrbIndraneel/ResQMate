"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Bell, LogOut, LayoutDashboard, Settings, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SiteHeaderProps {
  userRole: 'ngo' | 'volunteer';
  userName: string;
}

export function SiteHeader({ userRole, userName }: SiteHeaderProps) {
  return (
    <header className="px-8 h-24 flex items-center nav-blur">
      <Link className="flex items-center gap-3 group" href="/">
        <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
          <Shield className="h-6 w-6" />
        </div>
        <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
      </Link>
      
      <div className="ml-auto flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Network Link</span>
        </div>

        <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 bg-rose-500 rounded-full ring-4 ring-slate-50" />
        </Button>
        
        <div className="h-8 w-px bg-slate-200" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0.5 border-2 border-transparent hover:border-primary/20 transition-all">
              <Avatar className="h-full w-full rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-black text-lg">
                  {userName.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 rounded-[2rem] p-3 mt-4 shadow-2xl border-none glass-panel" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-5">
              <div className="flex flex-col space-y-2">
                <p className="text-lg font-black leading-none text-slate-950">{userName}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase">
                    {userRole} Node
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100/50" />
            <div className="p-2 space-y-1">
              <DropdownMenuItem className="rounded-2xl py-4 px-5 font-bold cursor-pointer transition-all hover:bg-white hover:shadow-sm" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard'}>
                  <LayoutDashboard className="mr-4 h-5 w-5 text-slate-400" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-2xl py-4 px-5 font-bold cursor-pointer transition-all hover:bg-white hover:shadow-sm" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/profile' : '/volunteer/profile'}>
                  <Settings className="mr-4 h-5 w-5 text-slate-400" /> Account Settings
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-slate-100/50" />
            <div className="p-2">
              <DropdownMenuItem className="rounded-2xl py-4 px-5 font-bold cursor-pointer text-rose-500 transition-all hover:bg-rose-50" asChild>
                <Link href="/">
                  <LogOut className="mr-4 h-5 w-5" /> Terminate Session
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { Badge } from '@/components/ui/badge';