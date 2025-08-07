import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions, 
  ScrollView, 
  TextInput,
  Animated,
  StatusBar,
  Platform
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { useRouter } from 'expo-router';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons } from '@expo/vector-icons';

// Get screen dimensions for proper layout
const { width, height } = Dimensions.get('window');

export default function Tab() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [userId, setUserId] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const cameraRef = useRef(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const captureScale = useRef(new Animated.Value(1)).current;

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

        // Initialize animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          })
        ]).start();
      } catch (error) {
        console.log('Error fetching userId or permissions:', error);
        alert('An error occurred while initializing the app.');
      }
    })();
  }, []);

  // Capture snapshot and fetch location
  const captureSnapshot = async () => {
    if (cameraRef.current) {
      // Button animation
      Animated.sequence([
        Animated.timing(captureScale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(captureScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();

      setLoading(true);
      setLocationLoading(true);
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setSnapshot(photo.uri);

        // Fetch location
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocationLoading(false);
      } catch (error) {
        console.log("Error fetching location:", error);
        alert('Error fetching location: ' + error.message);
        setLocationLoading(false);
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
      router.replace('/Login');
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
      setSubmitLoading(true);

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
      setSubmitLoading(false);
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
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.headerContent}>
              <MaterialIcons name="camera-alt" size={28} color="white" />
              <Text style={styles.title}>Capture Attendance</Text>
            </View>
            <Text style={styles.subtitle}>Take a photo to record your presence</Text>
          </Animated.View>

          {/* Camera Section */}
          <Animated.View 
            style={[
              styles.cameraSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.cameraCard}>
              <View style={styles.cameraContainer}>
                <CameraView 
                  ref={cameraRef} 
                  style={styles.camera} 
                  facing="front"
                  onCameraReady={() => setCameraReady(true)}
                />
                {!cameraReady && (
                  <View style={styles.cameraLoading}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
                  </View>
                )}
              </View>
              
              <Animated.View style={{ transform: [{ scale: captureScale }] }}>
                <TouchableOpacity 
                  onPress={captureSnapshot} 
                  style={[styles.captureButton, loading && styles.captureButtonDisabled]}
                  disabled={loading || !cameraReady}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={loading ? ['#ccc', '#999'] : ['#4CAF50', '#45a049']}
                    style={styles.captureGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size={20} color="white" />
                    ) : (
                      <MaterialIcons name="camera-alt" size={24} color="white" />
                    )}
                    <Text style={styles.captureText}>
                      {loading ? 'Capturing...' : 'Take Photo'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Results Section */}
          {snapshot && (
            <Animated.View 
              style={[
                styles.resultSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Photo Preview */}
              <View style={styles.photoCard}>
                <Text style={styles.sectionTitle}>
                  <MaterialIcons name="photo" size={20} color="#667eea" /> Photo Preview
                </Text>
                <Image source={{ uri: snapshot }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.retakeButton}
                  onPress={() => {
                    setSnapshot(null);
                    setLocation(null);
                    setSelectedPurpose('');
                    setDetails('');
                  }}
                >
                  <MaterialIcons name="refresh" size={16} color="#667eea" />
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Location Info */}
              <View style={styles.locationCard}>
                <Text style={styles.sectionTitle}>
                  <MaterialIcons name="location-on" size={20} color="#667eea" /> Location
                </Text>
                {locationLoading ? (
                  <View style={styles.locationLoading}>
                    <ActivityIndicator size={16} color="#667eea" />
                    <Text style={styles.locationLoadingText}>Getting location...</Text>
                  </View>
                ) : location ? (
                  <View style={styles.locationInfo}>
                    <View style={styles.coordinateRow}>
                      <MaterialIcons name="my-location" size={16} color="#667eea" />
                      <Text style={styles.coordinateText}>
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.locationError}>Unable to fetch location</Text>
                )}
              </View>

              {/* Form Section */}
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>
                  <MaterialIcons name="edit" size={20} color="#667eea" /> Details
                </Text>
                
                {/* Purpose Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Purpose of Visit</Text>
                  <View style={styles.pickerWrapper}>
                    <MaterialIcons name="work" size={20} color="#667eea" style={styles.inputIcon} />
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
                </View>

                {/* Details Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Additional Details</Text>
                    <Text style={styles.charCounter}>{details.length}/50</Text>
                  </View>
                  <View style={styles.textInputWrapper}>
                    <MaterialIcons name="description" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={details}
                      onChangeText={handleDetailsChange}
                      placeholder="Enter additional details..."
                      placeholderTextColor="#999"
                      maxLength={50}
                      multiline
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, (!selectedPurpose || submitLoading) && styles.submitButtonDisabled]}
                  disabled={!selectedPurpose || submitLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={(!selectedPurpose || submitLoading) ? ['#ccc', '#999'] : ['#667eea', '#764ba2']}
                    style={styles.submitGradient}
                  >
                    {submitLoading ? (
                      <ActivityIndicator size={20} color="white" />
                    ) : (
                      <MaterialIcons name="send" size={20} color="white" />
                    )}
                    <Text style={styles.submitText}>
                      {submitLoading ? 'Submitting...' : 'Submit Attendance'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Camera Section Styles
  cameraSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cameraCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    height: height * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  captureButton: {
    width: '100%',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Results Section Styles
  resultSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Photo Card Styles
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  retakeText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },

  // Location Card Styles
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  locationLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  locationInfo: {
    paddingVertical: 5,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  coordinateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  locationError: {
    color: '#f44336',
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Form Card Styles
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Permission Styles
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