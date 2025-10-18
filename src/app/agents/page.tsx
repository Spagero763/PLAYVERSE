import Link from 'next/link';

export default function AgentsHub() {
  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-muted-foreground">Autonomous agents for yield optimization and DCA on Monad.</p>
      </div>
      <div className="grid gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold">Smart Accounts</h2>
          <p className="text-muted-foreground">Create MetaMask Smart Accounts (Hybrid, 7702) on Monad.</p>
          <Link href="/agents/accounts" className="text-primary underline">Open</Link>
          <div className="mt-2 text-sm">
            <Link href="/agents/accounts/deploy" className="underline">Deploy Delegation Toolkit</Link>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold">Yield Optimizer</h2>
          <p className="text-muted-foreground">Get strategy recommendations and optionally execute via delegation.</p>
          <Link href="/agents/yield" className="text-primary underline">Open</Link>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold">DCA Agent</h2>
          <p className="text-muted-foreground">Automate periodic buys when delegation allows.</p>
          <Link href="/agents/dca" className="text-primary underline">Open</Link>
        </div>
      </div>
    </div>
  );
}
