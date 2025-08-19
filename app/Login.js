import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from '@env';
import { Snackbar } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("default");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Verify modules are available on component mount
  useEffect(() => {
    console.log('Battery module available:', !!Battery);
    console.log('Device module available:', !!Device);
    console.log(`At login: ${API_URL}`);

    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const showSnackbar = (message, type = "default") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const requestPermissions = async () => {
    try {
      // Camera permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        showSnackbar("Camera permission denied", "error");
        return false;
      }
  
      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        showSnackbar("Location permission denied", "error");
        return false;
      }
  
      return true;
    } catch (error) {
      console.error("Permission Error:", error);
      showSnackbar(`Error requesting permissions: ${error.message}`, "error");
      return false;
    }
  };

  const getDeviceInfo = () => {
    try {
      return {
        brand: Device.brand || 'unknown',
        manufacturer: Device.manufacturer || 'unknown',
        modelName: Device.modelName || 'unknown',
        osName: Device.osName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
        deviceType: Device.deviceType || 'unknown',
        isDevice: Device.isDevice,
        totalMemory: Device.totalMemory ? `${Math.round(Device.totalMemory / (1024 * 1024))} MB` : 'unknown',
        supportedCpuArchitectures: Device.supportedCpuArchitectures?.join(', ') || 'unknown',
      };
    } catch (error) {
      console.warn('Error getting device info:', error);
      return { error: error.message };
    }
  };

  const getBatteryInfo = async () => {
    try {
      if (!Battery || typeof Battery.getBatteryLevelAsync !== 'function') {
        return { available: false, error: 'Battery API not available' };
      }
      
      const [level, state] = await Promise.all([
        Battery.getBatteryLevelAsync(),
        Battery.getBatteryStateAsync()
      ]);
      
      return {
        available: true,
        level: Math.round(level * 100) + '%',
        state: state === Battery.BatteryState.CHARGING ? 'Charging' : 'Not Charging',
        lowPowerMode: await Battery.isLowPowerModeEnabledAsync(),
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  };

  const handleLogin = async () => {
    // Validate form fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      showSnackbar("Please fix the errors below", "error");
      return;
    }

    setLoading(true);

    try {
      // console.log("Attempting login with:", { email, url: `${API_URL}/user/login` });

      // Get device and battery info
      const deviceInfo = getDeviceInfo();
      const batteryInfo = await getBatteryInfo();

      console.log('=== DEVICE INFORMATION ===');
      console.log(JSON.stringify(deviceInfo, null, 2));
      console.log('=== BATTERY INFORMATION ===');
      console.log(JSON.stringify(batteryInfo, null, 2));

      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
        deviceInfo,
        batteryInfo
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      // console.log("Login response:", data);

      if (response.status === 200 && data.success) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        // Request permissions after successful login
        const permissionsGranted = await requestPermissions();
        if (!permissionsGranted) {
          return;
        }

        showSnackbar("Login successful! Redirecting...", "success");
        setTimeout(() => {
          if (data.user.role === "ADMIN") {
            router.push("/(tabs)/UserDashboard");
          } else {
            router.push("/(tabs)/UserDashboard");
          }
        }, 2000);
      } else {
        showSnackbar(data.message || "Incorrect email or password", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please check your connection or server status.";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.logoBackground}
              >
                <MaterialIcons name="work" size={60} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your productive journey
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View 
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, emailError ? styles.inputError : null]}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onBlur={() => validateEmail(email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput, passwordError ? styles.inputError : null]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  onBlur={() => validatePassword(password)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#667eea" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
            
            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {
                router.push('/forgot-password');
              }}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#999'] : ['#4CAF50', '#45a049']}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="hourglass-empty" size={20} color="white" />
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <View style={styles.loginContainer}>
                    <MaterialIcons name="login" size={20} color="white" />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Additional Info */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialIcons name="security" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.infoText}>Secure login</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="cloud" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.infoText}>Cloud sync</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
        
        {/* Snackbar for notifications */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          style={[
            styles.snackbar,
            {
              backgroundColor: snackbarType === "error" ? "#f44336" : "#4CAF50",
            }
          ]}
        >
          <View style={styles.snackbarContent}>
            <MaterialIcons 
              name={snackbarType === "error" ? "error" : "check-circle"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
          </View>
        </Snackbar>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#ffcdd2',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  snackbar: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});