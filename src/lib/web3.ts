'use client';

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';

const projectId = 'dc37f4ba07aebe0f49899bb9b061eaa4';
const DIVVI_CONSUMER_ADDRESS = '0x50BcA645b274A152a1C64B6251C0Ac52725BaAc1';

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

export const withDivvi = (sendTransaction: (args: any) => Promise<any>, walletClient: any) => {
  return async (args: any) => {
    if (!walletClient) {
      throw new Error("Wallet client is not ready");
    }
    const referralTag = getReferralTag({
      user: walletClient.account.address,
      consumer: DIVVI_CONSUMER_ADDRESS,
    });
    const txHash = await sendTransaction({ ...args, data: (args.data || "") + referralTag.slice(2) });
    await submitReferral({ txHash, chainId: walletClient.chain.id });
    return txHash;
  };
};