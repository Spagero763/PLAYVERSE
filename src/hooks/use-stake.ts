import { useEffect, useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { getPlayverseContractViem } from '@/lib/web3';

export type StakeInfo = {
  player: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  claimed: boolean;
} | null;

export const useStake = (chainId: number | undefined, gameId: string | undefined) => {
  const publicClient = usePublicClient();
  const [stake, setStake] = useState<StakeInfo>(null);
  const [timeout, setTimeoutVal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!chainId || !gameId || !publicClient) return;
    try {
      setLoading(true);
      const contract = getPlayverseContractViem(chainId, publicClient as any);
      if (!contract) return;
      // read the mapping
      const s: any = await (contract.read as any).stakes(gameId);
      const t: any = await (contract.read as any).timeout();
      setStake({
        player: s.player as `0x${string}`,
        amount: BigInt(s.amount.toString()),
        timestamp: BigInt(s.timestamp.toString()),
        claimed: !!s.claimed,
      });
      setTimeoutVal(Number(t));
    } catch (e) {
      setStake(null);
    } finally {
      setLoading(false);
    }
  }, [chainId, gameId, publicClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canRefund = (() => {
    if (!stake || !timeout) return false;
    const now = Math.floor(Date.now() / 1000);
    return !stake.claimed && Number(stake.timestamp) + timeout <= now;
  })();

  return { stake, timeout, loading, refresh, canRefund };
};
