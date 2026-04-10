import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AssignmentScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [submissionUrls, setSubmissionUrls] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/assignments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAssignments(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAssignment = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/assignments/${id}/submit`, 
        { fileUrl: submissionUrls[id] },
        { headers: { Authorization: `Bearer ${user.token}` }}
      );
      Alert.alert('Success', 'Assignment submitted!');
    } catch (err) {
      Alert.alert('Error', 'Submission failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            <TextInput
              style={styles.input}
              placeholder="Submission URL"
              value={submissionUrls[item._id] || ''}
              onChangeText={(text) => setSubmissionUrls({...submissionUrls, [item._id]: text})}
            />
            <TouchableOpacity style={styles.button} onPress={() => submitAssignment(item._id)}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 15 },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  dueDate: { color: '#666', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: '#1976d2', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default AssignmentScreen;
