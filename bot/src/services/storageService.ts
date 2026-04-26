/**
 * Storage Service - Handles file uploads to PocketBase
 */

import PocketBase from 'pocketbase';
import { PocketBaseMeeting } from '../types.js';

/**
 * Upload audio file to PocketBase storage
 */
export async function uploadAudioFile(
  pb: PocketBase,
  fileName: string,
  fileBuffer: Buffer,
  meetingId: string
): Promise<string> {
  try {
    // Convert Buffer to ArrayBuffer then File (PocketBase requires File, not bare Blob)
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    ) as ArrayBuffer;
    const mimeType = fileName.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg';
    const file = new File([arrayBuffer], fileName, { type: mimeType });

    // Upload to PocketBase storage using the file field
    await pb.collection('meetings').update(meetingId, {
      audio: file,
    });

    return fileName;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw new Error('Failed to upload audio file to PocketBase');
  }
}

/**
 * Download file from PocketBase storage
 */
export async function downloadFileFromPocketBase(
  pb: PocketBase,
  recordId: string,
  fieldName: string = 'audio_file'
): Promise<Blob> {
  try {
    const record = await pb.collection('meetings').getOne(recordId);
    const fileValue = record[fieldName] as string;
    const fileUrl = pb.getFileUrl(record, fileValue);
    
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file from PocketBase');
  }
}

/**
 * Delete file from PocketBase storage
 */
export async function deleteFileFromPocketBase(
  pb: PocketBase,
  recordId: string,
  fieldName: string = 'audio_file'
): Promise<void> {
  try {
    await pb.collection('meetings').update(recordId, {
      [fieldName]: null,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from PocketBase');
  }
}

/**
 * Get file URL from PocketBase record
 */
export function getFileUrl(
  pb: PocketBase,
  record: PocketBaseMeeting,
  fieldName: string = 'audio_file'
): string {
  const fileName = record[fieldName as keyof PocketBaseMeeting] as string;
  if (!fileName) return '';
  return pb.getFileUrl(record, fileName);
}
