import { createPublicClient, http, verifyTypedData, type Address, type Hex, type TypedDataDomain } from 'viem';
import { MMSA } from './env';
import type { DelegationMessage, DelegationPacket } from './types';
import { delegationTypes, toTypedMessage } from './typedData';

export const publicClient = createPublicClient({
  chain: {
    id: MMSA.CHAIN_ID,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: [MMSA.RPC_URL] } },
  },
  transport: http(MMSA.RPC_URL),
});

export function generateNonceBytes32(): Hex {
  const bytes = new Uint8Array(32);
  // browser & node compatible crypto
  if (typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function') {
    (crypto as any).getRandomValues(bytes);
  } else {
    const nodeCrypto = require('crypto');
    const buf: Buffer = nodeCrypto.randomBytes(32);
    buf.copy(Buffer.from(bytes.buffer));
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return (`0x${hex}`) as Hex;
}

export function buildDelegationMessage(params: Omit<DelegationMessage, 'nonce'> & { nonce?: Hex }): DelegationMessage {
  const { owner, delegate, allowedTargets, startTime, endTime, nonce } = params;
  return {
    owner,
    delegate,
    allowedTargets,
    startTime,
    endTime,
    nonce: (nonce || generateNonceBytes32()),
  } as DelegationMessage;
}

export async function verifyDelegationSignature(packet: DelegationPacket): Promise<boolean> {
  const domain: TypedDataDomain = {
    name: packet.domainName || MMSA.DOMAIN_NAME,
    version: '1',
    chainId: BigInt(packet.chainId || MMSA.CHAIN_ID),
    verifyingContract: packet.verifyingContract || MMSA.VERIFYING_CONTRACT,
  } as TypedDataDomain;

  const ok = await verifyTypedData({
    address: packet.message.owner,
    domain,
    types: delegationTypes,
    primaryType: 'Delegation',
    message: toTypedMessage(packet.message),
    signature: packet.signature,
  });
  return ok;
}

export function isDelegationActive(packet: DelegationPacket, nowSec = Math.floor(Date.now() / 1000)) {
  const { startTime, endTime } = packet.message;
  return !packet.revoked && nowSec >= startTime && nowSec <= endTime;
}

export function isTargetAllowed(packet: DelegationPacket, target: Address) {
  return packet.message.allowedTargets.map(t => t.toLowerCase()).includes(target.toLowerCase() as Address);
}
