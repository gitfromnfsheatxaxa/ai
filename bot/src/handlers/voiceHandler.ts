/**
 * Voice Handler - Handles voice messages and audio files
 */

import { Context } from 'grammy';
import { BotContext, ProcessingStatus } from '../types.js';
import { downloadFileFromTelegram } from '../utils/helpers.js';
import { transcribeAudio, analyzeMeeting } from '../aiService.js';
import { uploadAudioFile } from '../services/storageService.js';
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
 * Handle voice messages
 */
export async function handleVoice(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('❌ Unable to identify user. Please restart the bot with /start');
    return;
  }

  const voice = ctx.message?.voice;
  if (!voice) {
    await ctx.reply('❌ No voice message found');
    return;
  }

  try {
    const lang = await getUserLanguage(userId);
    const s = tr(lang);

    // Create status message
    const statusMsg = await ctx.reply(`⏳ ${s.initializing}`);
    const statusMessageId = statusMsg.message_id;

    const context: BotContext = {
      statusMessageId,
      status: ProcessingStatus.DOWNLOADING,
      startTime: Date.now(),
    };
    activeContexts.set(userId, context);

    context.status = ProcessingStatus.DOWNLOADING;
    await updateStatusMessage(ctx, statusMessageId, s.downloading);

    const fileBuffer = await downloadFileFromTelegram(voice.file_id, process.env.TELEGRAM_BOT_TOKEN || '');

    context.status = ProcessingStatus.TRANSCRIBING;
    await updateStatusMessage(ctx, statusMessageId, s.transcribing);

    const transcript = await transcribeAudio(fileBuffer, 'audio.ogg', voice.mime_type || 'audio/ogg');

    context.transcript = transcript;
    context.status = ProcessingStatus.ANALYZING;
    await updateStatusMessage(ctx, statusMessageId, s.analyzing);

    const meetingData = await analyzeMeeting(transcript, undefined, lang);

    context.meetingData = meetingData;
    context.status = ProcessingStatus.SAVING;
    await updateStatusMessage(ctx, statusMessageId, s.saving);

    const pb = getPocketBase();
    const userAiId = await getOrCreateUserAI(pb, userId, ctx.from?.username, ctx.from?.first_name);

    const { meetingId, actionItemIds } = await createMeetingRecord(pb, userAiId, transcript, meetingData);

    try {
      const fileName = `voice_${userId}_${Date.now()}.ogg`;
      await uploadAudioFile(pb, fileName, fileBuffer, meetingId);
    } catch (uploadError) {
      console.error('Audio upload failed (notes still saved):', uploadError);
    }

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
    console.error('Error processing voice message:', error);
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
 * Handle audio files (not voice messages)
 */
export async function handleAudio(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('❌ Unable to identify user. Please restart the bot with /start');
    return;
  }

  const audio = ctx.message?.audio;
  if (!audio) {
    await ctx.reply('❌ No audio file found');
    return;
  }

  try {
    const lang = await getUserLanguage(userId);
    const s = tr(lang);

    const statusMsg = await ctx.reply(`⏳ ${s.initializing}`);
    const statusMessageId = statusMsg.message_id;

    const context: BotContext = {
      statusMessageId,
      status: ProcessingStatus.DOWNLOADING,
      startTime: Date.now(),
    };
    activeContexts.set(userId, context);

    context.status = ProcessingStatus.DOWNLOADING;
    await updateStatusMessage(ctx, statusMessageId, s.downloading);

    const fileBuffer = await downloadFileFromTelegram(audio.file_id, process.env.TELEGRAM_BOT_TOKEN || '');

    context.status = ProcessingStatus.TRANSCRIBING;
    await updateStatusMessage(ctx, statusMessageId, s.transcribing);

    const audioFileName = audio.file_name || `audio.${(audio.mime_type || 'audio/mpeg').split('/')[1] || 'mp3'}`;
    const transcript = await transcribeAudio(fileBuffer, audioFileName, audio.mime_type || 'audio/mpeg');

    context.transcript = transcript;
    context.status = ProcessingStatus.ANALYZING;
    await updateStatusMessage(ctx, statusMessageId, s.analyzing);

    const meetingData = await analyzeMeeting(transcript, undefined, lang);

    context.meetingData = meetingData;
    context.status = ProcessingStatus.SAVING;
    await updateStatusMessage(ctx, statusMessageId, s.saving);

    const pb = getPocketBase();
    const userAiId = await getOrCreateUserAI(pb, userId, ctx.from?.username, ctx.from?.first_name);

    const { meetingId, actionItemIds } = await createMeetingRecord(pb, userAiId, transcript, meetingData);

    try {
      const fileName = `audio_${userId}_${Date.now()}.mp3`;
      await uploadAudioFile(pb, fileName, fileBuffer, meetingId);
    } catch (uploadError) {
      console.error('Audio upload failed (notes still saved):', uploadError);
    }

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
    console.error('Error processing audio file:', error);
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