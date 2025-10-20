declare module 'eth-sig-util' {
  export function recoverTypedSignature_v4(opts: { data: any; sig: string }): string;
}

declare module 'ethereumjs-util' {
  export function keccak256(input: Buffer | string): Buffer;
  export function toChecksumAddress(address: string): string;
  export function bufferToHex(buf: Buffer): string;
}

declare module '@metamask/delegation-toolkit' {
  export const DelegationToolkit: any;
  export default DelegationToolkit;
}

declare module '@metamask/delegation-abis' {
  const anything: any;
  export default anything;
}
