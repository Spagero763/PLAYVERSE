
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { defaultProfile } from '@/lib/constants';
import Image from 'next/image';

export function LoginForm() {
    const router = useRouter();
    const { connect, connectors, isPending } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (isConnected && address) {
            // Check if a profile exists for this specific address
            const userProfileForAddress = localStorage.getItem(`userProfile-${address}`);
            
            if (userProfileForAddress) {
                // Profile exists, so log them in
                localStorage.setItem('userProfile', userProfileForAddress);

                toast({
                    title: 'Logged In!',
                    description: 'Welcome back to the PlayVerse.',
                });
                router.push('/games');
            } else {
                // No profile found for this address
                toast({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: 'No account found for this wallet. Please sign up first.',
                });
                // Disconnect the wallet to make the flow clear
                disconnect();
            }
        }
    }, [isConnected, address, router, disconnect]);
    
    const handleLogin = () => {
        // Find the injected connector (e.g., MetaMask) or default to the first one.
        const connector = connectors.find(c => c.id === 'injected') || connectors[0];
        connect({ connector });
    }


    return (
        <div className="mt-8 flex flex-col items-center gap-4">
             <Button
                onClick={handleLogin}
                disabled={isPending}
                className="w-full"
                variant="default"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <Wallet className="mr-2 h-5 w-5" />
                        Login with Wallet
                    </>
                )}
            </Button>
            <p className='text-center text-xs text-muted-foreground mt-2'>
                Connect your EVM wallet to log in or create an account.
            </p>
        </div>
    );
}
