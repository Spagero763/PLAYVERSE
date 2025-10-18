
'use client';

import Link from 'next/link';
import { Gamepad2, Menu, Crown, User, Swords, LogOut, Cpu, KeySquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import React, { useState, useEffect } from 'react';
// Wallet features removed; use local profile only

const navItems = [
  { href: '/games', label: 'All Games', icon: Swords },
  { href: '/agents', label: 'Agents', icon: Cpu },
  { href: '/delegations', label: 'Delegations', icon: KeySquare },
  { href: '/leaderboard', label: 'Leaderboard', icon: Crown },
  { href: '/profile', label: 'Profile', icon: User },
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const hasProfile = !!localStorage.getItem('userProfile');
        setIsLoggedIn(hasProfile);
    }
  }, [pathname]);


  const handleSignOut = () => {
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    router.push('/');
    router.refresh(); 
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full animate-fade-in">
      <div className="container mx-auto flex h-20 items-center justify-between p-4 glass-card my-2">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">PlayVerse</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
             {isLoggedIn ? (
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-primary">
                    <LogOut className="h-4 w-4" />
                    <span className='sr-only'>Sign Out</span>
                </Button>
            ) : (
                <Link href={"/login"} className={cn('flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10', pathname === '/login' ? 'text-primary' : 'text-muted-foreground')}>
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
            )}
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className='flex flex-col h-full'>
                    <nav className="mt-8 flex flex-col gap-4">
                    {navItems.map((item) => (
                        <NavLink key={item.href} {...item} />
                    ))}
                    </nav>
                    <div className="mt-auto flex flex-col gap-4 items-center">
                      {isLoggedIn ? (
                        <Button variant="outline" onClick={handleSignOut} className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      ) : (
                        <Link href="/login" className="w-full">
                          <Button variant="outline" className="w-full">Login</Button>
                        </Link>
                      )}
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
