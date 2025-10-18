// Manual environment override for Monad Testnet (10143) if not supported by deployments.
// Replace these addresses with the deployed toolkit contracts on Monad testnet
// or leave undefined to use default deployments if/when available.

export function getEnvironmentOverride() {
  const dm = process.env.NEXT_PUBLIC_MMSA_DELEGATION_MANAGER as `0x${string}` | undefined;
  const ep = process.env.NEXT_PUBLIC_MMSA_ENTRYPOINT as `0x${string}` | undefined;
  const sf = process.env.NEXT_PUBLIC_MMSA_SIMPLE_FACTORY as `0x${string}` | undefined;
  const hybrid = process.env.NEXT_PUBLIC_MMSA_HYBRID_IMPL as `0x${string}` | undefined;
  const multisig = process.env.NEXT_PUBLIC_MMSA_MULTISIG_IMPL as `0x${string}` | undefined;
  const eip7702 = process.env.NEXT_PUBLIC_MMSA_7702_IMPL as `0x${string}` | undefined;

  if (dm && ep && sf && hybrid && multisig && eip7702) {
    return {
      DelegationManager: dm,
      EntryPoint: ep,
      SimpleFactory: sf,
      implementations: {
        MultiSigDeleGatorImpl: multisig,
        HybridDeleGatorImpl: hybrid,
        EIP7702StatelessDeleGatorImpl: eip7702,
      },
      caveatEnforcers: {},
    } as const;
  }
  return undefined as any;
}
