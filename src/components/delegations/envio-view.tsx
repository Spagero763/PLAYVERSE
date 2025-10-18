'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isEnvioEnabled, fetchDelegationsForOwner } from '@/lib/envio/config';

export default function EnvioDelegationsView() {
  const [owner, setOwner] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetchDelegationsForOwner(owner);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    // no auto-load
  }, []);

  if (!isEnvioEnabled()) return null;

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">Envio: Delegations (Live)</h2>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Label>Owner</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="0xOwner..." />
        </div>
        <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Query'}</Button>
      </div>
      {rows.length > 0 && (
        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(rows, null, 2)}</pre>
      )}
    </div>
  );
}
