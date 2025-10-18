import { NextRequest, NextResponse } from 'next/server';
import { getYieldStrategy, type YieldOptimizerInput } from '@/ai/flows/yield-optimizer';

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as YieldOptimizerInput;
    const result = await getYieldStrategy(input);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
