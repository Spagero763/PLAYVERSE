export const MMSA = {
  // Populate from env at build/runtime
  CHAIN_ID: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || 10143),
  RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
  DOMAIN_NAME: process.env.NEXT_PUBLIC_MMSA_DOMAIN || 'PayCrypt Delegation',
  VERIFYING_CONTRACT: process.env.NEXT_PUBLIC_MMSA_VERIFYING_CONTRACT as `0x${string}` | undefined,
};
