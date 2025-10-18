import { NextRequest, NextResponse } from 'next/server';
import { verifyDelegationSignature, isDelegationActive } from '@/lib/delegation/helpers';
import { saveDelegation } from '@/lib/delegation/storage';
import type { DelegationPacket } from '@/lib/delegation/types';

export async function POST(req: NextRequest) {
  try {
    const packet = (await req.json()) as DelegationPacket;
    const isValid = await verifyDelegationSignature(packet);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'INVALID_SIGNATURE' }, { status: 400 });
    }
    if (!isDelegationActive(packet)) {
      return NextResponse.json({ ok: false, error: 'DELEGATION_INACTIVE' }, { status: 400 });
    }
    saveDelegation(packet);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
