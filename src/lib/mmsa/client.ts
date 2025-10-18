import { createPublicClient, http } from 'viem';
import { MMSA } from '@/lib/delegation/env';

export const publicClient = createPublicClient({
  chain: {
    id: MMSA.CHAIN_ID,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: [MMSA.RPC_URL] } },
  },
  transport: http(MMSA.RPC_URL),
});
