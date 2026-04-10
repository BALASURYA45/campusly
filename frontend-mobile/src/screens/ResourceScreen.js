import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Linking
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ResourceScreen = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/resources`, config);
      setResources(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return 'play-circle-outline';
      case 'E-book': return 'file-pdf-box';
      case 'Link': return 'link-variant';
      default: return 'file-document-outline';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'Video': return '#0062FF';
      case 'E-book': return '#F44336';
      case 'Link': return '#00BCD4';
      default: return '#757575';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => Linking.openURL(`${IMAGE_BASE_URL}${item.fileUrl}`)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}15` }]}>
        <Icon name={getIcon(item.type)} size={32} color={getIconColor(item.type)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.subject}>{item.subject?.name}</Text>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.topic}>{item.topic}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Library</Text>
        <Text style={styles.headerSubtitle}>Study materials and lectures</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0062FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No resources available yet.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1C1E' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  list: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  iconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  content: { flex: 1 },
  subject: { fontSize: 10, fontWeight: '700', color: '#0062FF', textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '700', color: '#333', marginVertical: 2 },
  topic: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default ResourceScreen;
