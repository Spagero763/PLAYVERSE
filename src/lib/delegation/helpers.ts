// Delegation helpers removed. Provide minimal no-op implementations to satisfy imports.
export const publicClient = null as unknown as any;

export function generateNonceBytes32(): `0x${string}` {
  return `0x${'0'.repeat(64)}` as `0x${string}`;
}

export function buildDelegationMessage(params: any) {
  return { ...params, nonce: params.nonce || generateNonceBytes32() };
}

export async function verifyDelegationSignature(): Promise<boolean> {
  return false;
}

export function isDelegationActive(): boolean {
  return false;
}

export function isTargetAllowed(): boolean {
  return false;
}
