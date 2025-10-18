
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

const projectId = 'dc37f4ba07aebe0f49899bb9b061eaa4';

// Custom Monad Testnet chain definition. Configure via env for real deployment.
export const monadTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || 10143),
  name: process.env.NEXT_PUBLIC_MONAD_CHAIN_NAME || 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || 'https://testnet.explorer.monad.xyz',
    },
  },
});

export const config = createConfig({
  chains: [monadTestnet, sepolia, mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
});
