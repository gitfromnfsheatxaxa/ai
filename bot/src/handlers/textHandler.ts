/**
 * Text Handler - Handles direct text input (transcripts pasted by user)
 */

import { Context } from 'grammy';
import { BotContext, ProcessingStatus } from '../types.js';
import { analyzeMeeting } from '../aiService.js';
import { createMeetingRecord, getOrCreateUserAI } from '../services/meetingService.js';
import { getPocketBase } from '../pbAdmin.js';
import { getMenuKeyboard, tr } from '../i18n.js';
import { getUserLanguage } from '../services/userService.js';
import {
  formatMeetingNotes,
  formatErrorMessage,
} from '../utils/formatters.js';

// Store active processing contexts
const activeContexts = new Map<number, BotContext>();

/**
 * Handle text messages that appear to be transcripts
 */
export async function handleText(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('❌ Unable to identify user. Please restart the bot with /start');
    return;
  }

  const text = ctx.message?.text;
  if (!text) {
    return;
  }

  // Skip commands (start with /)
  if (text.startsWith('/')) {
    return;
  }

  // Check if user has active context (processing another message)
  if (activeContexts.has(userId)) {
    await ctx.reply('⏳ Please wait for the current processing to complete...');
    return;
  }

  try {
    const lang = await getUserLanguage(userId);
    const s = tr(lang);

    const statusMsg = await ctx.reply(`⏳ ${s.initializing}`);
    const statusMessageId = statusMsg.message_id;

    const context: BotContext = {
      statusMessageId,
      status: ProcessingStatus.ANALYZING,
      startTime: Date.now(),
      transcript: text,
    };
    activeContexts.set(userId, context);

    await updateStatusMessage(ctx, statusMessageId, s.analyzing);

    const meetingData = await analyzeMeeting(text, undefined, lang);

    context.meetingData = meetingData;
    context.status = ProcessingStatus.SAVING;
    await updateStatusMessage(ctx, statusMessageId, s.saving);

    const pb = getPocketBase();
    const userAiId = await getOrCreateUserAI(pb, userId, ctx.from?.username, ctx.from?.first_name);

    const { meetingId, actionItemIds } = await createMeetingRecord(pb, userAiId, text, meetingData);

    context.meetingRecordId = meetingId;
    context.status = ProcessingStatus.COMPLETED;

    await ctx.reply(formatMeetingNotes(meetingData) + '\n\n---\n\n' + s.notes_saved(actionItemIds.length), {
      parse_mode: 'HTML',
      reply_markup: { keyboard: getMenuKeyboard(lang), resize_keyboard: true },
    });

    // Delete status message
    try {
      if (ctx.chat?.id) {
        await ctx.api.deleteMessage(ctx.chat.id, statusMessageId);
      }
    } catch {
      // Ignore if message already deleted
    }

    // Clear context
    activeContexts.delete(userId);

  } catch (error) {
    console.error('Error processing text:', error);
    const statusMessageId = activeContexts.get(userId)?.statusMessageId;
    const chatId = ctx.chat?.id;
    
    if (statusMessageId && chatId) {
      await updateStatusMessage(ctx, statusMessageId, formatErrorMessage(error));
      setTimeout(() => {
        ctx.api.deleteMessage(chatId, statusMessageId).catch(() => {});
      }, 5000);
    } else {
      await ctx.reply(formatErrorMessage(error), { parse_mode: 'HTML' });
    }

    activeContexts.delete(userId);
  }
}

/**
 * Update the status message
 */
async function updateStatusMessage(
  ctx: Context,
  messageId: number,
  text: string
): Promise<void> {
  try {
    const chatId = ctx.chat?.id;
    if (chatId) {
      await ctx.api.editMessageText(chatId, messageId, text, {
        parse_mode: 'HTML',
      });
    }
  } catch (error) {
    console.error('Failed to update status message:', error);
  }
}

/**
 * Get active context for a user
 */
export function getActiveContext(userId: number): BotContext | undefined {
  return activeContexts.get(userId);
}

/**
 * Clear active context for a user
 */
export function clearActiveContext(userId: number): void {
  activeContexts.delete(userId);
}