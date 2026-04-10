import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_QUEUE_KEY = '@attendance_sync_queue';
const CACHED_ATTENDANCE_KEY = '@cached_attendance';

export const saveToSyncQueue = async (attendanceData) => {
  try {
    const existingQueue = await getSyncQueue();
    // Add unique ID for local tracking if not present
    const recordWithId = {
      ...attendanceData,
      localId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    const newQueue = [...existingQueue, recordWithId];
    await AsyncStorage.setItem(ATTENDANCE_QUEUE_KEY, JSON.stringify(newQueue));
    return recordWithId;
  } catch (error) {
    console.error('Error saving to sync queue:', error);
    throw error;
  }
};

export const getSyncQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(ATTENDANCE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

export const removeFromSyncQueue = async (localId) => {
  try {
    const queue = await getSyncQueue();
    const newQueue = queue.filter(item => item.localId !== localId);
    await AsyncStorage.setItem(ATTENDANCE_QUEUE_KEY, JSON.stringify(newQueue));
  } catch (error) {
    console.error('Error removing from sync queue:', error);
  }
};

export const clearSyncQueue = async () => {
  await AsyncStorage.removeItem(ATTENDANCE_QUEUE_KEY);
};

export const cacheAttendanceLocally = async (attendanceData) => {
  try {
    await AsyncStorage.setItem(CACHED_ATTENDANCE_KEY, JSON.stringify(attendanceData));
  } catch (error) {
    console.error('Error caching attendance:', error);
  }
};

export const getCachedAttendance = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_ATTENDANCE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting cached attendance:', error);
    return [];
  }
};
