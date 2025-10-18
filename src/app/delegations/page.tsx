import DelegationForm from '@/components/delegations/delegation-form';
import ExecuteIntent from '@/components/delegations/execute-intent';
import EnvioDelegationsView from '@/components/delegations/envio-view';

export default function DelegationsPage() {
  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Delegations</h1>
        <p className="text-muted-foreground">Grant an agent permission to act on your behalf on Monad.</p>
      </div>
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Create Delegation</h2>
        <DelegationForm />
      </div>
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Test Delegated Execution</h2>
        <ExecuteIntent />
      </div>
      <EnvioDelegationsView />
    </div>
  );
}
