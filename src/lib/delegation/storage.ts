import type { Address } from 'viem';
import type { DelegationPacket } from './types';

// In-memory store for demo; swap to DB in prod
const ownerToDelegations = new Map<Address, DelegationPacket[]>();

export function listDelegations(owner: Address) {
  return ownerToDelegations.get(owner) || [];
}

export function saveDelegation(packet: DelegationPacket) {
  const list = ownerToDelegations.get(packet.message.owner) || [];
  const existingIndex = list.findIndex(
    d => d.message.nonce === packet.message.nonce && d.message.delegate === packet.message.delegate
  );
  if (existingIndex >= 0) {
    list[existingIndex] = packet;
  } else {
    list.push(packet);
  }
  ownerToDelegations.set(packet.message.owner, list);
}

export function revokeDelegation(owner: Address, nonce: string) {
  const list = ownerToDelegations.get(owner) || [];
  for (const d of list) {
    if (d.message.nonce === nonce) {
      d.revoked = true;
    }
  }
  ownerToDelegations.set(owner, list);
}
