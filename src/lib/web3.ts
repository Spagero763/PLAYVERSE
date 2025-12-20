'use client';

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { defineChain, getContract, encodeFunctionData, type PublicClient } from 'viem';
import PLAYVERSE_STAKE_ABI from './abis/playverseStake';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dc37f4ba07aebe0f49899bb9b061eaa4';
const DIVVI_CONSUMER_ADDRESS = (process.env.NEXT_PUBLIC_DIVVI_CONSUMER_ADDRESS || '0x50BcA645b274A152a1C64B6251C0Ac52725BaAc1') as `0x${string}`;

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

// Base (ETH) chain definition - supports mainnet and testnet via env overrides
export const baseChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || 8453),
  name: process.env.NEXT_PUBLIC_BASE_CHAIN_NAME || 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Base Explorer',
      url: process.env.NEXT_PUBLIC_BASE_EXPLORER_URL || 'https://base.blockscout.com',
    },
  },
});

// Celo chain definition (mainnet by default, use Alfajores via env for testnet)
export const celoChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CELO_CHAIN_ID || 42220),
  name: process.env.NEXT_PUBLIC_CELO_CHAIN_NAME || 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: process.env.NEXT_PUBLIC_CELO_EXPLORER_URL || 'https://explorer.celo.org',
    },
  },
});

// export stake constants for frontend usage (use BigInt for exactness)
export const BASE_STAKE_WEI = BigInt("1000000000"); // 0.000000001 ETH = 1e9 wei
export const CELO_STAKE_WEI = BigInt("1000000000000000000"); // 1 CELO = 1e18

export const config = createConfig({
  chains: [monadTestnet, sepolia, mainnet, baseChain, celoChain],
  connectors: [
    injected(),
    walletConnect({ projectId, chains: [monadTestnet, sepolia, mainnet, baseChain, celoChain] } as any),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
    [baseChain.id]: http(baseChain.rpcUrls.default.http[0]),
    [celoChain.id]: http(celoChain.rpcUrls.default.http[0]),
  },
});

export const isCeloChain = (chainId: number) => chainId === celoChain.id;
export const isBaseChain = (chainId: number) => chainId === baseChain.id;

// Deployed contract addresses (provided). Prefer NEXT_PUBLIC_CONTRACT_ADDRESS_* env names but keep legacy fallbacks.
const CELO_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO || process.env.NEXT_PUBLIC_PLAYVERSE_STAKE_CELO || '0xB79F5e1563eEdeC588Cb2252DdE95d1E4bcC68CD';
const BASE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE || process.env.NEXT_PUBLIC_PLAYVERSE_STAKE_BASE || '0x70a99506e3c41288Fbf571C9014333f1eDDd912C';

export const CONTRACT_ADDRESSES: Record<number, string> = {
  [celoChain.id]: CELO_ADDRESS,
  [baseChain.id]: BASE_ADDRESS,
};

export const getContractAddressForChain = (chainId: number) => CONTRACT_ADDRESSES[chainId] || null;

// --- Contract helpers (viem + optional ethers) ---

/**
 * Get a viem Contract instance for the Playverse stake contract on the given chain.
 * @param chainId Chain ID to target
 * @param publicClient A viem PublicClient connected to the desired chain
 */
export const getPlayverseContractViem = (chainId: number, publicClient?: PublicClient) => {
  const address = getContractAddressForChain(chainId);
  if (!address || !publicClient) return null;
  return getContract({ address: address as `0x${string}`, abi: PLAYVERSE_STAKE_ABI as any, client: publicClient as any });
};

/**
 * Build a transaction-ready object for placing a stake (suitable for sendTransaction)
 * @param chainId target chain id
 * @param gameId bytes32 game id as string (0x...)
 * @param stakeValue value as bigint (e.g., BASE_STAKE_WEI or CELO_STAKE_WEI)
 */
export const buildPlaceStakeTx = (chainId: number, gameId: `0x${string}` | string, stakeValue: bigint) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');

  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'placeStake', args: [gameId] });
  return {
    to: address as `0x${string}`,
    data,
    value: stakeValue,
  };
};

/**
 * Build a transaction object to resolve a game on-chain (owner-only)
 * @param chainId target chain id
 * @param gameId bytes32 game id
 * @param playerWon whether the player won (true) or lost (false)
 */
export const buildResolveGameTx = (chainId: number, gameId: `0x${string}` | string, playerWon: boolean) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');

  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'resolveGame', args: [gameId, playerWon] });
  return {
    to: address as `0x${string}`,
    data,
  };
};

/**
 * Build a transaction object for refunding a stake (player calls this after timeout)
 */
export const buildRefundStakeTx = (chainId: number, gameId: `0x${string}` | string) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');

  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'refundStake', args: [gameId] });
  return {
    to: address as `0x${string}`,
    data,
  };
};

/**
 * Build a tx object for owner to withdraw accumulated fees
 */
export const buildWithdrawFeesTx = (chainId: number, to: `0x${string}` | string) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');

  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'withdrawFees', args: [to] });
  return {
    to: address as `0x${string}`,
    data,
  };
};

/**
 * Build a tx object to update fee BPS (owner only)
 */
export const buildSetFeeBpsTx = (chainId: number, feeBps: number) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');
  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'setFeeBps', args: [feeBps] });
  return { to: address as `0x${string}`, data };
};

/**
 * Build a tx object to update timeout (owner only)
 */
export const buildSetTimeoutTx = (chainId: number, timeoutSec: number) => {
  const address = getContractAddressForChain(chainId);
  if (!address) throw new Error('No contract deployed for chain');
  const data = encodeFunctionData({ abi: PLAYVERSE_STAKE_ABI as any, functionName: 'setTimeout', args: [timeoutSec] });
  return { to: address as `0x${string}`, data };
};

/**
 * Read the contract owner address using a viem public client
 */
export const getPlayverseOwner = async (chainId: number, publicClient: PublicClient) => {
  const address = getContractAddressForChain(chainId);
  if (!address || !publicClient) return null;
  const contract = getContract({ address: address as `0x${string}`, abi: PLAYVERSE_STAKE_ABI as any, client: publicClient as any });
  try {
    // owner() is provided by Ownable
    const owner: `0x${string}` = await (contract.read as any).owner();
    return owner;
  } catch (e) {
    return null;
  }
};

/**
 * Wait for a transaction receipt by polling the public client
 */
export const waitForTxReceipt = async (publicClient: PublicClient, txHash: string, timeoutMs = 120_000, pollInterval = 1500) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (receipt && (receipt.status !== undefined && receipt.status !== null)) {
        return receipt;
      }
    } catch (e) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }
  throw new Error('Timed out waiting for transaction confirmation');
};
/**
 * Optional ethers-based helper. Uses dynamic import of `ethers` so frontend won't fail if ethers isn't installed.
 * Returns an ethers Contract connected to the provided provider or signer.
 */
export const getPlayverseContractEthers = async (chainId: number, providerOrSigner: any) => {
  const address = getContractAddressForChain(chainId);
  if (!address) return null;
  try {
    // Dynamic import; if `ethers` is not installed this will throw at runtime.
    // @ts-ignore: allow dynamic import without compile-time dependency
    const ethers = await import('ethers');
    return new ethers.Contract(address, PLAYVERSE_STAKE_ABI as any, providerOrSigner);
  } catch (e) {
    throw new Error('Ethers is not installed. Install ethers to use this helper.');
  }
};

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