import { createWalletClient, custom } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export const account = privateKeyToAccount(generatePrivateKey());

export const walletClient = typeof window !== 'undefined'
  ? createWalletClient({ transport: custom((window as any).ethereum) })
  : undefined;
