import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://34.56.67.158:8090';
const PB_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL    || '';
const PB_PASS  = process.env.POCKETBASE_ADMIN_PASSWORD  || '';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t');
  if (!token) {
    return NextResponse.json({ error: 'Missing token in URL.' }, { status: 400 });
  }

  if (!PB_EMAIL || !PB_PASS) {
    console.error('[auth/verify] Admin credentials not configured.');
    return NextResponse.json(
      { error: 'Server not configured — contact the administrator.' },
      { status: 500 }
    );
  }

  const pb = new PocketBase(PB_URL);

  // 1. Authenticate as admin
  try {
    await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);
  } catch (err: any) {
    console.error('[auth/verify] Admin auth failed:', err?.message);
    return NextResponse.json(
      { error: 'Server authentication failed — check admin credentials.' },
      { status: 500 }
    );
  }

  // 2. Look up the token record
  let tokenRecord: any;
  try {
    tokenRecord = await pb
      .collection('login_tokens')
      .getFirstListItem(`token="${token}"`);
  } catch (err: any) {
    console.error('[auth/verify] token lookup failed — status:', err?.status, 'message:', err?.message);
    if (err?.status === 404 || err?.message?.toLowerCase().includes('not found')) {
      return NextResponse.json(
        {
          error:
            'Login system not initialised yet. ' +
            'Please restart the Telegram bot, then send /weblogin again.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `Invalid or expired link. (${err?.status ?? 'network'}: ${err?.message ?? 'unknown'})` },
      { status: 401 }
    );
  }

  // 3. Validate
  if (tokenRecord.used) {
    return NextResponse.json(
      { error: 'This link has already been used. Send /weblogin in the bot for a new one.' },
      { status: 401 }
    );
  }
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'This link has expired (10-minute window). Send /weblogin for a fresh one.' },
      { status: 401 }
    );
  }

  // user_ai_id is stored as plain text (the PocketBase record ID)
  const userAiId: string = tokenRecord.user_ai_id;

  // 4. Mark used immediately
  try {
    await pb.collection('login_tokens').update(tokenRecord.id, { used: true });
  } catch {
    // Non-fatal — continue
  }

  // 5. Impersonate — get a real user session without knowing the password
  try {
    const userClient = await (pb.collection('user_ai') as any)
      .impersonate(userAiId, 60 * 60 * 24 * 30); // 30-day session

    const sessionToken = userClient.authStore.token;
    const record =
      (userClient.authStore as any).record ??
      (userClient.authStore as any).model ??
      null;

    return NextResponse.json({ token: sessionToken, record });
  } catch (err: any) {
    console.error('[auth/verify] impersonate failed:', err?.message);
    return NextResponse.json(
      { error: 'Could not create session. Please try again.' },
      { status: 500 }
    );
  }
}
