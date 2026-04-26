import { randomUUID } from 'crypto';
import PocketBase from 'pocketbase';

const TOKEN_TTL_SECONDS = 10 * 60; // 10 minutes

/**
 * Ensure `login_tokens` collection exists.
 * Uses only simple field types (text, bool) to avoid SDK/version compatibility
 * issues with relation fields and index syntax.
 */
export async function ensureLoginTokensCollection(pb: PocketBase): Promise<void> {
  // Already exists?
  try {
    await pb.collections.getOne('login_tokens');
    console.log('[schema] login_tokens collection already exists');
    return;
  } catch (err: any) {
    if (err?.status !== 404) {
      console.error('[schema] login_tokens check failed:', err?.message);
      return;
    }
  }

  // Create with simple text fields — no relations, no custom indexes
  try {
    await pb.collections.create({
      name:   'login_tokens',
      type:   'base',
      fields: [
        { name: 'token',       type: 'text', required: true  }, // UUID string
        { name: 'user_ai_id',  type: 'text', required: true  }, // PocketBase record ID (text)
        { name: 'expires_at',  type: 'text', required: true  }, // ISO date string
        { name: 'used',        type: 'bool'                  },
      ],
    });
    console.log('[schema] ✅ Created login_tokens collection');
  } catch (err: any) {
    console.error('[schema] ❌ Failed to create login_tokens:', err?.message ?? err);
    console.error('[schema] Create it manually in PocketBase admin UI with fields:');
    console.error('[schema]   token (text), user_ai_id (text), expires_at (text), used (bool)');
  }
}

/**
 * Creates a one-time login token for the given user_ai record ID.
 * Returns the raw UUID token string that goes into the magic link.
 */
export async function createLoginToken(pb: PocketBase, userAiId: string): Promise<string> {
  const token     = randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();

  await pb.collection('login_tokens').create({
    token,
    user_ai_id:  userAiId,
    expires_at:  expiresAt,
    used:        false,
  });

  return token;
}

export { TOKEN_TTL_SECONDS };
