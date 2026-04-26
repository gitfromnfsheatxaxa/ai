/**
 * PocketBase Admin Client - Manages admin authentication to PocketBase
 */

import PocketBase from 'pocketbase';

let pbClient: PocketBase | null = null;

/**
 * Get or create the PocketBase admin client
 */
export function getPocketBase(): PocketBase {
  if (!pbClient) {
    const pocketBaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
    pbClient = new PocketBase(pocketBaseUrl);
  }
  return pbClient;
}

/**
 * Initialize PocketBase admin authentication
 */
export async function initializeAdminAuth(): Promise<PocketBase> {
  const pb = getPocketBase();

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PocketBase admin credentials not configured in environment variables');
  }

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(adminEmail, adminPassword);

    console.log('PocketBase admin authenticated successfully');
    console.log(`Admin email: ${adminEmail}`);

    return pb;
  } catch (error) {
    console.error('Failed to authenticate with PocketBase:', error);
    throw new Error('PocketBase admin authentication failed');
  }
}

/**
 * Check if admin is authenticated
 */
export async function verifyAdminAuth(): Promise<boolean> {
  const pb = getPocketBase();

  try {
    // Try to refresh the auth token
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL || '',
      process.env.POCKETBASE_ADMIN_PASSWORD || ''
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current admin info
 */
export async function getAdminInfo(): Promise<{ email: string; id: string } | null> {
  const pb = getPocketBase();

  try {
    if (pb.authStore.isValid && pb.authStore.isAdmin) {
      // Return the configured admin info since authStore doesn't expose it directly
      return {
        email: process.env.POCKETBASE_ADMIN_EMAIL || 'admin',
        id: 'admin',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Refresh admin authentication token
 */
export async function refreshAdminAuth(): Promise<void> {
  const pb = getPocketBase();

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PocketBase admin credentials not configured');
  }

  await pb.admins.authWithPassword(adminEmail, adminPassword);
}

// Export the PocketBase class for type references
export { PocketBase };