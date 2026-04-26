/**
 * Command Handler — all menu actions, inline callbacks, language & settings
 */

import { Context, InlineKeyboard } from 'grammy';
import {
  type Language,
  LANGUAGE_NAMES,
  tr,
  getLanguageKeyboard,
  getMenuKeyboard,
} from '../i18n.js';
import { formatMeetingNotes, escapeHtml } from '../utils/formatters.js';
import { getPocketBase } from '../pbAdmin.js';
import {
  getOrCreateUserAI,
  getMeetingRecord,
  updateActionItemStatus,
} from '../services/meetingService.js';
import {
  getUserLanguage,
  setUserLanguage,
  hasLanguageSet,
} from '../services/userService.js';
import { createLoginToken, TOKEN_TTL_SECONDS } from '../services/loginTokenService.js';
import { MeetingData } from '../types.js';

// ─── Auth helper ───────────────────────────────────────────────────────────────

async function ensureAuth(): Promise<ReturnType<typeof getPocketBase>> {
  const pb = getPocketBase();
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL || '',
      process.env.POCKETBASE_ADMIN_PASSWORD || ''
    );
  }
  return pb;
}

// ─── /start ───────────────────────────────────────────────────────────────────

export async function handleStart(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  try {
    const pb = await ensureAuth();
    await getOrCreateUserAI(pb, from.id, from.username, from.first_name);
  } catch (err) {
    console.error('[start] user create error:', err);
  }

  // Deep-link parameter: /start weblogin → trigger web login flow
  const startArg = ctx.message?.text?.split(' ').slice(1).join(' ').trim();
  if (startArg === 'weblogin') {
    await handleWebLogin(ctx);
    return;
  }

  // First-time user or language not set → language selection
  const languageAlreadySet = await hasLanguageSet(from.id);
  if (!languageAlreadySet) {
    const lang = await getUserLanguage(from.id); // returns default 'en'
    await ctx.reply(tr(lang).choose_language, {
      parse_mode: 'HTML',
      reply_markup: getLanguageKeyboard(),
    });
    return;
  }

  // Returning user — welcome in their language
  const lang = await getUserLanguage(from.id);
  const s = tr(lang);
  await ctx.reply(s.welcome(from.username || from.first_name || 'there'), {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true, one_time_keyboard: false },
  });
}

// ─── Language selection callback ──────────────────────────────────────────────

export async function handleLanguageCallback(ctx: Context & { match: RegExpMatchArray }): Promise<void> {
  const lang = ctx.match[1] as Language;
  const from = ctx.from;
  if (!from) return;

  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }

  await setUserLanguage(from.id, lang);
  const s = tr(lang);

  await ctx.reply(
    s.language_set(LANGUAGE_NAMES[lang]) + '\n\n' + s.welcome(from.username || from.first_name || 'there'),
    {
      parse_mode: 'HTML',
      reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true, one_time_keyboard: false },
    }
  );
}

// ─── ⚙️ Settings ──────────────────────────────────────────────────────────────

export async function handleSettings(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);

  const keyboard = new InlineKeyboard().text(s.change_language, 'settings_change_lang');

  await ctx.reply(s.settings(LANGUAGE_NAMES[lang]), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

export async function handleSettingsChangeLangCallback(ctx: Context): Promise<void> {
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }
  const lang = await getUserLanguage(ctx.from?.id ?? 0);

  try {
    await (ctx as any).editMessageText(tr(lang).choose_language, {
      parse_mode: 'HTML',
      reply_markup: getLanguageKeyboard(),
    });
  } catch {
    await ctx.reply(tr(lang).choose_language, { parse_mode: 'HTML', reply_markup: getLanguageKeyboard() });
  }
}

export async function handleSettingsNoop(ctx: Context): Promise<void> {
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }
}

export async function handleNotifyEnable(ctx: Context): Promise<void> {
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  await ctx.reply('✅ Notifications enabled! You will receive daily digests and deadline reminders.', {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
  });
}

export async function handleNotifyDisable(ctx: Context): Promise<void> {
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  
  await ctx.reply('❌ Notifications disabled.', {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
  });
}

// ─── /help ────────────────────────────────────────────────────────────────────

export async function handleHelp(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);
  await ctx.reply(s.help, {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
  });
}

// ─── /adjust ──────────────────────────────────────────────────────────────────

export async function handleAdjust(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);
  // Show the adjustment keywords relevant to the user's language
  const examples = s.adjustment_keywords.slice(0, 5).map(k => `• "<i>${k}</i>"`).join('\n');
  await ctx.reply(
    `<b>🔧 Adjustment</b>\n\nSend an instruction for the most recent meeting notes, e.g.:\n${examples}`,
    { parse_mode: 'HTML', reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true } }
  );
}

// ─── /status ──────────────────────────────────────────────────────────────────

export async function handleStatus(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  await ctx.reply(
    `<b>📊 Status</b>\n\n✅ Running\n✅ Transcription active\n✅ AI analysis active\n✅ Data storage connected`,
    { parse_mode: 'HTML', reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true } }
  );
}

// ─── /view <id> ───────────────────────────────────────────────────────────────

export async function handleView(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);
  const meetingId = ctx.message?.text?.split(' ').slice(1)[0]?.trim();

  if (!meetingId) {
    await ctx.reply(`Tap <b>${s.btn_my_notes}</b> and use the number buttons to open a meeting.`, { parse_mode: 'HTML' });
    return;
  }

  try {
    const pb = await ensureAuth();
    await sendMeetingDetails(ctx, pb, meetingId, lang);
  } catch (err) {
    await ctx.reply(`❌ ${err instanceof Error ? err.message : 'Unknown error'}`, { parse_mode: 'HTML' });
  }
}

// ─── /done <id> ───────────────────────────────────────────────────────────────

export async function handleDone(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);
  const actionItemId = ctx.message?.text?.split(' ').slice(1)[0]?.trim();

  if (!actionItemId) {
    await ctx.reply(`Tap <b>${s.btn_action_board}</b> and use the ✅ buttons to complete tasks.`, { parse_mode: 'HTML' });
    return;
  }

  try {
    const pb = await ensureAuth();
    await updateActionItemStatus(pb, actionItemId, 'done');
    await ctx.reply(s.action_done, { parse_mode: 'HTML' });
  } catch (err) {
    await ctx.reply(`❌ ${err instanceof Error ? err.message : 'Unknown error'}`, { parse_mode: 'HTML' });
  }
}

// ─── 🛎 Notifications ─────────────────────────────────────────────────────────

export async function handleNotifications(ctx: Context): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text('✅ Enable', 'notify_enable')
    .text('❌ Disable', 'notify_disable');

  await ctx.reply('🔔 <b>Notifications</b>\n\nEnable daily digests and deadline reminders.', {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

// ─── 📋 My Notes ─────────────────────────────────────────────────────────────

export async function handleMyNotes(ctx: Context): Promise<void> {
  await renderNotesPage(ctx, ctx.from?.id, 1, false);
}

export async function handleNotesPageCallback(ctx: Context & { match: RegExpMatchArray }): Promise<void> {
  const page = parseInt(ctx.match[1], 10) || 1;
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }
  await renderNotesPage(ctx, ctx.from?.id, page, true);
}

async function renderNotesPage(
  ctx: Context,
  userId: number | undefined,
  page: number,
  editMessage: boolean
): Promise<void> {
  if (!userId) { await ctx.reply('❌ Please use /start first.'); return; }

  const lang = await getUserLanguage(userId);
  const s = tr(lang);

  try {
    const pb = await ensureAuth();

    const result = await pb.collection('meetings').getList(page, 10, {
      filter: `user_ai.telegram_id = "${userId}"`,
      sort: '-created',
    });

    const meetings = result.items;
    const totalItems: number = result.totalItems;
    const totalPages: number = result.totalPages;

    if (meetings.length === 0 && page === 1) {
      const text = s.no_notes;
      if (editMessage) {
        try { await (ctx as any).editMessageText(text, { parse_mode: 'HTML' }); } catch { await ctx.reply(text, { parse_mode: 'HTML' }); }
      } else {
        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true } });
      }
      return;
    }

    const offset = (page - 1) * 10;
    const lines: string[] = [s.my_notes_header(totalItems, page, totalPages), ''];

    meetings.forEach((m: any, i: number) => {
      const num = offset + i + 1;
      const date = new Date(m.created || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const tag  = escapeHtml(m.project_tag || 'General');
      const preview = (m.summary || '').slice(0, 85);
      const ellipsis = (m.summary || '').length > 85 ? '…' : '';
      lines.push(`<b>${num}.</b> ${tag} — ${date}`);
      lines.push(`<i>${escapeHtml(preview)}${ellipsis}</i>`);
      lines.push('');
    });

    lines.push(s.tap_number);

    // Numbered buttons in rows of 5
    const keyboard = new InlineKeyboard();
    meetings.forEach((m: any, i: number) => {
      keyboard.text(`${offset + i + 1}`, `view_${m.id}`);
      if ((i + 1) % 5 === 0 || i === meetings.length - 1) keyboard.row();
    });

    if (totalPages > 1) {
      if (page > 1) keyboard.text('◀ Prev', `notes_page_${page - 1}`);
      keyboard.text(`${page} / ${totalPages}`, 'notes_noop');
      if (page < totalPages) keyboard.text('Next ▶', `notes_page_${page + 1}`);
    }

    const text = lines.join('\n');
    if (editMessage) {
      try { await (ctx as any).editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }); }
      catch { await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }); }
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  } catch (err) {
    console.error('[myNotes] error:', err);
    const errText = `${s.error_generic}\n\n${err instanceof Error ? err.message : ''}`.trim();
    if (editMessage) {
      try { await (ctx as any).editMessageText(errText, { parse_mode: 'HTML' }); } catch { await ctx.reply(errText, { parse_mode: 'HTML' }); }
    } else {
      await ctx.reply(errText, { parse_mode: 'HTML' });
    }
  }
}

// ─── ⚡ Action Board ──────────────────────────────────────────────────────────

export async function handleActionBoard(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) { await ctx.reply('❌ Please use /start first.'); return; }

  const lang = await getUserLanguage(userId);
  const s = tr(lang);

  try {
    const pb = await ensureAuth();

    const result = await pb.collection('action_items').getList(1, 50, {
      filter: `user_ai.telegram_id = "${userId}" && status != "done"`,
      sort: '-created',
    });

    if (result.items.length === 0) {
      await ctx.reply(s.all_done, {
        parse_mode: 'HTML',
        reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
      });
      return;
    }

    const lines: string[] = [`<b>⚡ Action Board (${result.items.length})</b>`, ''];
    const keyboard = new InlineKeyboard();

    result.items.forEach((item: any, i: number) => {
      const statusEmoji = item.status === 'in_progress' ? '🔄' : '📋';
      const due = item.due_date ? ` · 📅 ${item.due_date}` : '';
      const assignee = item.assignee ? ` · 👤 ${item.assignee}` : '';
      lines.push(`${i + 1}. ${statusEmoji} <b>${escapeHtml(item.description)}</b>${assignee}${due}`);
      lines.push('');

      const preview = (item.description || '').slice(0, 40);
      keyboard.text(`✅ ${preview}${(item.description || '').length > 40 ? '…' : ''}`, `done_${item.id}`).row();
    });

    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML', reply_markup: keyboard });
  } catch (err) {
    console.error('[actionBoard] error:', err);
    await ctx.reply(`${s.error_generic}`, { parse_mode: 'HTML' });
  }
}

// ─── 📤 Send New Meeting ──────────────────────────────────────────────────────

export async function handleSendNewMeeting(ctx: Context): Promise<void> {
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);
  await ctx.reply(s.send_new_meeting, {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
  });
}

// ─── Inline callback: 🗓️ View meeting ────────────────────────────────────────

export async function handleViewCallback(ctx: Context & { match: RegExpMatchArray }): Promise<void> {
  const meetingId = ctx.match[1];
  try { await (ctx as any).answerCallbackQuery(); } catch { /* ignore */ }

  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  try {
    const pb = await ensureAuth();
    await sendMeetingDetails(ctx, pb, meetingId, lang);
  } catch (err) {
    await ctx.reply(`❌ ${err instanceof Error ? err.message : 'Error'}`, { parse_mode: 'HTML' });
  }
}

// ─── Inline callback: ✅ Mark action done ────────────────────────────────────

export async function handleDoneCallback(ctx: Context & { match: RegExpMatchArray }): Promise<void> {
  const actionItemId = ctx.match[1];
  const lang = await getUserLanguage(ctx.from?.id ?? 0);
  const s = tr(lang);

  try {
    const pb = await ensureAuth();
    await updateActionItemStatus(pb, actionItemId, 'done');
    try { await (ctx as any).answerCallbackQuery({ text: s.action_done }); } catch { /* ignore */ }
    try {
      await (ctx as any).editMessageText(s.action_done_refresh, { parse_mode: 'HTML' });
    } catch {
      await ctx.reply(s.action_done, { parse_mode: 'HTML' });
    }
  } catch (err) {
    try { await (ctx as any).answerCallbackQuery({ text: '❌ Failed' }); } catch { /* ignore */ }
    await ctx.reply(`❌ ${err instanceof Error ? err.message : 'Error'}`, { parse_mode: 'HTML' });
  }
}

// ─── Internal: fetch and display full meeting ─────────────────────────────────

async function sendMeetingDetails(
  ctx: Context,
  pb: ReturnType<typeof getPocketBase>,
  meetingId: string,
  lang: Language
): Promise<void> {
  const meeting = await getMeetingRecord(pb, meetingId);
  const aiResult = await pb.collection('action_items').getList(1, 50, {
    filter: `meeting = "${meetingId}"`,
    sort: 'created',
  });

  const meetingData: MeetingData = {
    summary:      meeting.summary,
    decisions:    Array.isArray(meeting.decisions) ? meeting.decisions : [],
    topics:       Array.isArray(meeting.topics) ? meeting.topics : [],
    project_tag:  meeting.project_tag || 'General',
    action_items: aiResult.items.map((item: any) => ({
      task:     item.description || '',
      assignee: item.assignee   || undefined,
      due_date: item.due_date   || undefined,
    })),
  };

  const date = new Date(meeting.created || '').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await ctx.reply(`<b>🗓️ Meeting — ${date}</b>\n` + formatMeetingNotes(meetingData), {
    parse_mode: 'HTML',
    reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
  });
}

// ─── /weblogin — issue a magic link for the web dashboard ────────────────────

export async function handleWebLogin(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const lang = await getUserLanguage(from.id);

  try {
    const pb = await ensureAuth();
    const userAiId = await getOrCreateUserAI(pb, from.id, from.username, from.first_name);
    const token    = await createLoginToken(pb, userAiId);

    const baseUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
    const url     = `${baseUrl.replace(/\/$/, '')}/auth/verify?t=${token}`;
    const minutes = Math.round(TOKEN_TTL_SECONDS / 60);

    const messages: Record<string, { title: string; body: string; warn: string }> = {
      en: {
        title: '🔐 <b>Web Dashboard Login</b>',
        body:  'Tap the link below to sign in. It works <b>once</b> and expires shortly:',
        warn:  `⏱ Expires in ${minutes} minutes.\n🔒 Don't share this link.`,
      },
      ru: {
        title: '🔐 <b>Вход в веб-панель</b>',
        body:  'Нажмите на ссылку ниже, чтобы войти. Она работает <b>один раз</b> и скоро истечёт:',
        warn:  `⏱ Истекает через ${minutes} минут.\n🔒 Не делитесь ссылкой.`,
      },
      uz: {
        title: '🔐 <b>Veb-panelga kirish</b>',
        body:  'Kirish uchun quyidagi havolani bosing. U <b>bir marta</b> ishlaydi va tez orada tugaydi:',
        warn:  `⏱ ${minutes} daqiqada tugaydi.\n🔒 Havolani ulashmang.`,
      },
    };
    const m = messages[lang] || messages.en;

    const isPublicUrl = url.startsWith('https://');

    if (isPublicUrl) {
      // Production: inline button works for HTTPS public URLs
      const keyboard = new InlineKeyboard().url('🌐 Sign in to dashboard', url);
      await ctx.reply(`${m.title}\n\n${m.body}\n\n${m.warn}`, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
        link_preview_options: { is_disabled: true },
      });
    } else {
      // Development (localhost): Telegram rejects non-HTTPS in inline buttons.
      // Show the token separately so user can paste it in the login page.
      await ctx.reply(
        `${m.title}\n\n${m.body}\n\n` +
        `<b>Your login code:</b>\n<code>${token}</code>\n\n` +
        `Paste this code on the login page, or open:\n${url}\n\n${m.warn}`,
        { parse_mode: 'HTML', link_preview_options: { is_disabled: true } }
      );
    }
  } catch (err: any) {
    const detail = err?.message ?? String(err);
    console.error('[weblogin] ❌ error:', detail);
    await ctx.reply(
      `❌ <b>Login link failed</b>\n\n<code>${detail.slice(0, 200)}</code>`,
      { parse_mode: 'HTML' }
    );
  }
}
