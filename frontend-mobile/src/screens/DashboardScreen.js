import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, ActivityIndicator, Dimensions 
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const QuickAction = ({ title, color, onPress, iconText }) => (
  <TouchableOpacity 
    style={[styles.actionCard, { borderLeftColor: color }]} 
    onPress={onPress}
  >
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Text style={{ color: color, fontWeight: 'bold' }}>{iconText}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role || user?.user?.role;
  const token = user?.token;

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const userId = user.id || user.user?._id || user.user?.id;
      
      if (role === 'student') {
        const { data } = await axios.get(`${API_BASE_URL}/attendance/me`, config);
        setAttendance(data.data);
        
        try {
          const { data: twinRes } = await axios.get(`${API_BASE_URL}/digital-twin/${userId}`, config);
          setTwinData(twinRes.data);
        } catch (e) { console.log('Twin fetch error', e); }

      } else if (role === 'teacher') {
        const { data } = await axios.get(`${API_BASE_URL}/classes`, config);
        setClasses(data.data);

        if (data.data.length > 0) {
          try {
            const { data: twinRes } = await axios.get(`${API_BASE_URL}/digital-twin/class/${data.data[0]._id}`, config);
            setTwinData(twinRes.data);
          } catch (e) { console.log('Class Twin fetch error', e); }
        }
      } else if (role === 'parent') {
        const { data } = await axios.get(`${API_BASE_URL}/users?role=student`, config);
        setClasses(data.data); // Using classes state to store children for now
        if (data.data.length > 0) {
          const { data: twinRes } = await axios.get(`${API_BASE_URL}/digital-twin/${data.data[0]._id}`, config);
          setTwinData(twinRes.data);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0062FF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome,</Text>
        <Text style={styles.name}>{user?.name || user?.user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Digital Twin Insight */}
      {twinData && (
        <View style={styles.section}>
          <View style={styles.twinHeader}>
            <Text style={styles.sectionTitle}>
              {role === 'parent' ? "Child's Digital Twin" : "Digital Twin Status"}
            </Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>
          <View style={styles.twinCard}>
            <View style={styles.twinMain}>
              <View style={styles.twinScoreContainer}>
                <Text style={styles.twinScore}>
                  {role === 'teacher' ? twinData.twin?.currentAttendanceRate : twinData.twin?.engagementScore}%
                </Text>
                <Text style={styles.twinScoreLabel}>
                  {role === 'teacher' ? 'Attendance' : 'Engagement'}
                </Text>
              </View>
              <View style={styles.twinDivider} />
              <View style={styles.twinDetails}>
                <Text style={styles.twinDetailLabel}>
                  {role === 'teacher' ? 'Class Performance' : 'Prediction'}
                </Text>
                <Text style={styles.twinDetailValue}>
                  {role === 'teacher' ? `${twinData.twin?.performanceAverage}%` : twinData.twin?.predictedPerformance}
                </Text>
                <Text style={[styles.twinStatus, { color: (role === 'teacher' ? twinData.twin?.currentAttendanceRate : twinData.twin?.engagementScore) >= 75 ? '#4CAF50' : '#FF9800' }]}>
                  ● { (role === 'teacher' ? twinData.twin?.currentAttendanceRate : twinData.twin?.engagementScore) >= 75 ? 'Optimal' : 'Needs Attention' }
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {role === 'teacher' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <QuickAction 
                title="Attendance" 
                color="#0062FF" 
                iconText="A"
                onPress={() => {
                  if (classes.length > 0) {
                    navigation.navigate('Attendance', { 
                      classId: classes[0]._id, 
                      className: classes[0].name,
                      students: [] 
                    });
                  } else {
                    alert('No classes assigned yet.');
                  }
                }} 
              />
              <QuickAction 
                title="Library" 
                color="#01b574" 
                iconText="L"
                onPress={() => navigation.navigate('Library')} 
              />
              <QuickAction 
                title="Quizzes" 
                color="#FF9800" 
                iconText="Q"
                onPress={() => navigation.navigate('Quizzes')} 
              />
              <QuickAction 
                title="Assignments" 
                color="#7C4DFF" 
                iconText="W"
                onPress={() => navigation.navigate('Assignments')} 
              />
            </ScrollView>
          ) : role === 'parent' ? (
            <View style={styles.actionGrid}>
              <QuickAction 
                title="Child Report" 
                color="#01b574" 
                iconText="R"
                onPress={() => alert('Feature coming soon')} 
              />
              <QuickAction 
                title="Messages" 
                color="#FF9800" 
                iconText="M"
                onPress={() => alert('Feature coming soon')} 
              />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <QuickAction 
                title="Attendance" 
                color="#0062FF" 
                iconText="A"
                onPress={() => navigation.navigate('Attendance')} 
              />
              <QuickAction 
                title="Digital Library" 
                color="#01b574" 
                iconText="L"
                onPress={() => navigation.navigate('Library')} 
              />
              <QuickAction 
                title="Quiz Hub" 
                color="#FF9800" 
                iconText="Q"
                onPress={() => navigation.navigate('Quizzes')} 
              />
              <QuickAction 
                title="Assignments" 
                color="#7C4DFF" 
                iconText="W"
                onPress={() => navigation.navigate('Assignments')} 
              />
            </ScrollView>
          )}
        </View>
      </View>

      {/* Role Specific Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {role === 'student' ? 'Attendance Overview' : role === 'parent' ? 'Children Enrolled' : 'My Assigned Classes'}
        </Text>
        
        {role === 'student' ? (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Days</Text>
              <Text style={styles.statValue}>{attendance.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {attendance.filter(a => a.status === 'Present').length}
              </Text>
            </View>
          </View>
        ) : role === 'parent' ? (
           classes.map((child) => (
            <TouchableOpacity 
              key={child._id} 
              style={styles.classItem}
              onPress={() => alert(`View details for ${child.name}`)}
            >
              <View>
                <Text style={styles.className}>{child.name}</Text>
                <Text style={styles.classDetail}>Roll No: {child.rollNumber || 'N/A'}</Text>
              </View>
              <Text style={styles.studentCount}>View Profile</Text>
            </TouchableOpacity>
          ))
        ) : (
          classes.map((cls) => (
            <TouchableOpacity 
              key={cls._id} 
              style={styles.classItem}
              onPress={() => navigation.navigate('Attendance', { 
                classId: cls._id, 
                className: cls.name 
              })}
            >
              <View>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classDetail}>{cls.section || 'General'}</Text>
              </View>
              <Text style={styles.studentCount}>{cls.students?.length || 0} Students</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  welcome: { fontSize: 16, color: '#666', fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '800', color: '#1A1C1E', marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#0062FF15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 12 },
  roleText: { color: '#0062FF', fontSize: 12, fontWeight: '700' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderLeftWidth: 4, elevation: 2, shadowOpacity: 0.05, shadowRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#444' },
  twinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  activeBadge: { backgroundColor: '#4CAF5020', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  activeText: { color: '#4CAF50', fontSize: 10, fontWeight: '800' },
  twinCard: { backgroundColor: '#1A1C1E', borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  twinMain: { flexDirection: 'row', alignItems: 'center' },
  twinScoreContainer: { alignItems: 'center', flex: 1 },
  twinScore: { fontSize: 36, fontWeight: '900', color: '#FFF' },
  twinScoreLabel: { fontSize: 12, color: '#AAA', marginTop: 4, fontWeight: '600' },
  twinDivider: { width: 1, height: 60, backgroundColor: '#333', marginHorizontal: 20 },
  twinDetails: { flex: 1.5 },
  twinDetailLabel: { fontSize: 12, color: '#AAA', fontWeight: '600' },
  twinDetailValue: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 4 },
  twinStatus: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1A1C1E' },
  classItem: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  className: { fontSize: 18, fontWeight: '700', color: '#1A1C1E' },
  classDetail: { fontSize: 14, color: '#666', marginTop: 2 },
  studentCount: { fontSize: 14, color: '#0062FF', fontWeight: '600' }
});

export default DashboardScreen;
