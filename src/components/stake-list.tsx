'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { buildRefundStakeTx, waitForTxReceipt, getContractAddressForChain } from '@/lib/web3';
import { useStake } from '@/hooks/use-stake';
import { toast } from '@/hooks/use-toast';
import { Link as LinkIcon } from 'lucide-react';
import PLAYVERSE_STAKE_ABI from '@/lib/abis/playverseStake';
import { useWatchContractEvent } from 'wagmi';

type LocalStakeRecord = {
  chainId: number;
  gameId: string;
  txHash: string;
  amount: string;
  timestamp: number;
  claimed: boolean;
};

export default function StakeList() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chain } = useNetwork();

  const [records, setRecords] = useState<LocalStakeRecord[]>([]);

  useEffect(() => {
    if (!address) return;
    try {
      const all: LocalStakeRecord[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('stake-')) {
          try {
            const v = JSON.parse(localStorage.getItem(key) || 'null');
            if (v && v.player !== undefined && false) {
              // old format (ignore)
            }
            if (v && v.gameId) all.push(v as LocalStakeRecord);
          } catch (e) { }
        }
      }
      setRecords(all);
    } catch (e) {
      setRecords([]);
    }
  }, [address]);

  // Watch for Refunded or GameResolved for any of the stored gameIds
  useEffect(() => {
    if (records.length === 0) return;
    // For simplicity, re-poll local data when events arrive using public client
  }, [records, publicClient]);

  // Helper to remove record
  const removeRecord = (gameId: string) => {
    try { localStorage.removeItem(`stake-${gameId}`); } catch (e) {}
    setRecords(records.filter(r => r.gameId !== gameId));
  };

  const claimRefund = async (record: LocalStakeRecord) => {
    if (!walletClient) { toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Connect your wallet to claim refund.' }); return; }
    const chainId = record.chainId;
    const tx = buildRefundStakeTx(chainId, record.gameId);
    try {
      const res: any = await (walletClient as any).sendTransaction(tx as any);
      const hash = typeof res === 'string' ? res : (res?.hash || String(res));
      toast({ title: 'Refund tx sent', description: `Tx: ${hash}` });
      // wait for confirmation
      await waitForTxReceipt((publicClient as any), hash, 120_000);
      toast({ title: 'Refund confirmed', description: `Tx: ${hash}` });
      // remove record
      removeRecord(record.gameId);
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Refund failed', description: e?.message || String(e) });
    }
  };

  if (!address) {
    return (<p className="text-sm text-muted-foreground">Connect a wallet to view your stakes.</p>);
  }

  if (records.length === 0) return (<p className="text-sm text-muted-foreground">You have no active stakes recorded locally.</p>);

  return (
    <div className="space-y-4">
      {records.map((r) => (
        <StakeRow key={r.gameId} record={r} onClaim={() => claimRefund(r)} onRemove={() => removeRecord(r.gameId)} />
      ))}
    </div>
  );
}

function StakeRow({ record, onClaim, onRemove }: { record: LocalStakeRecord, onClaim: () => void, onRemove: () => void }) {
  const { chainId, gameId, txHash, amount, timestamp } = record;
  const { stake, timeout, loading, refresh, canRefund } = useStake(chainId, gameId);
  const explorer = chainId === 42220 ? 'https://explorer.celo.org/tx/' : 'https://base.blockscout.com/tx/';

  useWatchContractEvent({
    address: getContractAddressForChain(chainId) as `0x${string}`,
    abi: PLAYVERSE_STAKE_ABI as any,
    eventName: 'Refunded',
    chainId,
    listener(o) {
      try {
        const [evGameId] = o as any;
        if (evGameId && evGameId === gameId) {
          toast({ title: 'Refunded on-chain', description: `Game ${gameId} refunded` });
          refresh();
        }
      } catch (e) {}
    }
  });

  useWatchContractEvent({
    address: getContractAddressForChain(chainId) as `0x${string}`,
    abi: PLAYVERSE_STAKE_ABI as any,
    eventName: 'GameResolved',
    chainId,
    listener(o) {
      try {
        const [evGameId] = o as any;
        if (evGameId && evGameId === gameId) {
          toast({ title: 'Game resolved', description: `Game ${gameId} resolved on-chain` });
          refresh();
        }
      } catch (e) {}
    }
  });

  return (
    <div className="p-4 bg-secondary/5 rounded-md flex items-center justify-between">
      <div>
        <div className="text-sm">Game: <code>{gameId}</code></div>
        <div className="text-xs text-muted-foreground">Amount: {amount} • Tx <a className="underline" href={`${explorer}${txHash}`} target="_blank" rel="noreferrer">{txHash.slice(0, 12)}...</a></div>
        <div className="text-xs text-muted-foreground">Status: {stake ? (stake.claimed ? 'Claimed' : 'Active') : 'Unknown' } {loading ? ' (loading...)' : ''}</div>
        <div className="text-xs text-muted-foreground">Can refund: {canRefund ? 'Yes' : 'No'}</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.open(`${explorer}${txHash}`, '_blank')}>Open Tx <LinkIcon className="ml-2 h-4 w-4" /></Button>
        {canRefund && <Button onClick={onClaim} variant="default">Claim Refund</Button>}
        <Button variant="ghost" onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
}
