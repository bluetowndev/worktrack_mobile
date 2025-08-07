import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Tab() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
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
        try {
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            setError('No user data found. Please log in again.');
          }
        } catch (parseError) {
          setError('Failed to load user data.');
        }
      } finally {
        setLoading(false);
        
        // Start animations
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
          })
        ]).start();
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      router.replace('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getFieldIcon = (key) => {
    const iconMap = {
      email: 'email',
      fullName: 'person',
      phoneNumber: 'phone',
      role: 'admin-panel-settings',
      organization: 'business',
      designation: 'work',
      state: 'location-on',
      baseLocation: 'location-city',
      companyName: 'domain',
      isVerified: 'verified',
      createdAt: 'schedule',
    };
    return iconMap[key] || 'info';
  };

  const renderUserField = (key, label, value, index) => (
    <Animated.View
      key={key}
      style={[
        styles.fieldContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.fieldHeader}>
        <MaterialIcons name={getFieldIcon(key)} size={20} color="#667eea" />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <Text style={styles.fieldValue}>
        {key === 'isVerified'
          ? value ? 'Verified' : 'Not Verified'
          : key === 'createdAt' || key === 'updatedAt'
          ? new Date(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : value || 'Not provided'}
      </Text>
    </Animated.View>
  );

  const renderUserDetails = () => {
    if (!user) return null;

    const fieldGroups = [
      {
        title: 'Personal Information',
        icon: 'person',
        fields: [
          { key: 'fullName', label: 'Full Name' },
          { key: 'email', label: 'Email' },
          { key: 'phoneNumber', label: 'Phone Number' },
          { key: 'role', label: 'Role' },
          { key: 'isVerified', label: 'Account Status' },
        ]
      },
      {
        title: 'Work Information',
        icon: 'work',
        fields: [
          { key: 'organization', label: 'Organization' },
          { key: 'designation', label: 'Designation' },
          { key: 'reportingManager', label: 'Reporting Manager' },
          { key: 'companyName', label: 'Company Name' },
        ]
      },
      {
        title: 'Location Details',
        icon: 'location-on',
        fields: [
          { key: 'state', label: 'State' },
          { key: 'baseLocation', label: 'Base Location' },
          { key: 'city', label: 'City' },
          { key: 'country', label: 'Country' },
          { key: 'zipCode', label: 'Zip Code' },
        ]
      }
    ];

    return fieldGroups.map((group, groupIndex) => (
      <Animated.View
        key={group.title}
        style={[
          styles.fieldGroup,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.groupHeader}>
          <MaterialIcons name={group.icon} size={24} color="#667eea" />
          <Text style={styles.groupTitle}>{group.title}</Text>
        </View>
        <View style={styles.groupContent}>
          {group.fields
            .filter(({ key }) => user[key] !== null && user[key] !== undefined && user[key] !== '')
            .map(({ key, label }, index) => 
              renderUserField(key, label, user[key], index)
            )}
        </View>
      </Animated.View>
    ));
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="white" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <MaterialIcons name="refresh" size={20} color="#667eea" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
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
            <MaterialIcons name="person" size={28} color="white" />
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {user?.fullName || 'User'}'s Profile Information
          </Text>
        </Animated.View>

        {/* Profile Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Summary Card */}
          <Animated.View 
            style={[
              styles.summaryCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }]
              }
            ]}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.avatar}
              >
                <MaterialIcons name="person" size={40} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.verificationBadge}>
                <MaterialIcons 
                  name={user?.isVerified ? "verified" : "pending"} 
                  size={16} 
                  color={user?.isVerified ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={[
                  styles.verificationText,
                  { color: user?.isVerified ? "#4CAF50" : "#FF9800" }
                ]}>
                  {user?.isVerified ? "Verified" : "Pending Verification"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* User Details */}
          {user && renderUserDetails()}

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f44336', '#d32f2f']}
                style={styles.logoutGradient}
              >
                <MaterialIcons name="logout" size={20} color="white" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  fieldGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  groupContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  actionContainer: {
    paddingTop: 10,
  },
  logoutButton: {
    marginBottom: 20,
  },
  logoutGradient: {
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
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});