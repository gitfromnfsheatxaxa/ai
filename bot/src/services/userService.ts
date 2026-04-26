/**
 * User Service — language preference storage.
 *
 * Language is persisted in user_ai.language (PocketBase).
 * An in-memory Map caches values so every message doesn't need a DB lookup.
 * The schema migration (adding the language field) runs once at startup.
 */

import { type Language, DEFAULT_LANGUAGE } from '../i18n.js';
import { getPocketBase } from '../pbAdmin.js';

// ─── In-memory cache ───────────────────────────────────────────────────────────
const langCache = new Map<number, Language>();

// ─── Schema migration ──────────────────────────────────────────────────────────

/**
 * Ensure the `language` text field exists in the `user_ai` collection.
 * Safe to call multiple times — no-ops if the field already exists.
 */
export async function ensureLanguageField(): Promise<void> {
  try {
    const pb = getPocketBase();
    const col = await pb.collections.getOne('user_ai');
    const fields: any[] = col.fields || col.schema || [];

    if (fields.some((f: any) => f.name === 'language')) return;

    await pb.collections.update('user_ai', {
      ...col,
      fields: [
        ...fields,
        { name: 'language', type: 'text', required: false },
      ],
    });
    console.log('[schema] Added `language` field to user_ai');
  } catch (err: any) {
    // Non-fatal — in-memory cache is the fallback
    console.warn('[schema] Could not add language field:', err.message?.slice(0, 80));
  }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getUserLanguage(telegramUserId: number): Promise<Language> {
  // 1. Check memory cache first
  const cached = langCache.get(telegramUserId);
  if (cached) return cached;

  // 2. Look up in PocketBase
  try {
    const pb = getPocketBase();
    const result = await pb.collection('user_ai').getList(1, 1, {
      filter: `telegram_id = "${telegramUserId}"`,
    });
    const user = result.items[0];
    if (user?.language) {
      const lang = user.language as Language;
      langCache.set(telegramUserId, lang);
      return lang;
    }
  } catch {
    // Ignore — return default
  }

  return DEFAULT_LANGUAGE;
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export async function setUserLanguage(telegramUserId: number, lang: Language): Promise<void> {
  langCache.set(telegramUserId, lang);

  try {
    const pb = getPocketBase();
    const result = await pb.collection('user_ai').getList(1, 1, {
      filter: `telegram_id = "${telegramUserId}"`,
    });
    const user = result.items[0];
    if (user) {
      await pb.collection('user_ai').update(user.id, { language: lang });
    }
  } catch (err: any) {
    console.warn('[userService] Could not persist language:', err.message?.slice(0, 80));
    // In-memory cache still holds the value for this session
  }
}

// ─── Check if language is already configured ─────────────────────────────────

export async function hasLanguageSet(telegramUserId: number): Promise<boolean> {
  if (langCache.has(telegramUserId)) return true;

  try {
    const pb = getPocketBase();
    const result = await pb.collection('user_ai').getList(1, 1, {
      filter: `telegram_id = "${telegramUserId}"`,
    });
    const user = result.items[0];
    if (user?.language) {
      langCache.set(telegramUserId, user.language as Language);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
