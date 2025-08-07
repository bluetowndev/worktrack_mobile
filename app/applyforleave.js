import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ApplyForLeaveScreen = () => {
  const router = useRouter();
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  // Handle date selection
  const handleDayPress = (day) => {
    setSelectedDates((prevDates) => ({
      ...prevDates,
      [day.dateString]: {
        selected: !prevDates[day.dateString]?.selected,
        marked: true,
        selectedColor: "#4CAF50",
      },
    }));
  };

  // Submit leave application
  const handleSubmit = async () => {
    if (!selectedLeaveType || Object.keys(selectedDates).filter(date => selectedDates[date].selected).length === 0 || !reason.trim()) {
      Alert.alert("Error", "Please fill all fields before submitting.");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedDatesCount = Object.keys(selectedDates).filter(date => selectedDates[date].selected).length;
      Alert.alert(
        "Success",
        `Leave application submitted successfully for ${selectedDatesCount} day(s) as ${selectedLeaveType}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
      
      // Reset form
      setSelectedLeaveType("");
      setSelectedDates({});
      setReason("");
      setLoading(false);
    }, 1500);
  };

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <MaterialIcons name="event-available" size={28} color="white" />
              <Text style={styles.headerTitle}>Apply for Leave</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Submit your leave application</Text>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Leave Type Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <MaterialIcons name="category" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Leave Type</Text>
            </View>
            <View style={styles.pickerContainer}>
              <MaterialIcons name="work-off" size={20} color="#667eea" style={styles.inputIcon} />
              <Picker
                selectedValue={selectedLeaveType}
                onValueChange={(itemValue) => setSelectedLeaveType(itemValue)}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Select Leave Type" value="" />
                <Picker.Item label="Sick Leave" value="Sick Leave" />
                <Picker.Item label="Casual Leave" value="Casual Leave" />
                <Picker.Item label="Earned Leave" value="Earned Leave" />
                <Picker.Item label="Vacation" value="Vacation" />
                <Picker.Item label="Personal Leave" value="Personal Leave" />
              </Picker>
            </View>
          </Animated.View>

          {/* Date Selection Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <MaterialIcons name="calendar-today" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Select Dates</Text>
              {Object.keys(selectedDates).filter(date => selectedDates[date].selected).length > 0 && (
                <Text style={styles.selectedCount}>
                  {Object.keys(selectedDates).filter(date => selectedDates[date].selected).length} day(s)
                </Text>
              )}
            </View>
            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={selectedDates}
                onDayPress={handleDayPress}
                theme={{
                  selectedDayBackgroundColor: "#667eea",
                  todayTextColor: "#667eea",
                  arrowColor: "#667eea",
                  monthTextColor: "#333",
                  textDayFontWeight: "500",
                  textMonthFontWeight: "600",
                  textDayHeaderFontWeight: "600",
                  calendarBackground: "white",
                  dayTextColor: "#333",
                  textDisabledColor: "#ccc",
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </View>
          </Animated.View>

          {/* Reason Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Reason for Leave</Text>
            </View>
            <View style={styles.textInputContainer}>
              <MaterialIcons name="edit" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter detailed reason for your leave..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View 
            style={[
              styles.submitSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#999'] : ['#4CAF50', '#45a049']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <MaterialIcons name="hourglass-empty" size={20} color="white" />
                ) : (
                  <MaterialIcons name="send" size={20} color="white" />
                )}
                <Text style={styles.submitText}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitSection: {
    paddingTop: 10,
  },
  submitButton: {
    marginBottom: 20,
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
});

export default ApplyForLeaveScreen;
