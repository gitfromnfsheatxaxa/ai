/**
 * Adjust Handler - Handles adjustment commands for re-analyzing meetings
 */

import { Context } from 'grammy';
import { BotContext, ProcessingStatus } from '../types.js';
import { reanalyzeWithAdjustments } from '../aiService.js';
import { reanalyzeMeeting, getLatestUserMeeting as getLatestMeetingFromDb } from '../services/meetingService.js';
import { getPocketBase } from '../pbAdmin.js';
import {
  formatStatusMessage,
  formatMeetingNotes,
  formatErrorMessage,
} from '../utils/formatters.js';
import { parseAdjustmentInstructions, isAdjustmentCommand } from '../utils/helpers.js';

// Store active processing contexts
const activeContexts = new Map<number, BotContext>();

/**
 * Handle adjustment commands
 */
export async function handleAdjustment(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('❌ Unable to identify user. Please restart the bot with /start');
    return;
  }

  const text = ctx.message?.text;
  if (!text) {
    return;
  }

  // Check if this is an adjustment command
  if (!isAdjustmentCommand(text)) {
    // Not an adjustment command, ignore
    return;
  }

  // Check if user has active context (processing another message)
  if (activeContexts.has(userId)) {
    await ctx.reply('⏳ Please wait for the current processing to complete...');
    return;
  }

  try {
    // Create status message
    const statusMsg = await ctx.reply(formatStatusMessage('Initializing...'));
    const statusMessageId = statusMsg.message_id;

    // Store context
    const context: BotContext = {
      statusMessageId,
      status: ProcessingStatus.ANALYZING,
      startTime: Date.now(),
    };
    activeContexts.set(userId, context);

    await updateStatusMessage(ctx, statusMessageId, '🔍 <b>Fetching previous meeting...</b>');

    // Get the latest meeting for this user
    const pb = getPocketBase();
    const latestMeeting = await getLatestMeetingFromDb(pb, userId);

    if (!latestMeeting || !latestMeeting.id) {
      await updateStatusMessage(ctx, statusMessageId, '❌ <b>No previous meeting found</b>');
      await ctx.reply('I couldn\'t find any previous meeting notes. Please send a voice message or audio file first.');
      activeContexts.delete(userId);
      return;
    }

    // Parse adjustment instructions
    const instructions = parseAdjustmentInstructions(text);

    context.status = ProcessingStatus.ANALYZING;
    await updateStatusMessage(ctx, statusMessageId, '🤖 <b>Re-analyzing with new instructions...</b>');

    // Re-analyze with adjustments
    const newMeetingData = await reanalyzeWithAdjustments(
      latestMeeting.raw_transcript,
      instructions
    );

    context.meetingData = newMeetingData;
    context.status = ProcessingStatus.SAVING;
    await updateStatusMessage(ctx, statusMessageId, '💾 <b>Updating database...</b>');

    // Update the meeting in PocketBase
    const aiModel = process.env.GROQ_ANALYSIS_MODEL;
    if (aiModel) {
      await reanalyzeMeeting(pb, latestMeeting.id, newMeetingData, aiModel);
    } else {
      await reanalyzeMeeting(pb, latestMeeting.id, newMeetingData);
    }

    context.meetingRecordId = latestMeeting.id;
    context.status = ProcessingStatus.COMPLETED;

    // Send updated notes
    const notesMessage = formatMeetingNotes(newMeetingData);
    const adjustmentNote = `\n\n<i>✨ Adjusted based on: "${text}"</i>`;

    await ctx.reply(notesMessage + adjustmentNote, {
      parse_mode: 'HTML',
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
    console.error('Error processing adjustment:', error);
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