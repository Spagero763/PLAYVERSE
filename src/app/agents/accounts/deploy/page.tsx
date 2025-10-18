'use client';

import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { MMSA } from '@/lib/delegation/env';
import { deployToolkit } from '@/lib/mmsa/deploy';

export default function DeployToolkitPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function ensureMonadChain() {
    const chainIdHex = '0x' + MMSA.CHAIN_ID.toString(16);
    const ethereum = (window as any).ethereum;
    if (!ethereum?.request) throw new Error('No injected wallet found');
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
    } catch (err: any) {
      if (err?.code === 4902) {
        // Automatically add the Monad Testnet chain if missing
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: 'Monad Testnet',
                nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
                rpcUrls: [MMSA.RPC_URL],
                blockExplorerUrls: ['https://testnet.explorer.monad.xyz'],
              },
            ],
          });
          // Try switching again after adding
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
          return;
        } catch (addErr: any) {
          throw new Error(
            `Failed to add Monad Testnet (chainId ${MMSA.CHAIN_ID}). Please add it manually in MetaMask.`
          );
        }
      }
      throw err;
    }
  }

  async function deploy() {
    try {
      setLoading(true);
      await ensureMonadChain();
      const walletClient = createWalletClient({ transport: custom((window as any).ethereum) });
      // Request accounts if not present
      try { await walletClient.requestAddresses(); } catch {}
      const res = await deployToolkit(walletClient);
      setResult(res);
    } catch (e: any) {
      setResult({ error: e?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Deploy Delegation Toolkit</h1>
      <p className="text-muted-foreground">Deploy the Toolkit contracts to Monad testnet (requires gas).</p>
      <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={deploy} disabled={loading}>
        {loading ? 'Deploying...' : 'Deploy Now'}
      </button>
      {result && <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
