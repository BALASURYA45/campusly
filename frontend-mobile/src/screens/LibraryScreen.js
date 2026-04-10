import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, TextInput, Image, Linking
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LibraryScreen = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/content`, config);
      setContents(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return 'play-circle';
      case 'E-Book': return 'book-open-page-variant';
      default: return 'file-document';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'Video': return '#F44336';
      case 'E-Book': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || c.contentType === selectedType;
    return matchesSearch && matchesType;
  });

  const renderContentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => Linking.openURL(item.fileUrl)}
    >
      <Image 
        source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400' }} 
        style={styles.thumbnail} 
      />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: getIconColor(item.contentType) + '15' }]}>
            <Icon name={getIcon(item.contentType)} size={12} color={getIconColor(item.contentType)} />
            <Text style={[styles.typeText, { color: getIconColor(item.contentType) }]}>{item.contentType}</Text>
          </View>
          <Text style={styles.subjectText}>{item.subject?.name}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>By {item.uploadedBy?.name}</Text>
          <Icon name="chevron-right" size={20} color="#CCC" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Library</Text>
        <Text style={styles.headerSubtitle}>Study anytime, anywhere</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={24} color="#94A3B8" />
          <TextInput
            placeholder="Search resources..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Video', 'E-Book', 'Study Material']}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterChip, selectedType === item && styles.activeChip]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[styles.filterText, selectedType === item && styles.activeFilterText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0062FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredContents}
          keyExtractor={(item) => item._id}
          renderItem={renderContentItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No resources found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  searchContainer: { paddingHorizontal: 20, marginTop: -20 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 56,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1E293B' },
  filterWrapper: { marginVertical: 20 },
  filterList: { paddingHorizontal: 20 },
  filterChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#FFF', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activeChip: { backgroundColor: '#0062FF', borderColor: '#0062FF' },
  filterText: { fontWeight: '600', color: '#64748B' },
  activeFilterText: { color: '#FFF' },
  list: { padding: 20 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  thumbnail: { width: '100%', height: 180 },
  cardContent: { padding: 20 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  typeText: { fontSize: 10, fontWeight: '800' },
  subjectText: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 24, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 },
  author: { fontSize: 12, color: '#94A3B8' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8', fontSize: 16 }
});

export default LibraryScreen;
