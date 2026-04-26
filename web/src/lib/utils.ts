import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time to readable string
 */
export function formatTime(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string | Date, locale: string = 'en'): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date, locale);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate avatar URL from username
 */
export function getAvatarUrl(username?: string, size: number = 40): string {
  if (!username) return `https://ui-avatars.com/api/?background=14b8a6&color=fff&size=${size}`;
  const initials = getInitials(username);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=14b8a6&color=fff&size=${size}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'completed': 'success',
    'done': 'success',
    'in-progress': 'warning',
    'in_progress': 'warning',
    'scheduled': 'info',
    'todo': 'info',
    'high': 'error',
    'low': 'success',
    'medium': 'warning',
  };
  return colors[status] || 'default';
}

/**
 * Get priority badge variant
 */
export function getPriorityVariant(priority: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'high': 'error',
    'medium': 'warning',
    'low': 'success',
  };
  return variants[priority] || 'default';
}