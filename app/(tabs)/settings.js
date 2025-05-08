import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

export default function Tab() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No access token found');

        const response = await axios.get(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to AsyncStorage if API fails
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const renderUserDetails = () => {
    if (!user) return null;

    const fields = {
      id: 'ID',
      email: 'Email',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      reportingManager: 'Reporting Manager',
      state: 'State',
      baseLocation: 'Base Location',
      role: 'Role',
      organization: 'Organization',
      designation: 'Designation',
      companyName: 'Company Name',
      companyPhone: 'Company Phone',
      companyAddress: 'Company Address',
      country: 'Country',
      city: 'City',
      zipCode: 'Zip Code',
      industry: 'Industry',
      isVerified: 'Verified',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
    };

    return Object.entries(fields)
      .filter(([key]) => user[key] !== null && user[key] !== undefined)
      .map(([key, label]) => (
        <View key={key} className="flex-row justify-between py-2 border-b border-gray-200">
          <Text className="text-md text-gray-700 font-semibold">{label}:</Text>
          <Text className="text-md text-gray-800">
            {key === 'isVerified'
              ? user[key] ? 'Yes' : 'No'
              : key === 'createdAt' || key === 'updatedAt'
              ? new Date(user[key]).toLocaleDateString()
              : user[key]}
          </Text>
        </View>
      ));
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-blue-600 p-4">
        <Text className="text-lg font-bold text-white text-center">Settings</Text>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-md text-gray-500">Loading user data...</Text>
        </View>
      ) : user ? (
        <ScrollView className="flex-1 p-4">
          <View className="bg-white rounded-lg shadow p-4">
            <Text className="text-xl font-bold text-blue-600 mb-4">User Details</Text>
            {renderUserDetails()}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-md text-gray-500">No user data found. Please log in.</Text>
        </View>
      )}
    </View>
  );
}