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

  const isAuthRoute = useMemo(() => pathname?.startsWith('/login') || pathname?.startsWith('/signup'), [pathname]);

  useEffect(() => {
    // Enforce: no actions unless user has signed up and is logged in
    const hasAnyProfile = typeof window !== 'undefined' && !!localStorage.getItem('userProfile');
    const hasProfileForAddr = typeof window !== 'undefined' && address ? !!localStorage.getItem(`userProfile-${address}`) : false;

    if (isAuthRoute) {
      setChecked(true);
      return;
    }

    // If not on auth routes, require both: connected AND profile exists for that address
    if (!isConnected) {
      router.replace('/login');
      return;
    }
    if (!hasProfileForAddr) {
      // If they connected a wallet that has no profile, force signup
      router.replace('/signup');
      return;
    }

    // Ensure current profile matches connected address; if not, sync it
    if (hasProfileForAddr && address) {
      const current = localStorage.getItem('userProfile');
      const expected = localStorage.getItem(`userProfile-${address}`);
      if (expected && current !== expected) {
        localStorage.setItem('userProfile', expected);
      }
    }
    setChecked(true);
  }, [isConnected, address, router, pathname, isAuthRoute]);

  if (!checked) {
    return null;
  }

  return (
    <div className={cn('container mx-auto px-4 py-8 md:py-12', className)} {...props}>
      {children}
    </div>
  );
}
