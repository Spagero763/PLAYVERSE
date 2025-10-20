'use client';

import { useState } from 'react';
import { createHybridWithAccount, createHybridWithWalletClient, createStateless7702WithWalletClient } from '@/lib/mmsa/create';

export default function AgentsAccountsPage() {
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Agents Accounts (removed)</h1>
      <p className="text-muted-foreground">This page has been removed.</p>
    </div>
  );
}
