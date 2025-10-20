"use client";

import { useEffect, useState } from 'react';

export default function DcaAgentPage() {
  const [packet, setPacket] = useState<any | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('delegationPacket');
    if (raw) setPacket(JSON.parse(raw));
  }, []);

  function append(msg: string) {
    setLogs((s) => [...s, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function executeOnce() {
    if (!packet) {
      append('No delegation packet available — please sign one at /delegations first');
      return;
    }
    append('Calling execute API...');
    try {
      const res = await fetch('/api/agent/execute', { method: 'POST', body: JSON.stringify(packet), headers: { 'Content-Type': 'application/json' } });
      const j = await res.json();
      if (res.ok) {
        append('Execute OK: ' + (j.txHash || JSON.stringify(j)));
        append('Full response: ' + JSON.stringify(j));
      } else {
        append('Execute failed: ' + JSON.stringify(j));
      }
    } catch (err: any) {
      append('Execute error: ' + err?.message);
    }
  }

  useEffect(() => {
    if (!running) return;
    append('Agent started');
    const t = setInterval(() => { executeOnce(); }, 10_000);
    return () => { clearInterval(t); append('Agent stopped'); };
  }, [running]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">DCA Agent (Demo)</h2>
      <p className="text-sm text-muted">Purpose: demonstrate a delegated agent using a saved DelegationPacket. Steps: 1) open <code>/delegations</code> and sign a delegation with MetaMask; 2) return here and click "Execute Once" to POST the packet to the server which verifies the signature and returns a simulated tx hash.</p>
      <div>
        <button className="btn" onClick={() => setRunning((r) => !r)}>{running ? 'Stop Agent' : 'Start Agent'}</button>
        <button className="btn ml-2" onClick={() => executeOnce()}>Execute Once</button>
      </div>
      <div>
        <h3 className="font-medium">Loaded packet</h3>
        {packet ? <pre className="text-xs">{JSON.stringify(packet, null, 2)}</pre> : <div className="text-sm text-muted">No packet found in localStorage (use Delegation form)</div>}
      </div>
      <div>
        <h3 className="font-medium">Logs</h3>
        <div className="p-2 bg-surface rounded max-h-64 overflow-auto text-xs">{logs.map((l,i)=>(<div key={i}>{l}</div>))}</div>
      </div>
    </div>
  );
}
