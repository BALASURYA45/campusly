import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config';
import { updateAuthUser } from '../store/authSlice';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const role = user?.role || user?.user?.role;
  const name = user?.name || user?.user?.name;
  const avatarUrl = user?.profileImage || user?.user?.profileImage;

  const handlePickImage = () => {
    Alert.alert(
      'Upload Photo',
      'Select a source',
      [
        { text: 'Camera', onPress: () => openPicker('camera') },
        { text: 'Gallery', onPress: () => openPicker('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openPicker = async (type) => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.7,
      includeBase64: false,
    };

    const result = type === 'camera' 
      ? await launchCamera(options) 
      : await launchImageLibrary(options);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Picker error');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: asset.uri,
      type: asset.type,
      name: asset.fileName || 'profile.jpg',
    });

    setUploading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.put(`${API_BASE_URL}/users/avatar`, formData, config);
      
      const updatedUser = { ...(user.user || user), profileImage: data.data };
      dispatch(updateAuthUser(updatedUser));
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
          <Image 
            source={{ uri: avatarUrl ? `${IMAGE_BASE_URL}${avatarUrl}` : 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View style={styles.editBadge}>
            <Text style={styles.editText}>Edit</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role?.toUpperCase()}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || user?.user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{role}</Text>
        </View>
        {user?.rollNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Roll Number</Text>
            <Text style={styles.infoValue}>{user.rollNumber}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  profileCard: { backgroundColor: '#FFF', padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#0062FF15' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0062FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  editText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: '#1A1C1E', marginTop: 16 },
  role: { fontSize: 14, color: '#0062FF', fontWeight: '700', marginTop: 4 },
  infoSection: { padding: 24, marginTop: 20 },
  infoRow: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#666', fontWeight: '600' },
  infoValue: { color: '#333', fontWeight: '700' },
  logoutButton: { margin: 24, padding: 16, borderRadius: 12, backgroundColor: '#F4433615', alignItems: 'center' },
  logoutText: { color: '#F44336', fontWeight: '700', fontSize: 16 }
});

export default ProfileScreen;
