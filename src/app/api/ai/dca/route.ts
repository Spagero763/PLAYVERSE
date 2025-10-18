import { NextRequest, NextResponse } from 'next/server';

interface DcaConfig {
  owner: `0x${string}`;
  delegate: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountPerInterval: string; // human readable
  intervalSec: number;
}

export async function POST(req: NextRequest) {
  try {
    const cfg = (await req.json()) as DcaConfig;
    // In a full integration, store this schedule and trigger execution when interval elapses.
    return NextResponse.json({ ok: true, scheduled: cfg });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
