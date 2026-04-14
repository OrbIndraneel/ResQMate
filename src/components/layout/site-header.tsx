"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Bell, User, LogOut, Menu, Settings, LayoutDashboard } from 'lucide-react';
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
    <header className="px-6 h-20 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <Link className="flex items-center gap-2 group" href="/">
        <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
          <Shield className="h-5 w-5" />
        </div>
        <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">ResQMate</span>
      </Link>
      
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </Button>
        
        <div className="h-8 w-px bg-slate-200 mx-2" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0.5 border-2 border-transparent hover:border-primary/20 transition-all">
              <Avatar className="h-full w-full rounded-[0.8rem]">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="rounded-[0.8rem] bg-primary/10 text-primary font-black text-base">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-2xl p-2 mt-2 shadow-2xl border-none" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-base font-black leading-none text-slate-900">{userName}</p>
                <p className="text-xs font-bold leading-none text-slate-400 uppercase tracking-widest mt-1">
                  {userRole} Account
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-xl py-3 px-4 font-bold cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard'}>
                  <LayoutDashboard className="mr-3 h-5 w-5 opacity-60" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-3 px-4 font-bold cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary" asChild>
                <Link href={userRole === 'ngo' ? '/ngo/profile' : '/volunteer/profile'}>
                  <Settings className="mr-3 h-5 w-5 opacity-60" /> Profile Settings
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-slate-100" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-xl py-3 px-4 font-bold cursor-pointer text-rose-500 transition-colors focus:bg-rose-50 focus:text-rose-600" asChild>
                <Link href="/">
                  <LogOut className="mr-3 h-5 w-5 opacity-60" /> Log Out
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}