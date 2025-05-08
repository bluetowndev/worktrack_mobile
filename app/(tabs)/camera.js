import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions, ScrollView, TextInput } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';

// Get screen dimensions for proper layout
const { width, height } = Dimensions.get('window');

export default function Tab() {
  const [hasPermission, setHasPermission] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [userId, setUserId] = useState(null); // Initialize as null until fetched
  const cameraRef = useRef(null);

  // List of purpose options
  const purposeOptions = [
    { label: 'Select Purpose', value: '' },
    { label: 'Check In', value: 'Check In' },
    { label: 'On Leave', value: 'On Leave' },
    { label: 'Site Visit', value: 'Site Visit' },
    { label: 'BSNL Office Visit', value: 'BSNL Office Visit' },
    { label: 'BT Office Visit', value: 'BT Office Visit' },
    { label: 'New Site Survey', value: 'New Site Survey' },
    { label: 'Official Tour- Out of station', value: 'Official Tour- Out of station' },
    { label: 'New business generation- Client Meeting', value: 'New business generation- Client Meeting' },
    { label: 'Existing client meeting', value: 'Existing client meeting' },
    { label: 'Preventive measures', value: 'Preventive measures' },
    { label: 'Others', value: 'Others' },
    { label: 'Check out', value: 'Check out' },
  ];

  // Fetch userId from AsyncStorage and request permissions
  useEffect(() => {
    // console.log(`At Camera: ${API_URL}`)
    (async () => {
      try {
        // Fetch userId from AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          alert('No user ID found. Please log in.');
        }

        // Request camera permission
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(cameraStatus === 'granted');

        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          alert('Location permission is required to fetch coordinates.');
        }
      } catch (error) {
        console.log('Error fetching userId or permissions:', error);
        alert('An error occurred while initializing the app.');
      }
    })();
  }, []);

  // Capture snapshot and fetch location
  const captureSnapshot = async () => {
    if (cameraRef.current) {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync();
      setSnapshot(photo.uri);

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.log("Error fetching location:", error);
        alert('Error fetching location: ' + error.message);
      }

      setLoading(false);
    }
  };

  // Handle details input with 50 character limit
  const handleDetailsChange = (text) => {
    if (text.length <= 50) {
      setDetails(text);
    }
  }; 

   // Refresh token if expired
   const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const response = await fetch(`${API_URL}/user/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const result = await response.json();
      if (result.success) {
        await AsyncStorage.setItem('accessToken', result.accessToken);
        return result.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      alert('Session expired. Please log in again.');
      navigation.navigate('Login');
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!snapshot || !location || !selectedPurpose || !userId) {
      alert('Please capture a snapshot, allow location, select a purpose, and ensure you are logged in.');
      return;
    }

    try {
      setLoading(true);

      // Compress and resize the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        snapshot,
        [{ resize: { width: 300 } }], // Resize to 300px width
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // 50% quality
      );

      // Convert to base64
      const base64Image = await FileSystem.readAsStringAsync(compressedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const image = `data:image/jpeg;base64,${base64Image}`;

      // Optional: Get location name
      let locationName = 'Unknown';
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (geocode.length > 0) {
          locationName = `${geocode[0].city || ''}, ${geocode[0].region || ''}`;
        }
      } catch (error) {
        console.log('Error reverse geocoding:', error);
      }

      const submissionData = {
        image, // Send base64 image, matching MERN project
        location: JSON.stringify({ lat: location.latitude, lng: location.longitude }), // Stringify location to match MERN
        locationName,
        purpose: selectedPurpose,
        subPurpose: details || 'N/A',
        feedback: details || 'N/A',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        userId: parseInt(userId, 10),
      };

      let token = await AsyncStorage.getItem('accessToken');
      // console.log('Submitting to URL:', `${API_URL}/user/attendance`);
      // console.log('Submission Data:', submissionData);
      // console.log('Authorization Token:', token);
      // console.log('Base64 Image Size (KB):', (image.length * 0.75) / 1024); // Approximate size in KB

      let response = await fetch(`${API_URL}/user/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.status === 401) {
        // Token expired, try refreshing
        token = await refreshToken();
        if (token) {
          response = await fetch(`${API_URL}/user/attendance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(submissionData),
          });
        }
      }

      // console.log('Response Status:', response.status);
      // console.log('Response Headers:', [...response.headers.entries()]);

      const responseText = await response.text();
      // console.log('Raw Response:', responseText);

      const result = JSON.parse(responseText);

      if (result.success) {
        alert('Attendance submitted successfully!');
        setSnapshot(null);
        setLocation(null);
        setSelectedPurpose('');
        setDetails('');
      } else {
        alert('Failed to submit attendance: ' + result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Requesting permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, styles.error]}>No access to the camera</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#4F46E5', '#A5B4FC']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>📷 Capture Moment</Text>

          {/* Camera Section */}
          <View style={styles.card}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
            <TouchableOpacity onPress={captureSnapshot} style={styles.captureButton} disabled={loading}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />}

          {/* Results Section */}
          {snapshot && (
            <View style={styles.resultCard}>
              {/* Snapshot Preview */}
              <Image source={{ uri: snapshot }} style={styles.image} />

              {/* Location */}
              {location ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>📍 Lat: {location.latitude.toFixed(4)}</Text>
                  <Text style={styles.infoText}>📍 Lon: {location.longitude.toFixed(4)}</Text>
                </View>
              ) : (
                <Text style={styles.infoText}>Fetching location...</Text>
              )}

              {/* Purpose Dropdown */}
              <Text style={styles.label}>Purpose</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedPurpose}
                  onValueChange={(itemValue) => setSelectedPurpose(itemValue)}
                  style={styles.picker}
                >
                  {purposeOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>

              {/* Details Input */}
              <Text style={styles.label}>Details (max 50 chars)</Text>
              <TextInput
                style={styles.textInput}
                value={details}
                onChangeText={handleDetailsChange}
                placeholder="Enter details..."
                placeholderTextColor="#9CA3AF"
                maxLength={50}
              />
              <Text style={styles.charCount}>{details.length}/50</Text>

              {/* Submit Button */}
              <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: height * 0.35,
    borderRadius: 15,
  },
  captureButton: {
    marginTop: 15,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: height * 0.3,
    borderRadius: 15,
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#374151',
  },
  textInput: {
    width: '100%',
    height: 45,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  message: {
    fontSize: 16,
    color: '#374151',
  },
  error: {
    color: '#EF4444',
  },
});