import { getSyncQueue, removeFromSyncQueue } from '../storage/offlineStorage';
import { submitAttendance } from './attendanceService';
import { checkNetworkStatus } from './networkService';

let isSyncing = false;

export const processSyncQueue = async () => {
  if (isSyncing) return { success: false, message: 'Sync already in progress' };
  
  const isOnline = await checkNetworkStatus();
  if (!isOnline) return { success: false, message: 'No internet connection' };

  const queue = await getSyncQueue();
  if (queue.length === 0) return { success: true, message: 'Queue empty' };

  isSyncing = true;
  console.log(`Starting sync for ${queue.length} records...`);

  let successCount = 0;
  let failCount = 0;

  try {
    // Process records in batches or one by one
    // For attendance, we usually mark a whole class, so we can group by localId if needed
    // but here the queue has individual records or class-session records
    
    for (const record of queue) {
      try {
        // The record already contains class, students, date, etc.
        // We wrap it in an array for the bulk endpoint
        const attendanceData = Array.isArray(record.attendanceRecords) 
          ? record.attendanceRecords 
          : [record];

        await submitAttendance(attendanceData);
        await removeFromSyncQueue(record.localId);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync record ${record.localId}:`, error.message);
        failCount++;
        // Stop if unauthorized or other critical errors? 
        // For now, continue to next
      }
    }

    return {
      success: true,
      processed: queue.length,
      synced: successCount,
      failed: failCount
    };
  } finally {
    isSyncing = false;
  }
};
