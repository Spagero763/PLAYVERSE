"use client";

import { useState } from 'react';

export default function YieldAgentPage() {
  const [risk, setRisk] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskProfile: risk,
          currentPositions: [{ protocolId: 'protocol-a-lending', amount: 1000 }],
        }),
      });
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setResult({ ok: false, error: (e as any)?.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Yield Optimizer</h1>
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm">Risk:</label>
          <select
            className="bg-background border rounded px-3 py-2"
            value={risk}
            onChange={(e) => setRisk(e.target.value as any)}
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
          <button onClick={run} className="px-4 py-2 rounded bg-primary text-primary-foreground" disabled={loading}>
            {loading ? 'Running...' : 'Get Strategy'}
          </button>
        </div>
        {result && (
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
