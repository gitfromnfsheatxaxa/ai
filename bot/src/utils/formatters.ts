/**
 * Formatters for creating beautiful Telegram messages
 * Also includes keyboard definitions for user-friendly interactions
 */

import { InlineKeyboard } from 'grammy';
import { MeetingData, ActionItem } from '../types.js';

// Type for reply keyboard buttons
type KeyboardButton = { text: string };

// ============================================================================
// KEYBOARD DEFINITIONS
// ============================================================================

/**
 * Create the main menu reply keyboard (persistent at bottom of screen)
 */
export function getMainMenuKeyboard(): KeyboardButton[][] {
  return [
    [{ text: '📋 My Notes' }, { text: '⚡ Action Board' }],
    [{ text: '📤 Send New Meeting' }, { text: '🛎 Notifications' }],
    [{ text: '❓ Help' }],
  ];
}

/**
 * Create inline keyboard for meeting actions (shown after processing)
 */
export function getMeetingActionsKeyboard(meetingId: string): InlineKeyboard {
  return new InlineKeyboard([
    [
      { text: '✏️ Make Shorter', callback_data: `adjust_shorter_${meetingId}` },
      { text: '📝 More Formal', callback_data: `adjust_formal_${meetingId}` },
    ],
    [
      { text: '🎯 Focus on Action Items', callback_data: `adjust_actions_${meetingId}` },
      { text: '📊 View Full Details', callback_data: `view_meeting_${meetingId}` },
    ],
  ]);
}

/**
 * Create inline keyboard for notification consent
 */
export function getNotificationConsentKeyboard(): InlineKeyboard {
  return new InlineKeyboard([
    [
      { text: '✅ Enable Notifications', callback_data: 'notify_enable' },
      { text: '❌ Keep Disabled', callback_data: 'notify_disable' },
    ],
  ]);
}

/**
 * Create inline keyboard for marking action item as done
 */
export function getActionItemKeyboard(actionItemId: string): InlineKeyboard {
  return new InlineKeyboard([
    [{ text: '✅ Mark as Done', callback_data: `done_${actionItemId}` }],
  ]);
}

/**
 * Create inline keyboard for My Notes list (pagination)
 */
export function getMyNotesKeyboard(page: number, totalPages: number, _meetingId?: string): InlineKeyboard {
  const rows: { text: string; callback_data: string }[][] = [];

  // Pagination buttons
  const paginationRow: { text: string; callback_data: string }[] = [];
  if (page > 1) {
    paginationRow.push({ text: '◀️ Previous', callback_data: `notes_page_${page - 1}` });
  }
  if (page < totalPages) {
    paginationRow.push({ text: 'Next ▶️', callback_data: `notes_page_${page + 1}` });
  }
  if (paginationRow.length > 0) {
    rows.push(paginationRow);
  }

  // Close button
  rows.push([{ text: '❌ Close', callback_data: 'close_notes' }]);

  return new InlineKeyboard(rows.flat().length > 0 ? rows : []);
}

// ============================================================================
// MESSAGE FORMATTERS
// ============================================================================

/**
 * Format meeting data into a beautiful Telegram message with HTML formatting
 */
export function formatMeetingNotes(meeting: MeetingData): string {
  const sections: string[] = [];

  // Header
  sections.push('<b>📝 Meeting Notes</b>');
  sections.push('');

  // Summary
  if (meeting.summary) {
    sections.push('<b>📌 Summary</b>');
    sections.push(meeting.summary);
    sections.push('');
  }

  // Topics
  if (meeting.topics && meeting.topics.length > 0) {
    sections.push('<b>🎯 Topics Discussed</b>');
    meeting.topics.forEach(topic => {
      sections.push(`• ${escapeHtml(topic)}`);
    });
    sections.push('');
  }

  // Decisions
  if (meeting.decisions && meeting.decisions.length > 0) {
    sections.push('<b>✅ Decisions Made</b>');
    meeting.decisions.forEach(decision => {
      sections.push(`• ${escapeHtml(decision)}`);
    });
    sections.push('');
  }

  // Action Items
  if (meeting.action_items && meeting.action_items.length > 0) {
    sections.push('<b>📋 Action Items</b>');
    meeting.action_items.forEach((item, index) => {
      const priorityEmoji = getPriorityEmoji(item.priority);
      const assignee = item.assignee ? ` ➡️ @${item.assignee}` : '';
      const dueDate = item.due_date ? ` 📅 ${item.due_date}` : '';
      sections.push(`${index + 1}. ${priorityEmoji} ${escapeHtml(item.task)}${assignee}${dueDate}`);
    });
    sections.push('');
  }

  // Project Tag
  if (meeting.project_tag) {
    sections.push(`<b>🏷️ Project</b>: ${escapeHtml(meeting.project_tag)}`);
  }

  return sections.join('\n');
}

/**
 * Format action items for quick display
 */
export function formatActionItems(actionItems: ActionItem[]): string {
  if (actionItems.length === 0) return 'No action items.';

  const lines: string[] = ['<b>📋 Action Items</b>'];
  actionItems.forEach((item, index) => {
    const priorityEmoji = getPriorityEmoji(item.priority);
    const assignee = item.assignee ? ` ➡️ ${item.assignee}` : '';
    lines.push(`${index + 1}. ${priorityEmoji} ${escapeHtml(item.task)}${assignee}`);
  });

  return lines.join('\n');
}

/**
 * Format a status update message
 */
export function formatStatusMessage(status: string, progress?: number): string {
  const emoji = getStatusEmoji(status);
  const progressBar = progress !== undefined ? ` ${progress}%` : '';
  return `${emoji} <b>${status}</b>${progressBar}`;
}

/**
 * Get emoji for processing status
 */
function getStatusEmoji(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('download')) return '⬇️';
  if (statusLower.includes('transcribe')) return '🎙️';
  if (statusLower.includes('analyz')) return '🤖';
  if (statusLower.includes('save')) return '💾';
  if (statusLower.includes('complete')) return '✅';
  if (statusLower.includes('error') || statusLower.includes('fail')) return '❌';
  return '⏳';
}

/**
 * Get emoji for priority level
 */
function getPriorityEmoji(priority?: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `❌ <b>Error</b>: ${escapeHtml(message)}`;
}

/**
 * Create a welcome message for new users
 */
export function formatWelcomeMessage(username?: string): string {
  const greeting = username ? `Welcome, ${username}! 👋` : 'Welcome! 👋';
  return `${greeting}

I turn your meetings into structured, actionable notes.

<b>Send me:</b>
• 🎤 A <b>voice message</b> or <b>audio file</b>
• 📝 A pasted <b>text transcript</b>

I'll extract the summary, decisions, and action items — then save everything to your account.

<b>Menu:</b>
📋 My Notes · ⚡ Action Board · 📤 New Meeting`.trim();
}

/**
 * Create a help message
 */
export function formatHelpMessage(): string {
  return `<b>🤖 AI Meeting Notes — Help</b>

<b>How it works:</b>
1. Send a voice message, audio file, or paste a transcript
2. The AI transcribes and analyzes it (~30–60 seconds)
3. You receive a structured breakdown with summary, decisions, and tasks

<b>Adjusting notes:</b>
After receiving notes, send a plain text instruction:
<i>"make it shorter" · "more formal" · "focus on action items" · "simplify"</i>

<b>Menu:</b>
📋 <b>My Notes</b> — Browse and open past meetings
⚡ <b>Action Board</b> — See and complete open tasks
📤 <b>Send New Meeting</b> — Tips on what to send
🛎 <b>Notifications</b> — Daily digest & reminders
❓ <b>Help</b> — This message`.trim();
}

/**
 * Create a confirmation message for saved meeting
 */
export function formatSavedMessage(_meetingId: string, actionItemsCount: number): string {
  const actionLine = actionItemsCount > 0
    ? `\n• ${actionItemsCount} action ${actionItemsCount === 1 ? 'item' : 'items'} extracted`
    : '';
  return `✅ <b>Notes saved!</b>\n\nYour meeting notes are ready and stored.${actionLine}\n\nOpen <b>📋 My Notes</b> to review them anytime.`;
}

/**
 * Format My Notes list
 */
export function formatMyNotesList(meetings: Array<{
  id: string;
  created: string;
  project_tag: string;
  summary: string;
  actionItemsCount: number;
}>, page: number, totalPages: number): string {
  if (meetings.length === 0) {
    return '📭 <b>No meeting notes yet</b>\n\nSend a voice message or audio file to create your first meeting note!';
  }

  const lines: string[] = [`<b>📋 My Meeting Notes (Page ${page}/${totalPages})</b>`, ''];

  meetings.forEach((meeting, index) => {
    const date = new Date(meeting.created).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const tag = meeting.project_tag || 'General';
    const summaryPreview = meeting.summary.length > 100
      ? meeting.summary.slice(0, 100) + '…'
      : meeting.summary;

    lines.push(`📄 <b>${index + 1}. ${escapeHtml(tag)}</b> — ${date}`);
    lines.push(`   ${escapeHtml(summaryPreview)}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format Action Board list
 */
export function formatActionBoard(actionItems: Array<{
  id: string;
  task: string;
  meeting_id: string;
  project_tag: string;
  due_date?: string;
  status?: string;
  created: string;
}>): string {
  if (actionItems.length === 0) {
    return '✅ <b>All caught up!</b>\n\nNo open action items. Great job!';
  }

  const lines: string[] = [`<b>⚡ Action Board (${actionItems.length} tasks)</b>`, ''];

  actionItems.forEach((item, index) => {
    const statusEmoji = item.status === 'in_progress' ? '🔄' : '📋';
    const dueDate = item.due_date ? ` · 📅 ${item.due_date}` : '';
    const projectTag = item.project_tag ? ` [${escapeHtml(item.project_tag)}]` : '';

    lines.push(`${index + 1}. ${statusEmoji} <b>${escapeHtml(item.task)}</b>${projectTag}${dueDate}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format daily summary notification
 */
export function formatDailySummary(
  meetingsCount: number,
  actionItems: Array<{ task: string; due_date?: string; priority?: string }>,
  date: Date
): string {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const lines: string[] = [
    `🌅 <b>Daily Summary - ${dateStr}</b>`,
    '',
    `📊 <b>Meetings Today:</b> ${meetingsCount}`,
    '',
  ];

  if (actionItems.length > 0) {
    lines.push(`<b>⚡ Open Action Items (${actionItems.length}):</b>`);
    actionItems.forEach((item, index) => {
      const priorityEmoji = item.priority === 'high' ? '🔴' : 
                            item.priority === 'medium' ? '🟡' : '🟢';
      const dueDate = item.due_date ? ` 📅 ${item.due_date}` : '';
      lines.push(`${index + 1}. ${priorityEmoji} ${escapeHtml(item.task)}${dueDate}`);
    });
  } else {
    lines.push('✅ <b>No open action items</b> - Great job!');
  }

  lines.push('');
  lines.push('<i>Use the menu to view full details or manage tasks.</i>');

  return lines.join('\n');
}

/**
 * Format deadline reminder
 */
export function formatDeadlineReminder(task: string, dueDate: string, timeRemaining: string): string {
  return `
⚠️ <b>Deadline Reminder</b>

<b>Task:</b> ${escapeHtml(task)}
<b>Due:</b> ${dueDate}
<b>Time Remaining:</b> ${timeRemaining}

<b>Don't forget to complete this task!</b>
`.trim();
}

/**
 * Format notification consent message
 */
export function formatNotificationConsent(): string {
  return `
🔔 <b>Enable Notifications?</b>

We can send you:
• 📊 Daily summaries at 7:00 AM
• ⏰ Deadline reminders (24h, 12h, 6h, 2h, 1h, 30min before)
• ✅ Task status updates

Use the buttons below to enable or disable notifications.
`.trim();
}

/**
 * Format notification enabled confirmation
 */
export function formatNotificationEnabled(): string {
  return '✅ <b>Notifications Enabled!</b>\n\nYou will now receive daily summaries at 7:00 AM and deadline reminders.';
}

/**
 * Format notification disabled confirmation
 */
export function formatNotificationDisabled(): string {
  return '🔕 <b>Notifications Disabled</b>\n\nYou can re-enable them anytime from the Notifications menu.';
}