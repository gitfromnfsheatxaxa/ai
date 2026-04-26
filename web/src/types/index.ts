// User type
export interface User {
  id: string;
  email?: string;
  telegram_id?: string;
  telegram_username?: string;
  full_name?: string;
  language: 'en' | 'ru' | 'uz';
  avatar?: string;
  created: string;
  updated: string;
}

// Meeting type (matches PocketBase collection)
export interface Meeting {
  id: string;
  user_ai?: string;           // Relation to user_ai collection
  title: string;
  raw_transcript: string;
  summary: string;
  decisions: string[];
  topics: string[];
  project_tag: string;
  audio?: string;             // File URL
  date: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  created: string;
  updated: string;
}

// Action Item type (matches PocketBase collection)
export interface ActionItem {
  id: string;
  user_ai?: string;           // Relation to user_ai collection
  meeting?: string;           // Relation to meetings collection
  description: string;
  assignee?: string;
  due_date?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project?: string;
  created: string;
  updated: string;
}

// Dashboard stats
export interface DashboardStats {
  meetingsThisWeek: number;
  actionsCompleted: number;
  avgMeetingLength: string;
  aiSummaries: number;
}

// Filter state
export interface FilterState {
  search: string;
  status: 'all' | 'completed' | 'in-progress' | 'scheduled';
  project: string;
  priority: 'all' | 'high' | 'medium' | 'low';
}

// Glass component variants
export type GlassVariant = 'pearl' | 'glacier' | 'aurora';

// Button variants
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Badge variants
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

// PocketBase auth record (extends PB's RecordModel)
export interface AuthRecord {
  id: string;
  email: string;
  username?: string;
  verified: boolean;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

// Auth result
export interface AuthResult {
  token: string;
  record: AuthRecord;
}