'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hasProfileForAddr = typeof window !== 'undefined' && address ? !!localStorage.getItem(`userProfile-${address}`) : false;

    // Always try to sync profile if possible
    if (isConnected && hasProfileForAddr && address) {
      const current = localStorage.getItem('userProfile');
      const expected = localStorage.getItem(`userProfile-${address}`);
      if (expected && current !== expected) {
        localStorage.setItem('userProfile', expected);
      }
    }

    const isPublicRoute = pathname === '/' || pathname?.startsWith('/login') || pathname?.startsWith('/signup');

    if (isPublicRoute) {
      setChecked(true);
      return;
    }

    // For private routes, enforce authentication
    if (!isConnected) {
      router.replace('/login');
      return;
    }
    if (!hasProfileForAddr) {
      router.replace('/signup');
      return;
    }

    setChecked(true);
  }, [isConnected, address, router, pathname]);

  if (!checked) {
    return null;
  }

  return (
    <div className={cn('container mx-auto px-4 py-8 md:py-12', className)} {...props}>
      {children}
    </div>
  );
}
