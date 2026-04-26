/**
 * Helper utilities for the AI Meeting Notes Bot
 */

import axios from 'axios';

/**
 * Download a file from Telegram and return as buffer
 */
export async function downloadFileFromTelegram(
  fileId: string,
  botToken: string
): Promise<Buffer> {
  // First get the file path
  const fileResponse = await axios.post(
    `https://api.telegram.org/bot${botToken}/getFile`,
    { file_id: fileId }
  );

  if (!fileResponse.data.ok) {
    throw new Error('Failed to get file info from Telegram');
  }

  const filePath = fileResponse.data.result.file_path;
  
  // Download the file
  const fileDownloadResponse = await axios.get(
    `https://api.telegram.org/file/bot${botToken}/${filePath}`,
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(fileDownloadResponse.data);
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'audio/ogg': 'ogg',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
  };
  return extensions[mimeType] || 'ogg';
}

/**
 * Generate a unique filename for audio files
 */
export function generateAudioFilename(userId: number, timestamp: Date): string {
  const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
  return `audio_${userId}_${dateStr}.ogg`;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Parse user mention from text (e.g., "@username" -> "username")
 */
export function parseMention(text: string): string | null {
  const match = text.match(/@(\w+)/);
  return match ? match[1] : null;
}

/**
 * Extract priority from text
 */
export function extractPriority(text: string): 'low' | 'medium' | 'high' | undefined {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('high') || lowerText.includes('urgent') || lowerText.includes('critical')) {
    return 'high';
  }
  if (lowerText.includes('medium') || lowerText.includes('normal')) {
    return 'medium';
  }
  if (lowerText.includes('low')) {
    return 'low';
  }
  return undefined;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sanitize text for Telegram (remove control characters)
 */
export function sanitizeText(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Calculate processing progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get current timestamp in ISO format
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate a short unique ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Check if text contains adjustment keywords
 */
export function isAdjustmentCommand(text: string): boolean {
  const adjustmentKeywords = [
    'make it shorter',
    'make it longer',
    'more formal',
    'less formal',
    'more casual',
    'focus on action',
    'focus on decisions',
    'summarize',
    'simplify',
    'expand',
    'detailed',
    'concise',
    'brief',
    'add more',
    'remove',
    'delete',
    'change',
    'adjust',
    'modify',
    'reformat',
    'restructure'
  ];

  const lowerText = text.toLowerCase();
  return adjustmentKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Parse adjustment instructions from text
 */
export function parseAdjustmentInstructions(text: string): Record<string, boolean> {
  const lowerText = text.toLowerCase();
  const instructions: Record<string, boolean> = {};

  if (lowerText.includes('shorter') || lowerText.includes('brief') || lowerText.includes('concise')) {
    instructions['shorter'] = true;
  }
  if (lowerText.includes('longer') || lowerText.includes('expand') || lowerText.includes('detailed')) {
    instructions['longer'] = true;
  }
  if (lowerText.includes('formal')) {
    instructions['formal'] = true;
  }
  if (lowerText.includes('casual') || lowerText.includes('less formal')) {
    instructions['casual'] = true;
  }
  if (lowerText.includes('action')) {
    instructions['focus_action'] = true;
  }
  if (lowerText.includes('decision')) {
    instructions['focus_decisions'] = true;
  }
  if (lowerText.includes('simplify')) {
    instructions['simplify'] = true;
  }

  return instructions;
}