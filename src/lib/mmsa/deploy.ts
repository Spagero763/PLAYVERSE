import { createPublicClient } from 'viem';
import {
  EntryPoint,
  SimpleFactory,
  DelegationManager,
  HybridDeleGator,
  MultiSigDeleGator,
  EIP7702StatelessDeleGator,
  SCL_RIP7212,
} from '@metamask/delegation-abis';

export async function deployToolkit(walletClient: any) {
  const chainId = await walletClient.getChainId?.();
  const chain = {
    id: chainId,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: [] } },
  } as const;
  const publicClient = createPublicClient({
    chain,
    // Use the same transport/provider as the wallet to avoid chain mismatch
    transport: (walletClient as any).transport,
  });
  // Ensure account present
  let [accountAddress] = await walletClient.getAddresses();
  if (!accountAddress) {
    const req = await walletClient.requestAddresses();
    accountAddress = req[0];
  }

  // Deploy EntryPoint
  const epHash = await walletClient.deployContract({
    abi: EntryPoint.abi,
    bytecode: EntryPoint.bytecode,
    args: [],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const epReceipt = await publicClient.waitForTransactionReceipt({ hash: epHash });
  const entryPoint = epReceipt.contractAddress;
  if (!entryPoint) throw new Error('EntryPoint deploy failed');

  // Deploy SimpleFactory
  const sfHash = await walletClient.deployContract({
    abi: SimpleFactory.abi,
    bytecode: SimpleFactory.bytecode,
    args: [],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const sfReceipt = await publicClient.waitForTransactionReceipt({ hash: sfHash });
  const simpleFactory = sfReceipt.contractAddress;
  if (!simpleFactory) throw new Error('SimpleFactory deploy failed');

  // Deploy DelegationManager
  const dmHash = await walletClient.deployContract({
    abi: DelegationManager.abi,
    bytecode: DelegationManager.bytecode,
    args: [accountAddress],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const dmReceipt = await publicClient.waitForTransactionReceipt({ hash: dmHash });
  const delegationManager = dmReceipt.contractAddress;
  if (!delegationManager) throw new Error('DelegationManager deploy failed');

  // Deploy library SCL_RIP7212 (required by HybridDeleGator impl)
  const sclHash = await walletClient.deployContract({
    abi: SCL_RIP7212.abi,
    bytecode: SCL_RIP7212.bytecode,
    args: [],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const sclReceipt = await publicClient.waitForTransactionReceipt({ hash: sclHash });
  const sclRip7212 = sclReceipt.contractAddress;
  if (!sclRip7212) throw new Error('SCL_RIP7212 deploy failed');

  // Link library into HybridDeleGator bytecode
  const linkedHybrid = {
    ...HybridDeleGator,
    bytecode: (HybridDeleGator as any).bytecode.replace(/__\$b8f96b288d4d0429e38b8ed50fd423070f\$__/gu, (sclRip7212 as string).slice(2)),
  } as typeof HybridDeleGator;

  // Deploy implementations
  const hybridHash = await walletClient.deployContract({
    abi: linkedHybrid.abi,
    bytecode: (linkedHybrid as any).bytecode,
    args: [delegationManager, entryPoint],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const hybridReceipt = await publicClient.waitForTransactionReceipt({ hash: hybridHash });
  const hybridImpl = hybridReceipt.contractAddress;
  if (!hybridImpl) throw new Error('HybridDeleGatorImpl deploy failed');

  const msHash = await walletClient.deployContract({
    abi: MultiSigDeleGator.abi,
    bytecode: MultiSigDeleGator.bytecode,
    args: [delegationManager, entryPoint],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const msReceipt = await publicClient.waitForTransactionReceipt({ hash: msHash });
  const multisigImpl = msReceipt.contractAddress;
  if (!multisigImpl) throw new Error('MultiSigDeleGatorImpl deploy failed');

  const s7702Hash = await walletClient.deployContract({
    abi: EIP7702StatelessDeleGator.abi,
    bytecode: EIP7702StatelessDeleGator.bytecode,
    args: [delegationManager, entryPoint],
    account: accountAddress,
    chain: publicClient.chain,
  });
  const s7702Receipt = await publicClient.waitForTransactionReceipt({ hash: s7702Hash });
  const s7702Impl = s7702Receipt.contractAddress;
  if (!s7702Impl) throw new Error('EIP7702StatelessDeleGatorImpl deploy failed');

  return {
    entryPoint,
    simpleFactory,
    delegationManager,
    hybridImpl,
    multisigImpl,
    s7702Impl,
    sclRip7212,
  };
}
