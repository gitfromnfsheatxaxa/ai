/**
 * Type definitions for the AI Meeting Notes Bot
 */

// Meeting data structure returned by AI analysis
export interface MeetingData {
  summary: string;
  decisions: string[];
  action_items: ActionItem[];
  topics: string[];
  project_tag: string;
}

// Individual action item
export interface ActionItem {
  task: string;
  assignee?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

// PocketBase meeting record structure (matches actual PB schema)
export interface PocketBaseMeeting {
  id?: string;
  created?: string;
  updated?: string;
  user_ai?: string;       // Relation to user_ai collection
  raw_transcript: string;
  summary: string;
  decisions: string[];
  topics: string[];
  project_tag: string;
  audio?: string;         // File field name in PB is "audio"
  title?: string;
  date?: string;
}

// PocketBase action item record structure (matches actual PB schema)
export interface PocketBaseActionItem {
  id?: string;
  created?: string;
  updated?: string;
  user_ai?: string;   // Relation to user_ai collection
  meeting?: string;   // Relation to meetings collection
  description: string;
  assignee?: string;
  due_date?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

// User context for the bot
export interface BotUser {
  telegram_id: number;
  telegram_username?: string;
  full_name?: string;
  pocketbase_user_id?: string;
  language?: string;
}

// Processing status enum
export enum ProcessingStatus {
  DOWNLOADING = 'downloading',
  TRANSCRIBING = 'transcribing',
  ANALYZING = 'analyzing',
  SAVING = 'saving',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Context data stored with each message
export interface BotContext {
  statusMessageId: number;
  status: ProcessingStatus;
  startTime: number;
  audioFileId?: string;
  audioFilePath?: string;
  transcript?: string;
  meetingData?: MeetingData;
  meetingRecordId?: string;
}