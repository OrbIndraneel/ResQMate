"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Bell, User, LogOut, Menu } from 'lucide-react';
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
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <Link className="flex items-center justify-center" href="/">
        <Shield className="h-6 w-6 text-primary mr-2" />
        <span className="font-headline font-bold text-xl tracking-tight text-primary">ResQMate</span>
      </Link>
      
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">{userRole} Profile</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={userRole === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard'}>
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={userRole === 'ngo' ? '/ngo/profile' : '/volunteer/profile'}>
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
