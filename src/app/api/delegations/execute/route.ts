import { NextRequest, NextResponse } from 'next/server';
import { isDelegationActive, isTargetAllowed } from '@/lib/delegation/helpers';
import { listDelegations } from '@/lib/delegation/storage';
import type { Address } from 'viem';

interface ExecBody {
  owner: Address;
  delegate: Address;
  to: Address;
  data?: `0x${string}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecBody;
    const delegations = listDelegations(body.owner);
    const active = delegations.find(
      (d) => d.message.delegate.toLowerCase() === body.delegate.toLowerCase() && isDelegationActive(d)
    );
    if (!active) {
      return NextResponse.json({ ok: false, error: 'NO_ACTIVE_DELEGATION' }, { status: 403 });
    }
    if (!isTargetAllowed(active, body.to)) {
      return NextResponse.json({ ok: false, error: 'TARGET_NOT_ALLOWED' }, { status: 403 });
    }
    // Demo: do not actually send tx; just echo intent.
    return NextResponse.json({ ok: true, intent: { from: body.delegate, to: body.to, data: body.data } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
