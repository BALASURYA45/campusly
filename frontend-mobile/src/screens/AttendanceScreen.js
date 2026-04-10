import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, SafeAreaView, ScrollView, Modal
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { checkNetworkStatus, subscribeToNetworkChanges } from '../services/networkService';
import { saveToSyncQueue, getSyncQueue } from '../storage/offlineStorage';
import { submitAttendance, fetchClassAttendance } from '../services/attendanceService';
import { processSyncQueue } from '../services/syncService';
import { formatAttendanceForSync } from '../utils/syncHelper';

const AttendanceScreen = ({ route }) => {
  const { classId, className, students: initialStudents = [] } = route.params || {};
  
  const [students, setStudents] = useState(initialStudents);
  const [attendance, setAttendance] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check initial network status
    const init = async () => {
      const status = await checkNetworkStatus();
      setIsOnline(status);
      updatePendingCount();
      
      if (initialStudents.length === 0 && classId) {
        fetchStudents();
      }
    };
    init();

    // Subscribe to changes
    const unsubscribe = subscribeToNetworkChanges((status) => {
      setIsOnline(status);
      if (status) {
        handleAutoSync();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchStudents = async () => {
    if (!isOnline) return; // Can't fetch if offline, use cached if available?
    
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: res } = await axios.get(`${API_BASE_URL}/classes`, config);
      const cls = res.data.find(c => c._id === classId);
      
      if (cls && cls.students) {
        // Students are already populated in the backend response
        setStudents(cls.students);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePendingCount = async () => {
    const queue = await getSyncQueue();
    setPendingSyncCount(queue.length);
  };

  const handleAutoSync = async () => {
    setSyncing(true);
    await processSyncQueue();
    setSyncing(false);
    updatePendingCount();
  };

  const toggleStatus = (studentId) => {
    const statuses = ['Present', 'Absent', 'Late', 'On-Duty'];
    setAttendance(prev => {
      const currentStatus = prev[studentId] || 'Present';
      const currentIndex = statuses.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % statuses.length;
      return {
        ...prev,
        [studentId]: statuses[nextIndex]
      };
    });
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      Alert.alert('Error', 'No students to mark attendance for');
      return;
    }

    const attendanceRecords = students.map(s => ({
      student: s._id,
      class: classId,
      status: attendance[s._id] || 'Present',
      date: new Date().toISOString().split('T')[0],
      period: selectedPeriod
    }));

    setLoading(true);
    try {
      if (isOnline) {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post(`${API_BASE_URL}/attendance`, { attendanceRecords }, config);
        Alert.alert('Success', 'Attendance saved and synced successfully');
      } else {
        await saveToSyncQueue({ attendanceRecords });
        updatePendingCount();
        Alert.alert('Offline', 'Attendance saved locally. It will sync when you are back online.');
      }
    } catch (error) {
      console.error('Save error:', error);
      // If online submit fails, offer to save offline
      Alert.alert(
        'Submission Failed', 
        'Could not reach server. Save locally instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Save Offline', 
            onPress: async () => {
              await saveToSyncQueue({ attendanceRecords });
              updatePendingCount();
            } 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = (status) => {
    if (activeStudent) {
      setAttendance(prev => ({ ...prev, [activeStudent]: status }));
    }
    setModalVisible(false);
    setActiveStudent(null);
  };

  const renderStudentItem = ({ item }) => {
    const status = attendance[item._id] || 'Present';
    const getStatusColor = (s) => {
      switch (s) {
        case 'Present': return '#4CAF50';
        case 'Absent': return '#F44336';
        case 'Late': return '#FF9800';
        case 'On-Duty': return '#9C27B0';
        default: return '#757575';
      }
    };

    return (
      <View style={styles.studentItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>Roll No: {item.rollNumber || 'N/A'}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(status) }
          ]}
          onPress={() => {
            setActiveStudent(item._id);
            setModalVisible(true);
          }}
        >
          <Text style={styles.statusText}>{status}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View style={[styles.networkDot, { backgroundColor: isOnline ? '#4CAF50' : '#FF9800' }]} />
          <Text style={styles.statusInfo}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </Text>
          {pendingSyncCount > 0 && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>{pendingSyncCount} Pending</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{className || 'Attendance'}</Text>
        
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <Text style={styles.periodLabel}>Select Period:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[
                  styles.periodButton, 
                  selectedPeriod === p && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(p)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === p && styles.selectedPeriodText
                ]}>P{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Status Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {['Present', 'Absent', 'Late', 'On-Duty'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={() => handleStatusSelect(status)}
              >
                <Text style={styles.modalOptionText}>{status}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, { borderBottomWidth: 0, marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalOptionText, { color: '#F44336' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        {pendingSyncCount > 0 && isOnline && (
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={handleAutoSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.syncButtonText}>Sync Now</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveAttendance}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  networkDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusInfo: { fontSize: 12, color: '#666', fontWeight: '600' },
  syncBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 10 },
  syncBadgeText: { fontSize: 10, color: '#1976D2', fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1C1E', marginBottom: 12 },
  periodContainer: { marginTop: 8 },
  periodLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 8 },
  periodScroll: { gap: 8 },
  periodButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F0F0F0', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  selectedPeriodButton: { backgroundColor: '#0062FF', borderColor: '#0062FF' },
  periodText: { fontSize: 14, fontWeight: '700', color: '#666' },
  selectedPeriodText: { color: '#FFF' },
  listContent: { padding: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, width: '80%', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  modalOptionText: { fontSize: 16, fontWeight: '600', color: '#444' },
  studentItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  studentName: { fontSize: 16, fontWeight: '700', color: '#333' },
  studentId: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, minWidth: 90, alignItems: 'center' },
  statusText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', gap: 10 },
  saveButton: { backgroundColor: '#0062FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  syncButton: { backgroundColor: '#1976D2', padding: 12, borderRadius: 12, alignItems: 'center' },
  syncButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});

export default AttendanceScreen;
