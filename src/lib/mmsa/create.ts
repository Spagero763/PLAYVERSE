import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';
import { publicClient } from './client';
import { account, walletClient } from './signers';
import { getEnvironmentOverride } from './environment';

const environment = getEnvironmentOverride();

export async function createHybridWithAccount() {
  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: '0x',
    signer: { account },
    environment,
  });
}

export async function createHybridWithWalletClient() {
  if (!walletClient) throw new Error('No wallet client');
  const addresses = await walletClient.getAddresses();
  const owner = addresses[0];
  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner, [], [], []],
    deploySalt: '0x',
    signer: { walletClient: (walletClient as any) },
    environment,
  });
}

export async function createStateless7702WithAccount(address: `0x${string}`) {
  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address,
    signer: { account },
    environment,
  });
}

export async function createStateless7702WithWalletClient() {
  if (!walletClient) throw new Error('No wallet client');
  const addresses = await walletClient.getAddresses();
  const address = addresses[0];
  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address,
    signer: { walletClient: (walletClient as any) },
    environment,
  });
}
