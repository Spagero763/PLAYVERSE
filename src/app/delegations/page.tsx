import DelegationForm from '@/components/delegations/delegation-form';

export default function DelegationsPage() {
  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Delegations (demo)</h1>
        <p className="text-muted-foreground">Sign a delegation with your injected wallet (MetaMask) and save a DelegationPacket to localStorage for the DCA agent demo.</p>
      </div>
      <div>
        <DelegationForm />
      </div>
    </div>
  );
}
