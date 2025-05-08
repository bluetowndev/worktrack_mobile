import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const EmployeeDetailScreen = () => {
  // Mock employee data
  const employeeDetails = {
    name: "Raj Jha",
    employeeId: "EMP12345",
    designation: "Field Engineer",
    department: "IT",
    reportingManager: "Priya",
    stateCircle: "Jhansi",
    dateOfJoining: "2022-06-15",
    email: "Raj.jha@example.com",
    contactNumber: "+1234567890",
    baseLocation: "Ranchi",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Employee Details</Text>

      {/* Employee Details */}
      {Object.entries(employeeDetails).map(([key, value]) => (
        <View style={styles.detailItem} key={key}>
          <Text style={styles.label}>
            {key
              .replace(/([A-Z])/g, " $1") // Add spaces before uppercase letters
              .replace(/^./, (str) => str.toUpperCase())}{" "}
            {/* Capitalize first letter */}
          </Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  detailItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  value: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 5,
  },
});

export default EmployeeDetailScreen;
