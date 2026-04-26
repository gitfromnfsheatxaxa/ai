import PocketBase, { RecordModel, ListResult } from 'pocketbase';
import { User, AuthResult, Meeting, ActionItem } from '@/types';

// PocketBase client instance
let pbClient: PocketBase | null = null;

const PB_DIRECT = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://34.56.67.158:8090';

// On the browser use the Next.js proxy (/pb-api) to avoid CORS and mixed-content
// (Vercel is HTTPS; PocketBase is HTTP — browsers block direct HTTP calls from HTTPS pages).
// On the server (API routes, SSR) connect directly.
function getPocketBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/pb-api';
  }
  return PB_DIRECT;
}

/**
 * Get or create the PocketBase client instance
 */
export function getPocketBaseClient(): PocketBase {
  if (!pbClient) {
    pbClient = new PocketBase(getPocketBaseUrl());
    pbClient.autoCancellation(false);
  }
  return pbClient;
}

/**
 * Initialize PocketBase client with auth data from cookies
 * This should be called on the server side
 */
export async function initializePocketBase(): Promise<PocketBase> {
  const client = getPocketBaseClient();
  
  // Check for existing auth in cookies (server-side only)
  if (typeof window === 'undefined') {
    // Server-side: would need to read cookies from request
    // This is handled by the middleware and API routes
  } else {
    // Client-side: PocketBase auto-loads from localStorage
    client.autoCancellation(false);
  }
  
  return client;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const client = getPocketBaseClient();
  return client.authStore.isValid;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  const client = getPocketBaseClient();
  if (client.authStore.isValid) {
    // SDK 0.22+ uses authStore.record; .model kept as deprecated alias
    const model = ((client.authStore as any).record ??
                   client.authStore.model) as RecordModel & User;
    if (!model) return null;
    return {
      id: model.id,
      email: model.email,
      telegram_id: model.telegram_id,
      telegram_username: model.telegram_username,
      full_name: model.full_name || (model as any).name || '',
      language: model.language || 'en',
      avatar: model.avatar,
      created: model.created,
      updated: model.updated,
    };
  }
  return null;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const client = getPocketBaseClient();
  const result = await client.collection('user_ai').authWithPassword(email, password);
  return {
    token: result.token,
    record: {
      id: result.record.id,
      email: result.record.email,
      username: (result.record as RecordModel & User).telegram_username,
      verified: true,
      created: result.record.created,
      updated: result.record.updated,
      collectionId: result.record.collectionId,
      collectionName: result.record.collectionName,
    },
  };
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const client = getPocketBaseClient();
  client.authStore.clear();
}

/**
 * Subscribe to collection changes
 * Returns an unsubscribe function
 */
export function subscribeToCollection(
  collection: string,
  callback: (event: { action: 'create' | 'update' | 'delete'; record: RecordModel }) => void
): () => void {
  const client = getPocketBaseClient();
  
  const unsubscribePromise = (client as any).collection(collection).subscribe('*', (event: any) => {
    callback({
      action: event.action as 'create' | 'update' | 'delete',
      record: event.record,
    });
  });

  return () => { unsubscribePromise.then((fn: any) => fn()); };
}

/**
 * Get meetings with optional filters
 */
export async function getMeetings(filters?: {
  status?: string;
  project?: string;
  limit?: number;
  sort?: string;
}): Promise<Meeting[]> {
  const client = getPocketBaseClient();
  
  let filter = '';
  const params: Record<string, string> = {};
  
  if (filters?.status && filters.status !== 'all') {
    filter = `status = "${filters.status}"`;
  }
  
  if (filters?.project) {
    filter += filter ? ' && ' : '';
    filter += `project_tag = "${filters.project}"`;
  }
  
  params.filter = filter;
  params.sort = filters?.sort || '-created';
  params.limit = filters?.limit?.toString() || '50';
  
  const result = await client.collection('meetings').getList(1, 50, params);
  return result.items as unknown as Meeting[];
}

/**
 * Get action items with optional filters
 */
export async function getActionItems(filters?: {
  status?: string;
  priority?: string;
  project?: string;
  limit?: number;
}): Promise<ActionItem[]> {
  const client = getPocketBaseClient();
  
  let filter = '';
  
  if (filters?.status && filters.status !== 'all') {
    filter = `status = "${filters.status}"`;
  }
  
  if (filters?.priority && filters.priority !== 'all') {
    filter += filter ? ' && ' : '';
    filter += `priority = "${filters.priority}"`;
  }
  
  if (filters?.project) {
    filter += filter ? ' && ' : '';
    filter += `project = "${filters.project}"`;
  }
  
  const params: Record<string, string> = {
    filter,
    sort: '-created',
    limit: filters?.limit?.toString() || '50',
  };
  
  const result = await client.collection('action_items').getList(1, 50, params);
  return result.items as unknown as ActionItem[];
}

/**
 * Create a new action item
 */
export async function createAction(data: Partial<ActionItem>): Promise<ActionItem> {
  const client = getPocketBaseClient();
  const result = await client.collection('action_items').create(data);
  return result as unknown as ActionItem;
}

/**
 * Update an action item
 */
export async function updateAction(id: string, data: Partial<ActionItem>): Promise<ActionItem> {
  const client = getPocketBaseClient();
  const result = await client.collection('action_items').update(id, data);
  return result as unknown as ActionItem;
}

/**
 * Delete an action item
 */
export async function deleteAction(id: string): Promise<void> {
  const client = getPocketBaseClient();
  await client.collection('action_items').delete(id);
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(): Promise<{
  meetingsThisWeek: number;
  actionsCompleted: number;
  totalMeetings: number;
  totalActions: number;
}> {
  const client = getPocketBaseClient();
  
  // Get meeting count
  const meetingsResult = await client.collection('meetings').getList(1, 1, {});
  
  // Get completed actions count
  const actionsResult = await client.collection('action_items').getList(1, 1, {
    filter: 'status = "done"',
  });
  
  return {
    meetingsThisWeek: meetingsResult.items.length,
    actionsCompleted: actionsResult.items.length,
    totalMeetings: meetingsResult.items.length,
    totalActions: actionsResult.items.length,
  };
}