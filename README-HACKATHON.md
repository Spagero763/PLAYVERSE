# Playverse — Hackathon demo (MVP)

Quick goal
- Show a browser-based delegation signing flow and an agent that verifies and "executes" the delegation (simulated tx hash).

How to run locally
1. Install deps:

```powershell
Set-Location -Path 'C:\Users\user\Downloads\PLAYVERSE-main'
npm install
```

2. Start dev server (port 3000 recommended):

```powershell
$env:PORT='3000'; npm run dev
# Open: http://localhost:3000/delegations
```

3. Demo steps (what a reviewer should do)
 - Open `http://localhost:3000/delegations`.
 - Use an injected wallet (MetaMask) to sign a DelegationPacket using the Delegation form (click Sign Delegation). This saves the packet to localStorage.
 - Go to `http://localhost:3000/agents/dca` and click "Execute Once". The page will POST the saved packet to the server. The server verifies the EIP-712 signature and returns a simulated tx hash.

What I implemented
- `src/components/delegations/delegation-form.tsx` — simple EIP-712 typed data builder and `eth_signTypedData_v4` signature request; saves packet to localStorage.
- `src/app/agents/dca/page.tsx` — DCA agent demo that reads packet from localStorage and calls `/api/agent/execute` to verify and simulate execution.
- `src/app/api/agent/execute/route.ts` — verifies typed-data signature and returns a fake txHash (server-side).

Notes & next steps
- For a full on-chain MMSA demo, install `@metamask/delegation-toolkit` and wire the MMSA flows — not required for the MVP and risky in a short timebox.
- If you want me to include short GIFs/screenshots, I can add them to `/docs` and update this README.

Contact
- If the reviewer wants a live demo I can provide a short video or run the app on a public preview.
