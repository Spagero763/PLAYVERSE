'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Address } from 'viem';
import type { DelegationPacket } from '@/lib/delegation/types';
import { MMSA } from '@/lib/delegation/env';

const schema = z.object({
  delegate: z.string().startsWith('0x').length(42),
  targets: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
});

export default function DelegationForm() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    if (!address) {
      toast({ title: 'Connect wallet', description: 'Please connect your wallet first.' });
      return;
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast({ title: 'Invalid input', description: 'Please check the fields.' });
      return;
    }
    const targets = (parsed.data.targets as string).split(',').map((t) => t.trim() as Address);
    const startTime = Math.floor(new Date(parsed.data.startTime as string).getTime() / 1000);
    const endTime = Math.floor(new Date(parsed.data.endTime as string).getTime() / 1000);

    const message = {
      owner: address as Address,
      delegate: parsed.data.delegate as Address,
      allowedTargets: targets,
      startTime,
      endTime,
      // bytes32 nonce required by EIP-712 types; using crypto.getRandomValues
      nonce: (() => {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return ('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
      })(),
    };

    // EIP-712 typed data per Delegation Toolkit style
    const domain = {
      name: MMSA.DOMAIN_NAME,
      version: '1',
      chainId: MMSA.CHAIN_ID,
      verifyingContract: MMSA.VERIFYING_CONTRACT,
    } as const;
    const types = {
      Delegation: [
        { name: 'owner', type: 'address' },
        { name: 'delegate', type: 'address' },
        { name: 'allowedTargets', type: 'address[]' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    } as const;
    const sig = await (window as any).ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [
        address,
        JSON.stringify({
          domain,
          types,
          primaryType: 'Delegation',
          message: {
            owner: message.owner,
            delegate: message.delegate,
            allowedTargets: message.allowedTargets,
            startTime: message.startTime,
            endTime: message.endTime,
            nonce: message.nonce,
          },
        }),
      ],
    });

    const packet: DelegationPacket = {
      chainId: MMSA.CHAIN_ID,
      domainName: MMSA.DOMAIN_NAME,
      verifyingContract: MMSA.VERIFYING_CONTRACT,
      message,
      signature: sig,
    };

    try {
      setLoading(true);
      const res = await fetch('/api/delegations/verify', { method: 'POST', body: JSON.stringify(packet) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed');
      toast({ title: 'Delegation Saved', description: 'Your agent can now act within the limits.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to save delegation' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label>Delegate (agent) address</Label>
        <Input name="delegate" placeholder="0xAgent..." />
      </div>
      <div>
        <Label>Allowed target contract(s), comma-separated</Label>
        <Input name="targets" placeholder="0xTarget1,0xTarget2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start time</Label>
          <Input type="datetime-local" name="startTime" />
        </div>
        <div>
          <Label>End time</Label>
          <Input type="datetime-local" name="endTime" />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Delegation'}</Button>
    </form>
  );
}
