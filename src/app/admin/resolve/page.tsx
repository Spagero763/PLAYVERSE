'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useWalletClient, usePublicClient } from 'wagmi';
import { buildResolveGameTx, getContractAddressForChain, baseChain, celoChain, getPlayverseOwner, buildWithdrawFeesTx, buildSetFeeBpsTx, buildSetTimeoutTx, waitForTxReceipt } from '@/lib/web3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function AdminResolvePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: walletClient } = useWalletClient();

  const [chainId, setChainId] = useState<number>(Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || baseChain.id));
  const [gameId, setGameId] = useState<string>('');
  const [playerWon, setPlayerWon] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [withdrawTo, setWithdrawTo] = useState<string>('');
  const [newFeeBps, setNewFeeBps] = useState<number>(100);
  const [newTimeout, setNewTimeout] = useState<number>(86400);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const o = await getPlayverseOwner(chainId, publicClient as any);
        if (o) {
          setOwnerAddress(o);
          setIsOwner((address || '').toLowerCase() === o.toLowerCase());
        }
      } catch (e) {
        setOwnerAddress(null);
      }
    };
    fetchOwner();
  }, [chainId, publicClient, address]);

  const handleConnect = () => {
    const connector = connectors.find(c => c.id === 'injected') || connectors[0];
    connect({ connector });
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast({ variant: 'destructive', title: 'Not connected', description: 'Connect owner wallet first.' });
      return;
    }
    if (!gameId || !gameId.startsWith('0x') || gameId.length !== 66) {
      toast({ variant: 'destructive', title: 'Invalid gameId', description: 'gameId must be a 32-byte hex (0x...)' });
      return;
    }

    const contractAddress = getContractAddressForChain(chainId);
    if (!contractAddress) {
      toast({ variant: 'destructive', title: 'No contract', description: 'No deployed contract for selected chain' });
      return;
    }

    const tx = buildResolveGameTx(chainId, gameId, playerWon);

    try {
      setIsSubmitting(true);
      if (!walletClient) throw new Error('Wallet client not ready');
      const res: any = await (walletClient as any).sendTransaction(tx as any);
      const hash = typeof res === 'string' ? res : (res?.hash || String(res));
      setTxHash(hash);
      toast({ title: 'Resolve sent', description: `Tx: ${hash}` });
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed', description: e?.message || String(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Admin: Resolve Game On-Chain</h1>
      {!isConnected ? (
        <div className="space-y-4">
          <p>Connect the owner wallet to call <code>resolveGame</code>.</p>
          <Button onClick={handleConnect}>Connect Wallet</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground">Chain</label>
            <div className="mt-2 flex gap-2">
              <Button variant={chainId === baseChain.id ? 'default' : 'ghost'} onClick={() => setChainId(baseChain.id)}>Base</Button>
              <Button variant={chainId === celoChain.id ? 'default' : 'ghost'} onClick={() => setChainId(celoChain.id)}>Celo</Button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground">Game ID (0x...)</label>
            <Input value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="0x..." />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground">Result</label>
            <div className="mt-2 flex gap-2">
              <Button variant={playerWon ? 'default' : 'ghost'} onClick={() => setPlayerWon(true)}>Player Won</Button>
              <Button variant={!playerWon ? 'default' : 'ghost'} onClick={() => setPlayerWon(false)}>Player Lost</Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Sending...' : 'Send resolveGame'}</Button>
            <Button variant="ghost" onClick={() => { setGameId(''); setTxHash(null); }}>Reset</Button>
          </div>

          {txHash && (
            <div className="text-sm text-muted-foreground">Tx: <a target="_blank" rel="noreferrer" href={`${chainId === celoChain.id ? 'https://explorer.celo.org/tx/' : 'https://base.blockscout.com/tx/'}${txHash}`}>{txHash}</a></div>
          )}

          <div className="mt-6 p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Owner: {ownerAddress || 'Unknown'}</div>
            {!isOwner ? (
              <div className="mt-2">You are not the contract owner; owner-only actions are disabled.</div>
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm text-muted-foreground">Withdraw fees to</label>
                  <div className="mt-2 flex gap-2">
                    <Input value={withdrawTo} onChange={(e) => setWithdrawTo(e.target.value)} placeholder="0x..." />
                    <Button onClick={async () => {
                      if (!withdrawTo || !withdrawTo.startsWith('0x')) { toast({ variant: 'destructive', title: 'Invalid address' }); return; }
                      const tx = buildWithdrawFeesTx(chainId, withdrawTo as `0x${string}`);
                      try {
                        setIsSubmitting(true);
                        if (!walletClient) throw new Error('Wallet not connected');
                        const res: any = await (walletClient as any).sendTransaction(tx as any);
                        const hash = typeof res === 'string' ? res : (res?.hash || String(res));
                        setTxHash(hash);
                        await waitForTxReceipt(publicClient as any, hash, 120_000);
                        toast({ title: 'Withdraw confirmed', description: `Tx: ${hash}` });
                      } catch (e: any) {
                        toast({ variant: 'destructive', title: 'Failed', description: e?.message || String(e) });
                      } finally { setIsSubmitting(false); }
                    }}>Withdraw Fees</Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">Fee (bps)</label>
                  <div className="mt-2 flex gap-2">
                    <Input value={String(newFeeBps)} onChange={(e) => setNewFeeBps(Number(e.target.value))} />
                    <Button onClick={async () => {
                      const tx = buildSetFeeBpsTx(chainId, newFeeBps);
                      try {
                        setIsSubmitting(true);
                        if (!walletClient) throw new Error('Wallet not connected');
                        const res: any = await (walletClient as any).sendTransaction(tx as any);
                        const hash = typeof res === 'string' ? res : (res?.hash || String(res));
                        setTxHash(hash);
                        await waitForTxReceipt(publicClient as any, hash, 120_000);
                        toast({ title: 'Fee updated', description: `Tx: ${hash}` });
                      } catch (e: any) {
                        toast({ variant: 'destructive', title: 'Failed', description: e?.message || String(e) });
                      } finally { setIsSubmitting(false); }
                    }}>Set Fee</Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">Timeout (seconds)</label>
                  <div className="mt-2 flex gap-2">
                    <Input value={String(newTimeout)} onChange={(e) => setNewTimeout(Number(e.target.value))} />
                    <Button onClick={async () => {
                      const tx = buildSetTimeoutTx(chainId, newTimeout);
                      try {
                        setIsSubmitting(true);
                        if (!walletClient) throw new Error('Wallet not connected');
                        const res: any = await (walletClient as any).sendTransaction(tx as any);
                        const hash = typeof res === 'string' ? res : (res?.hash || String(res));
                        setTxHash(hash);
                        await waitForTxReceipt(publicClient as any, hash, 120_000);
                        toast({ title: 'Timeout updated', description: `Tx: ${hash}` });
                      } catch (e: any) {
                        toast({ variant: 'destructive', title: 'Failed', description: e?.message || String(e) });
                      } finally { setIsSubmitting(false); }
                    }}>Set Timeout</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
