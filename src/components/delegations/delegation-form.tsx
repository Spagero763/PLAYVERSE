"use client";

import { useState } from 'react';

export default function DelegationForm() {
  const [delegate, setDelegate] = useState('');
  const [target, setTarget] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [packet, setPacket] = useState<any | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function signDelegation(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Preparing typed data...');
    if (!(window as any).ethereum) {
      setStatus('No injected wallet found (MetaMask required).');
      return;
    }

    const owner = (window as any).ethereum.selectedAddress || null;
    if (!owner) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      } catch (err) {
        setStatus('Wallet connection required');
        return;
      }
    }

    const chainId = parseInt(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || '10143', 10);
    const domain = {
      name: process.env.NEXT_PUBLIC_MMSA_DOMAIN || 'Playverse Delegation',
      version: '1',
      chainId,
      verifyingContract: process.env.NEXT_PUBLIC_MMSA_VERIFYING_CONTRACT || undefined,
    } as any;

    const message = {
      owner: (window as any).ethereum.selectedAddress || owner,
      delegate,
      allowedTargets: target ? [target] : [],
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      nonce: `0x${'0'.repeat(64)}`,
    };

    const types = {
      Delegation: [
        { name: 'owner', type: 'address' },
        { name: 'delegate', type: 'address' },
        { name: 'allowedTargets', type: 'address[]' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    } as any;

    const typedData = { types: { EIP712Domain: [], Delegation: types.Delegation }, domain, primaryType: 'Delegation', message };

    try {
      setStatus('Requesting signature...');
      const from = (window as any).ethereum.selectedAddress;
      const sig = await (window as any).ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify({ types: { Delegation: types.Delegation, EIP712Domain: [] }, domain, primaryType: 'Delegation', message })],
      });

      const packet = {
        chainId,
        domainName: domain.name,
        verifyingContract: domain.verifyingContract,
        message,
        signature: sig,
      };
      setSignature(sig);
      setPacket(packet);
      localStorage.setItem('delegationPacket', JSON.stringify(packet));
      setStatus('Delegation signed and saved locally.');
    } catch (err: any) {
      setStatus('Signature failed: ' + (err?.message || String(err)));
    }
  }

  return (
    <form onSubmit={signDelegation} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Delegate (agent) address</label>
        <input className="mt-1 w-full" value={delegate} onChange={(e) => setDelegate(e.target.value)} placeholder="0xAgent..." />
      </div>
      <div>
        <label className="block text-sm font-medium">Allowed target (contract)</label>
        <input className="mt-1 w-full" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0xContract..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn">Sign Delegation</button>
        <button type="button" className="btn" onClick={() => { localStorage.removeItem('delegationPacket'); setPacket(null); setSignature(null); setStatus('Cleared'); }}>Clear</button>
      </div>
      <div className="mt-2 text-sm">
        <div>Status: {status}</div>
        {signature && <div className="break-all">Signature: {signature}</div>}
        {packet && <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(packet, null, 2)}</pre>}
      </div>
    </form>
  );
}

