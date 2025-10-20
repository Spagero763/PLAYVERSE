import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: false, error: 'DELEGATIONS_DISABLED' }, { status: 404 });
}
