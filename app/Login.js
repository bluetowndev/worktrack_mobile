import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from '@env';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("default");
  const navigation = useNavigation();

  // Verify modules are available on component mount
  useEffect(() => {
    console.log('Battery module available:', !!Battery);
    console.log('Device module available:', !!Device);
    console.log(`At login: ${API_URL}`)
  }, []);

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
    if (!email || !password) {
      showSnackbar("All fields must be filled", "error");
      return;
    }

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
            navigation.navigate("AdminTabs", { user: data.user });
          } else {
            navigation.navigate("(tabs)", { user: data.user });
          }
        }, 2000);
      } else {
        showSnackbar(data.message || "Incorrect email or password", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please check your connection or server status.";
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <LinearGradient colors={["#4A90E2", "#9013FE"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 20 }}>
          Welcome Back
        </Text>
        <Text style={{ fontSize: 16, color: "#ddd", textAlign: "center", marginBottom: 20 }}>
          Please add your email address and password
        </Text>
        
        {/* Email Input */}
        <TextInput
          style={{
            width: "100%",
            height: 50,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            paddingHorizontal: 15,
            fontSize: 18,
            backgroundColor: "white",
            marginBottom: 15,
          }}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Password Input */}
        <View style={{ width: "100%", position: "relative", marginBottom: 15 }}>
          <TextInput
            style={{
              width: "100%",
              height: 50,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              paddingHorizontal: 15,
              fontSize: 18,
              backgroundColor: "white",
            }}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 15, top: 15 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Login Button */}
        <TouchableOpacity
          style={{
            width: "100%",
            backgroundColor: "#000",
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 10,
          }}
          onPress={handleLogin}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === "error" ? "#D22B2B" : "#4CAF50",
        }}
      >
        <Text style={{ color: "white" }}>{snackbarMessage}</Text>
      </Snackbar>
    </LinearGradient>
  );
}