'use client';

import { useState } from 'react';
import { createHybridWithAccount, createHybridWithWalletClient, createStateless7702WithWalletClient } from '@/lib/mmsa/create';

export default function SmartAccountsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function run(name: string, fn: () => Promise<any>) {
    setLoading(name);
    setResult(null);
    try {
      const sa = await fn();
      setResult(sa);
    } catch (e: any) {
      setResult({ error: e?.message || 'Failed' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create MetaMask Smart Account</h1>
      <div className="glass-card p-6 rounded-xl space-y-4">
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => run('hybrid-account', createHybridWithAccount)}
          disabled={!!loading}
        >
          {loading === 'hybrid-account' ? 'Creating...' : 'Hybrid (Account signer)'}
        </button>
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => run('hybrid-wallet', createHybridWithWalletClient)}
          disabled={!!loading}
        >
          {loading === 'hybrid-wallet' ? 'Creating...' : 'Hybrid (Wallet Client signer)'}
        </button>
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => run('stateless-7702', createStateless7702WithWalletClient)}
          disabled={!!loading}
        >
          {loading === 'stateless-7702' ? 'Creating...' : 'Stateless 7702 (Wallet Client)'}
        </button>
        {result && (
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
