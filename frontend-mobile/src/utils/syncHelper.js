import { processSyncQueue } from '../services/syncService';
import { subscribeToNetworkChanges } from '../services/networkService';

export const initBackgroundSync = () => {
  // Subscribe to network changes to trigger sync when coming online
  const unsubscribe = subscribeToNetworkChanges((isOnline) => {
    if (isOnline) {
      console.log('App is online, triggering sync...');
      processSyncQueue();
    }
  });

  // Also trigger on init
  processSyncQueue();

  return unsubscribe;
};

export const formatAttendanceForSync = (students, classId, subjectId, date, attendanceState) => {
  return students.map(student => ({
    student: student._id,
    class: classId,
    subject: subjectId,
    date: date,
    status: attendanceState[student._id] || 'Present'
  }));
};
