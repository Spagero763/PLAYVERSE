import type { Address, Hex } from 'viem';
import type { DelegationMessage } from './types';

// EIP-712 types aligning with Delegation Toolkit style structures
export const delegationTypes = {
  Delegation: [
    { name: 'owner', type: 'address' },
    { name: 'delegate', type: 'address' },
    { name: 'allowedTargets', type: 'address[]' },
    { name: 'startTime', type: 'uint256' },
    { name: 'endTime', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

export function toTypedMessage(m: DelegationMessage) {
  return {
    owner: m.owner,
    delegate: m.delegate,
    allowedTargets: m.allowedTargets,
    startTime: BigInt(m.startTime),
    endTime: BigInt(m.endTime),
    nonce: m.nonce as Hex,
  } as const;
}
