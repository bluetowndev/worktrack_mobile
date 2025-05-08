import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";

const ApplyForLeaveScreen = () => {
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [reason, setReason] = useState("");

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
  const handleSubmit = () => {
    if (!selectedLeaveType || Object.keys(selectedDates).length === 0 || !reason) {
      Alert.alert("Error", "Please fill all fields before submitting.");
      return;
    }
    Alert.alert(
      "Success",
      `Leave application submitted for ${
        Object.keys(selectedDates).length
      } day(s) as ${selectedLeaveType}.`
    );
    // Reset form
    setSelectedLeaveType("");
    setSelectedDates({});
    setReason("");
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>📝 Apply for Leave</Text>

      {/* Leave Type Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedLeaveType}
            onValueChange={(itemValue) => setSelectedLeaveType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Leave Type" value="" />
            <Picker.Item label="Sick Leave" value="Sick Leave" />
            <Picker.Item label="Casual Leave" value="Casual Leave" />
            <Picker.Item label="Earned Leave" value="Earned Leave" />
          </Picker>
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Dates</Text>
        <Calendar
          markedDates={selectedDates}
          onDayPress={handleDayPress}
          theme={{
            selectedDayBackgroundColor: "#4CAF50",
            todayTextColor: "#4CAF50",
            arrowColor: "#4CAF50",
          }}
        />
      </View>

      {/* Reason for Leave */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter reason for leave"
          multiline
          value={reason}
          onChangeText={setReason}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Application</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafe",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    height: 50,
    color: "#333",
    paddingHorizontal: 10,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ApplyForLeaveScreen;
