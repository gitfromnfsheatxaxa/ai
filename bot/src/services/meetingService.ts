/**
 * Meeting Service - Handles creating and managing meeting records in PocketBase
 */

import PocketBase from 'pocketbase';
import { MeetingData, ActionItem, PocketBaseMeeting, PocketBaseActionItem } from '../types.js';

/**
 * Find or create a user_ai record based on Telegram ID
 * Note: user_ai is a separate auth collection in PocketBase for this bot
 */
export async function getOrCreateUserAI(
  pb: PocketBase,
  telegramUserId: number,
  telegramUsername?: string,
  fullName?: string
): Promise<string> {
  try {
    console.log(`[getOrCreateUserAI] Looking for Telegram ID: ${telegramUserId}`);
    console.log(`[getOrCreateUserAI] PocketBase URL: ${process.env.POCKETBASE_URL}`);
    
    // Ensure admin auth is valid before making requests
    if (!pb.authStore.isValid) {
      console.log('[getOrCreateUserAI] Re-authenticating as admin...');
      await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || '',
        process.env.POCKETBASE_ADMIN_PASSWORD || ''
      );
      console.log('[getOrCreateUserAI] Admin re-authenticated');
    }
    
    // Try to find existing user_ai by telegram_id (stored as text in PB)
    const existingUsers = await pb.collection('user_ai').getList(1, 1, {
      filter: `telegram_id = "${telegramUserId}"`,
    });

    console.log(`[getOrCreateUserAI] Found ${existingUsers.items.length} existing user_ai records`);

    if (existingUsers.items.length > 0) {
      const user = existingUsers.items[0];
      console.log(`[getOrCreateUserAI] Returning existing user_ai: ${user.id}`);
      
      // Update display name if provided
      if (telegramUsername || fullName) {
        await pb.collection('user_ai').update(user.id, {
          name: fullName || telegramUsername || user.name,
        });
      }
      return user.id;
    }

    // Create new user_ai with random password
    console.log(`[getOrCreateUserAI] Creating new user_ai for Telegram ID: ${telegramUserId}`);
    const randomPassword = Math.random().toString(36).slice(-20);
    
    const newUser = await pb.collection('user_ai').create({
      username: `tg_${telegramUserId}`,
      email: `tg_${telegramUserId}@telegram.local`,
      password: randomPassword,
      passwordConfirm: randomPassword,
      telegram_id: String(telegramUserId),
      name: fullName || telegramUsername || '',
    });

    console.log(`✅ Created new user_ai: ${newUser.id} for Telegram ID: ${telegramUserId}`);
    return newUser.id;
  } catch (error) {
    console.error('❌ Error finding/creating user_ai:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to find or create user_ai in PocketBase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new meeting record in PocketBase
 */
export async function createMeetingRecord(
  pb: PocketBase,
  userAiId: string,
  transcript: string,
  meetingData: MeetingData,
): Promise<{ meetingId: string; actionItemIds: string[] }> {
  try {
    // Create the meeting record with user_ai relation
    const meetingDataForPB: Partial<PocketBaseMeeting> = {
      user_ai: userAiId,
      raw_transcript: transcript,
      summary: meetingData.summary,
      decisions: meetingData.decisions,
      topics: meetingData.topics,
      project_tag: meetingData.project_tag,
    };

    console.log(`Creating meeting with user_ai: ${userAiId}`);
    const meeting = await pb.collection('meetings').create(meetingDataForPB);
    const meetingId = meeting.id;

    // Create action items and collect their IDs
    const actionItemIds: string[] = [];

    if (meetingData.action_items && meetingData.action_items.length > 0) {
      for (const item of meetingData.action_items) {
        const actionItemId = await createActionItem(pb, meetingId, userAiId, item);
        actionItemIds.push(actionItemId);
      }
    }

    return { meetingId, actionItemIds };
  } catch (error) {
    console.error('Error creating meeting record:', error);
    throw new Error('Failed to create meeting record in PocketBase');
  }
}

/**
 * Create a single action item record
 */
export async function createActionItem(
  pb: PocketBase,
  meetingId: string,
  userId: string,
  actionItem: ActionItem
): Promise<string> {
  try {
    const actionItemData: Partial<PocketBaseActionItem> = {
      user_ai: userId,
      meeting: meetingId,
      description: actionItem.task,
      assignee: actionItem.assignee,
      due_date: actionItem.due_date,
      status: 'todo',
    };

    const actionItemRecord = await pb.collection('action_items').create(actionItemData);
    return actionItemRecord.id;
  } catch (error) {
    console.error('Error creating action item:', error);
    throw new Error('Failed to create action item in PocketBase');
  }
}

/**
 * Update an existing meeting record
 */
export async function updateMeetingRecord(
  pb: PocketBase,
  meetingId: string,
  updates: Partial<PocketBaseMeeting>
): Promise<PocketBaseMeeting> {
  try {
    return await pb.collection('meetings').update(meetingId, updates);
  } catch (error) {
    console.error('Error updating meeting record:', error);
    throw new Error('Failed to update meeting record in PocketBase');
  }
}

/**
 * Update action item status
 */
export async function updateActionItemStatus(
  pb: PocketBase,
  actionItemId: string,
  status: 'todo' | 'in_progress' | 'done'
): Promise<void> {
  try {
    await pb.collection('action_items').update(actionItemId, { status });
  } catch (error) {
    console.error('Error updating action item status:', error);
    throw new Error('Failed to update action item');
  }
}

/**
 * Get meeting record by ID
 */
export async function getMeetingRecord(
  pb: PocketBase,
  meetingId: string
): Promise<PocketBaseMeeting> {
  try {
    return await pb.collection('meetings').getOne(meetingId);
  } catch (error) {
    console.error('Error fetching meeting record:', error);
    throw new Error('Failed to fetch meeting record from PocketBase');
  }
}

/**
 * Get all meetings for a Telegram user
 */
export async function getUserMeetings(
  pb: PocketBase,
  telegramUserId: number,
  limit: number = 10
): Promise<PocketBaseMeeting[]> {
  try {
    const result = await pb.collection('meetings').getList(1, limit, {
      filter: `user_ai.telegram_id = "${telegramUserId}"`,
      sort: '-created',
    });
    return result.items as unknown as PocketBaseMeeting[];
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    throw new Error('Failed to fetch user meetings from PocketBase');
  }
}

/**
 * Get the most recent meeting for a Telegram user
 */
export async function getLatestUserMeeting(
  pb: PocketBase,
  telegramUserId: number
): Promise<PocketBaseMeeting | null> {
  try {
    const meetings = await getUserMeetings(pb, telegramUserId, 1);
    return meetings.length > 0 ? meetings[0] : null;
  } catch (error) {
    console.error('Error fetching latest meeting:', error);
    return null;
  }
}

/**
 * Re-analyze and update a meeting with new AI analysis
 */
export async function reanalyzeMeeting(
  pb: PocketBase,
  meetingId: string,
  newMeetingData: MeetingData,
  _aiModel?: string
): Promise<void> {
  try {
    // Get existing meeting
    const existingMeeting = await getMeetingRecord(pb, meetingId);

    // Delete existing action items (query by meeting relation)
    const oldItems = await pb.collection('action_items').getList(1, 100, {
      filter: `meeting = "${meetingId}"`,
    });
    for (const item of oldItems.items) {
      try {
        await pb.collection('action_items').delete(item.id);
      } catch (err) {
        console.warn(`Failed to delete action item ${item.id}:`, err);
      }
    }

    // Update meeting record
    await updateMeetingRecord(pb, meetingId, {
      summary: newMeetingData.summary,
      decisions: newMeetingData.decisions,
      topics: newMeetingData.topics,
      project_tag: newMeetingData.project_tag,
    });

    // Get the user_ai from existing meeting
    const userAiId = existingMeeting.user_ai;
    if (!userAiId) {
      throw new Error('Meeting has no user_ai relation');
    }

    // Create new action items
    if (newMeetingData.action_items && newMeetingData.action_items.length > 0) {
      for (const item of newMeetingData.action_items) {
        await createActionItem(pb, meetingId, userAiId, item);
      }
    }
  } catch (error) {
    console.error('Error re-analyzing meeting:', error);
    throw new Error('Failed to re-analyze meeting');
  }
}

/**
 * Delete a meeting and all its associated action items
 */
export async function deleteMeetingRecord(
  pb: PocketBase,
  meetingId: string
): Promise<void> {
  try {
    // Delete associated action items (query by meeting relation)
    const items = await pb.collection('action_items').getList(1, 100, {
      filter: `meeting = "${meetingId}"`,
    });
    for (const item of items.items) {
      await pb.collection('action_items').delete(item.id);
    }

    // Delete the meeting
    await pb.collection('meetings').delete(meetingId);
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw new Error('Failed to delete meeting from PocketBase');
  }
}