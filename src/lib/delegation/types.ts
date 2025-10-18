import { Address } from 'viem';

export type UnixTimestamp = number; // seconds since epoch

export interface DelegationMessage {
  owner: Address; // wallet that grants permissions
  delegate: Address; // agent that can act on behalf of owner
  allowedTargets: Address[]; // contracts this delegation permits calling
  startTime: UnixTimestamp; // when the delegation becomes valid
  endTime: UnixTimestamp; // when the delegation expires
  nonce: `0x${string}`; // bytes32 unique id for replay protection
}

export interface DelegationPacket {
  chainId: number;
  domainName?: string; // reserved for MMSA domain name when integrated
  verifyingContract?: Address; // reserved for MMSA verifying contract when integrated
  message: DelegationMessage;
  signature: `0x${string}`;
  revoked?: boolean;
}

export interface DelegatedCall {
  from: Address; // expected to match message.delegate
  to: Address; // target contract address
  data?: `0x${string}`; // calldata
  value?: bigint; // optional ETH value
}
