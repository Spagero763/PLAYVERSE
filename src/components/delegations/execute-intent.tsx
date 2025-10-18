'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Address } from 'viem';

const schema = z.object({
  owner: z.string().startsWith('0x').length(42),
  delegate: z.string().startsWith('0x').length(42),
  to: z.string().startsWith('0x').length(42),
  data: z.string().optional(),
});

export default function ExecuteIntent() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    const dataObj = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(dataObj);
    if (!parsed.success) {
      toast({ title: 'Invalid input', description: 'Please check the fields.' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/delegations/execute', { method: 'POST', body: JSON.stringify(parsed.data) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to execute');
      toast({ title: 'Intent Accepted', description: 'Execution permitted by delegation.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to execute' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Owner address</Label>
          <Input name="owner" placeholder="0xOwner..." defaultValue={address || ''} />
        </div>
        <div>
          <Label>Delegate address</Label>
          <Input name="delegate" placeholder="0xAgent..." />
        </div>
      </div>
      <div>
        <Label>Target contract</Label>
        <Input name="to" placeholder="0xTarget..." />
      </div>
      <div>
        <Label>Calldata (optional)</Label>
        <Input name="data" placeholder="0x..." />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Simulate Execution'}</Button>
    </form>
  );
}
