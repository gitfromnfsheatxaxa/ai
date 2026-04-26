/**
 * One-time setup script: configures PocketBase API rules so the web
 * dashboard can read data with user-auth (impersonated tokens).
 *
 * Run once after deploying:
 *   cd bot && npx tsx src/scripts/setup-pb-rules.ts
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

async function main() {
  console.log('Authenticating as admin…');
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!,
  );
  console.log('✓ Admin auth');

  // Rule: user can only see records that belong to them
  const USER_RULE = '@request.auth.id != "" && user_ai = @request.auth.id';
  const OPEN_READ  = '';          // no restriction — public read (for meeting detail by ID)
  const ADMIN_ONLY = '@request.auth.collectionName = "_superusers"';

  const rules: Record<string, { listRule?: string; viewRule?: string; createRule?: string; updateRule?: string; deleteRule?: string }> = {
    meetings: {
      listRule:   USER_RULE,
      viewRule:   USER_RULE,
      createRule: ADMIN_ONLY,   // only bot (admin) creates meetings
      updateRule: ADMIN_ONLY,
      deleteRule: ADMIN_ONLY,
    },
    action_items: {
      listRule:   USER_RULE,
      viewRule:   USER_RULE,
      createRule: ADMIN_ONLY,
      updateRule: USER_RULE,   // allow user to mark done from web
      deleteRule: ADMIN_ONLY,
    },
    login_tokens: {
      listRule:   ADMIN_ONLY,
      viewRule:   ADMIN_ONLY,
      createRule: ADMIN_ONLY,
      updateRule: ADMIN_ONLY,
      deleteRule: ADMIN_ONLY,
    },
  };

  for (const [name, r] of Object.entries(rules)) {
    try {
      const col = await pb.collections.getOne(name);
      await pb.collections.update(col.id, r);
      console.log(`✓ Set rules for "${name}"`);
    } catch (err: any) {
      console.warn(`⚠ Could not update "${name}": ${err.message?.slice(0, 120)}`);
    }
  }

  console.log('\nDone. Restart the bot if it is running.');
}

main().catch(e => { console.error(e); process.exit(1); });
