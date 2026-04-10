import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const getAuthHeader = async () => {
  const userStr = await AsyncStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const submitAttendance = async (attendanceRecords) => {
  const headers = await getAuthHeader();
  return axios.post(`${API_BASE_URL}/attendance`, { attendanceRecords }, { headers });
};

export const fetchClassAttendance = async (classId) => {
  const headers = await getAuthHeader();
  return axios.get(`${API_BASE_URL}/attendance/class/${classId}`, { headers });
};
