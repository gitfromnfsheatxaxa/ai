/**
 * AI Meeting Notes Telegram Bot - Main Entry Point
 * 
 * A professional Telegram bot that transcribes voice messages and audio files
 * using Groq Whisper, analyzes them with LLM to extract structured meeting notes,
 * and saves everything to PocketBase.
 */

import 'dotenv/config';
import { Bot } from 'grammy';
import { initializeAdminAuth } from './pbAdmin.js';
import {
  handleStart,
  handleHelp,
  handleAdjust,
  handleStatus,
  handleMyNotes,
  handleActionBoard,
  handleSendNewMeeting,
  handleNotifications,
  handleSettings,
  handleView,
  handleDone,
  handleWebLogin,
  handleViewCallback,
  handleDoneCallback,
  handleNotesPageCallback,
  handleLanguageCallback,
  handleSettingsChangeLangCallback,

  handleNotifyEnable,
  handleNotifyDisable,
} from './handlers/commandHandler.js';
import { ensureLoginTokensCollection } from './services/loginTokenService.js';
import { handleVoice, handleAudio } from './handlers/voiceHandler.js';
import { handleText } from './handlers/textHandler.js';
import { handleAdjustment } from './handlers/adjustHandler.js';

// Initialize the bot with token from environment
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

const bot = new Bot(botToken);

// Bot startup callback
bot.api.getMe().then(async (me) => {
  console.log('Bot started successfully!');
  console.log(`Bot username: @${me.username}`);
  
  // Verify PocketBase connection
  try {
    const pb = await initializeAdminAuth();
    console.log('PocketBase admin authenticated');
    // Ensure login_tokens collection exists for /weblogin magic-link flow
    await ensureLoginTokensCollection(pb);
  } catch (error) {
    console.error('PocketBase authentication failed:', error);
  }
});

// Logging middleware (must be first)
bot.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const duration = Date.now() - startTime;

  console.log(
    `[${new Date().toISOString()}] ` +
    `User: ${ctx.from?.id} (${ctx.from?.username || 'N/A'}), ` +
    `Chat: ${ctx.chat?.id}, ` +
    `Duration: ${duration}ms`
  );
});

// Error handler (must be before command handlers to catch their errors)
bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error in bot:', error);

    const chatId = ctx.chat?.id;
    if (chatId && ctx.from) {
      try {
        await ctx.reply('❌ An error occurred while processing your request. Please try again.');
      } catch {
        // Ignore reply errors
      }
    }
  }
});

// Command handlers
bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('adjust', handleAdjust);
bot.command('status', handleStatus);
bot.command('view', handleView);
bot.command('done', handleDone);
bot.command('weblogin', handleWebLogin);

// Inline button callbacks
bot.callbackQuery(/^view_(.+)$/, (ctx) => handleViewCallback(ctx as any));
bot.callbackQuery(/^done_(.+)$/, (ctx) => handleDoneCallback(ctx as any));
bot.callbackQuery(/^notes_page_(\d+)$/, (ctx) => handleNotesPageCallback(ctx as any));
bot.callbackQuery('notes_noop', (ctx) => (ctx as any).answerCallbackQuery());

// Language selection callbacks
bot.callbackQuery(/^lang_(en|ru|uz)$/, (ctx) => handleLanguageCallback(ctx as any));

// Settings callbacks
bot.callbackQuery('settings_change_lang', (ctx) => handleSettingsChangeLangCallback(ctx));
bot.callbackQuery('settings_noop', (ctx) => (ctx as any).answerCallbackQuery());

// Notification callbacks
bot.callbackQuery('notify_enable', (ctx) => handleNotifyEnable(ctx));
bot.callbackQuery('notify_disable', (ctx) => handleNotifyDisable(ctx));

// Voice message handler
bot.on(':voice', handleVoice);

// Audio file handler
bot.on(':audio', handleAudio);

// Consolidated text message handler
bot.on('message:text', async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;

  // 1. Check for menu button presses first
  if (text === '📋 My Notes') {
    await handleMyNotes(ctx);
    return;
  }
  if (text === '⚡ Action Board') {
    await handleActionBoard(ctx);
    return;
  }
  if (text === '📤 Send New Meeting') {
    await handleSendNewMeeting(ctx);
    return;
  }
  if (text === '🛎 Notifications') {
    await handleNotifications(ctx);
    return;
  }
  if (text === '❓ Help') {
    await handleHelp(ctx);
    return;
  }
  if (text.includes('Settings') || text.includes('Настройки') || text.includes('Sozlamalar')) {
    await handleSettings(ctx);
    return;
  }

  // 2. Skip commands (they're handled by bot.command())
  if (text.startsWith('/')) {
    return;
  }

  // 3. Try adjustment first (if text looks like an adjustment instruction)
  const adjustmentKeywords = ['make it shorter', 'more formal', 'focus on action', 'make it longer', 'more detailed', 'simplify'];
  const isAdjustment = adjustmentKeywords.some(keyword => text.toLowerCase().includes(keyword));

  if (isAdjustment) {
    await handleAdjustment(ctx);
    return;
  }

  // 5. Otherwise, treat as transcript
  await handleText(ctx);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down bot...');
  process.exit(0);
});

// Start the bot
console.log('Starting AI Meeting Notes Bot...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PocketBase URL:', process.env.POCKETBASE_URL);
console.log('Groq Model:', process.env.GROQ_ANALYSIS_MODEL);

bot.start().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});

// Export for testing
export { bot };