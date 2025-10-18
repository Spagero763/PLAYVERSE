
'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getCurrentUserProfile } from '@/lib/profile-manager';
import ProfileClientPage from './profile-client';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const ProfileLoadingSkeleton = () => (
    <PageShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card className="glass-card text-center">
                <CardContent className="p-6 flex flex-col items-center">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-primary" />
                    <Skeleton className="h-8 w-40 mt-4" />
                    <Skeleton className="h-4 w-24 mt-2" />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card">
                <CardContent className="p-6">
                     <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    </PageShell>
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = () => {
      const existing = getCurrentUserProfile();
      if (existing) {
        setProfile(existing);
        return;
      }
      if (isConnected && address) {
        const storedProfile = localStorage.getItem(`userProfile-${address}`);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
          return;
        }
      }
      setProfile(null);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, [address, isConnected, isMounted]);

  if (!isMounted) {
    return <ProfileLoadingSkeleton />;
  }

  // If no wallet, still try to render local profile; if none, show empty state

  if (!profile) {
    // Wallet connected, but no profile exists in local storage. Still loading or user needs to sign up.
     return <ProfileLoadingSkeleton />;
  }

  return <ProfileClientPage profile={profile} />;
}
