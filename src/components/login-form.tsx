
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { defaultProfile } from '@/lib/constants';
import Image from 'next/image';
import { baseChain, celoChain } from '@/lib/web3';

export function LoginForm() {
    const router = useRouter();
    const { connect, connectors, isPending } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const [preferredChainId, setPreferredChainId] = useState<number | null>(Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || baseChain.id));

    useEffect(() => {
        const handleLoginFlow = async () => {
            if (isConnected && address) {
                // Check if a profile exists for this specific address
                const userProfileForAddress = localStorage.getItem(`userProfile-${address}`);
                
                if (userProfileForAddress) {
                    // If user selected a preferred network earlier, or current UI choice differs, ensure wallet is on preferred
                    if (preferredChainId && chainId && chainId !== preferredChainId) {
                        if (switchChain) {
                            try {
                                await switchChain(preferredChainId);
                            } catch (e) {
                                toast({ variant: 'destructive', title: 'Network mismatch', description: 'Please switch your wallet network to continue.' });
                                disconnect();
                                return;
                            }
                        }
                    }

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
        }
        handleLoginFlow();
    }, [isConnected, address, router, disconnect, preferredChainId, chainId, switchChain]);
    
    const handleLogin = () => {
        // Find the injected connector (e.g., MetaMask) or default to the first one.
        const connector = connectors.find(c => c.id === 'injected') || connectors[0];
        connect({ connector });
    }


    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-full">
                <p className="text-sm text-muted-foreground mb-2">Preferred network</p>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant={preferredChainId === baseChain.id ? 'default' : 'ghost'} onClick={() => setPreferredChainId(baseChain.id)}>Base (ETH)</Button>
                    <Button variant={preferredChainId === celoChain.id ? 'default' : 'ghost'} onClick={() => setPreferredChainId(celoChain.id)}>Celo</Button>
                </div>
            </div>
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
