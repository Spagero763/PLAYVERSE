import { NextResponse } from 'next/server';
import { recoverTypedSignature_v4 } from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body: {chainId, domainName, verifyingContract, message, signature}
    const { message, signature, domainName } = body as any;
    if (!message || !signature) return NextResponse.json({ error: 'missing' }, { status: 400 });

    // Reconstruct typed data similar to client
    const typedData = {
      types: {
        EIP712Domain: [],
        Delegation: [
          { name: 'owner', type: 'address' },
          { name: 'delegate', type: 'address' },
          { name: 'allowedTargets', type: 'address[]' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      },
      primaryType: 'Delegation',
      domain: { name: domainName || 'Playverse Delegation' },
      message,
    } as any;

    // eth-sig-util expects the signature and typedData JSON
    let signer: string;
    try {
      const recovered = recoverTypedSignature_v4({ data: typedData, sig: signature });
      signer = ethUtil.toChecksumAddress(recovered);
    } catch (err) {
      return NextResponse.json({ error: 'invalid_signature', detail: String(err) }, { status: 400 });
    }

    // Basic checks
    if (signer.toLowerCase() !== message.owner.toLowerCase()) {
      return NextResponse.json({ error: 'signer_mismatch', signer, owner: message.owner }, { status: 400 });
    }

    // Check time validity
    const now = Math.floor(Date.now() / 1000);
    if (message.startTime > now || message.endTime < now) {
      return NextResponse.json({ error: 'out_of_time_range', now, start: message.startTime, end: message.endTime }, { status: 400 });
    }

    // Simulate execution: return fake tx hash
    const fakeHash = '0x' + ethUtil.keccak256(Buffer.from(JSON.stringify(message))).toString('hex').slice(0, 60);
    return NextResponse.json({ ok: true, txHash: fakeHash });
  } catch (err: any) {
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}
