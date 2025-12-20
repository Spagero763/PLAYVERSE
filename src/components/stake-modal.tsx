'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useWalletClient, usePublicClient } from 'wagmi';
import { buildPlaceStakeTx, getContractAddressForChain, BASE_STAKE_WEI, CELO_STAKE_WEI, baseChain, celoChain, waitForTxReceipt } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, Link as LinkIcon } from 'lucide-react';

export default function StakeModal({ open, onOpenChange, onSuccess, gameId }: { open: boolean, onOpenChange: (v:boolean) => void, onSuccess?: () => void, gameId: string }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: walletClient } = useWalletClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const chainId = (walletClient as any)?.chain?.id as number | undefined;
  const publicClient = usePublicClient();
  const hasContract = chainId && !!getContractAddressForChain(chainId);
  const stakeValue = chainId ? (chainId === 42220 ? CELO_STAKE_WEI : BASE_STAKE_WEI) : BASE_STAKE_WEI;

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setTxHash(null);
    }
  }, [open]);

  const handleConnect = () => {
    const connector = connectors.find(c => c.id === 'injected') || connectors[0];
    connect({ connector });
  };

  const handleConfirm = async () => {
    if (!isConnected || !address) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Connect your wallet first.' });
      return;
    }
    if (!chainId) {
      toast({ variant: 'destructive', title: 'Chain unknown', description: 'Could not detect network.' });
      return;
    }
    const contractAddress = getContractAddressForChain(chainId);
    if (!contractAddress) {
      toast({ variant: 'destructive', title: 'Unsupported network', description: 'Staking is not available on this network.' });
      return;
    }

    const tx = buildPlaceStakeTx(chainId, gameId, stakeValue);

    try {
      setIsSubmitting(true);
      if (!walletClient) throw new Error('Wallet client not ready');

      // walletClient.sendTransaction expects value as bigint or hex depending on client; use the passed object directly
      // Use withDivvi wrapper via lib if needed; but we can send directly
      const result: any = await (walletClient as any).sendTransaction(tx as any);

      const resAny: any = result;
      const hash = typeof result === 'string' ? result : (resAny.hash || String(result));
      setTxHash(hash);
      toast({ title: 'Stake transaction sent', description: `Tx: ${hash}` });

      // wait for confirmation with public client
      try {
        const receipt = await waitForTxReceipt((publicClient as any), hash, 180_000);
        if (receipt && receipt.status === 1n || receipt.status === 1) {
          toast({ title: 'Stake confirmed', description: `Tx confirmed: ${hash}` });
          // Persist stake locally so users can claim refunds later if needed
          try {
            const record = { chainId, gameId, txHash: hash, amount: stakeValue.toString(), timestamp: Date.now(), claimed: false };
            localStorage.setItem(`stake-${gameId}`, JSON.stringify(record));
          } catch (e) {
            // ignore localStorage errors
          }
          onSuccess && onSuccess();
          onOpenChange(false);
        } else {
          toast({ variant: 'destructive', title: 'Stake failed', description: 'Transaction did not succeed' });
        }
      } catch (e: any) {
        console.warn('Confirmation wait failed', e);
        toast({ title: 'Transaction submitted', description: `Tx: ${hash}` });
        // Still treat as success but inform user to check later
        onSuccess && onSuccess();
        onOpenChange(false);
      }
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Transaction failed', description: e?.message || String(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stake required for Hard Mode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Playing on Hard mode requires a stake to be placed.<br/>You'll stake the native token for the selected network.</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Selected network:</p>
              <p className="font-medium">{(walletClient as any)?.chain?.name || 'Not connected'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Stake amount</p>
              <p className="font-medium">{chainId === celoChain.id ? '1 CELO' : '0.000000001 ETH'}</p>
            </div>
          </div>

          {!isConnected ? (
            <div className="flex gap-3">
              <Button onClick={handleConnect} className="w-full">
                Connect Wallet
              </Button>
            </div>
          ) : !hasContract ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Your wallet is connected to an unsupported chain. Staking is not available on this chain.</p>
              <div className="flex gap-2">
                <Button onClick={() => {
                  // Try to switch via window.ethereum to Celo
                  if ((window as any).ethereum) {
                    try {
                      (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xA4EC' }] }); // 42220 decimal
                    } catch (e) {
                      console.warn('switch failed', e);
                      toast({ variant: 'destructive', title: 'Switch failed', description: 'Please switch your wallet network to Celo manually.' });
                    }
                  } else {
                    toast({ variant: 'destructive', title: 'No provider', description: 'No wallet provider detected to switch chain.' });
                  }
                }}>Switch to Celo</Button>
                <Button onClick={() => {
                  // Try to switch via window.ethereum to Base
                  if ((window as any).ethereum) {
                    try {
                      (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] }); // 8453 decimal
                    } catch (e) {
                      console.warn('switch failed', e);
                      toast({ variant: 'destructive', title: 'Switch failed', description: 'Please switch your wallet network to Base manually.' });
                    }
                  } else {
                    toast({ variant: 'destructive', title: 'No provider', description: 'No wallet provider detected to switch chain.' });
                  }
                }}>Switch to Base</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleConfirm} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Place Stake</>
                )}
              </Button>
            </div>
          )}

          {txHash && (
            <p className="text-xs text-muted-foreground">Transaction: <a className="underline" target="_blank" rel="noreferrer" href={`${chainId === celoChain.id ? 'https://explorer.celo.org/tx/' : 'https://base.blockscout.com/tx/'}${txHash}`}>{txHash}</a></p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
