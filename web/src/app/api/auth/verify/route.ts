import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://34.56.67.158:8090';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t');

  if (!token) {
    return NextResponse.json({ error: 'Missing token in URL.' }, { status: 400 });
  }

  const pb = new PocketBase(PB_URL);

  let tokenRecord: any;

  try {
    tokenRecord = await pb
      .collection('login_tokens')
      .getFirstListItem(`token="${token}"`);
  } catch (err: any) {
    console.error('[auth/verify] token lookup failed:', err);

    return NextResponse.json(
      { error: 'Invalid or expired link.' },
      { status: 401 }
    );
  }

  if (tokenRecord.used) {
    return NextResponse.json(
      { error: 'This link has already been used.' },
      { status: 401 }
    );
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'This link has expired.' },
      { status: 401 }
    );
  }

  const userAiId = tokenRecord.user_ai_id;

  try {
    await pb.collection('login_tokens').update(tokenRecord.id, { used: true });
  } catch (err) {
    console.log('Warning: could not mark token as used', err);
  }

  try {
    const userClient = await (pb.collection('user_ai') as any)
      .impersonate(userAiId, 60 * 60 * 24 * 30);

    return NextResponse.json({
      token: userClient.authStore.token,
      record: userClient.authStore.record
    });

  } catch (err: any) {
    console.error('[auth/verify] impersonate failed:', err);
    return NextResponse.json(
      { error: 'Could not create session.' },
      { status: 500 }
    );
  }
}