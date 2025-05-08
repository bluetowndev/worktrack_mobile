 import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

// Dummy data for punch-in and punch-out times with location
const punchTimes = {
  "2025-01-20": {
    punchIn: "9:00 AM",
    punchInLocation: "Bihar",
    punchOut: "5:00 PM",
    punchOutLocation: "Jharkhand",
  },
  "2025-01-21": {
    punchIn: "9:30 AM",
    punchInLocation: "Delhi",
    punchOut: "5:30 PM",
    punchOutLocation: "Ghaziabad",
  },
  "2025-01-22": {
    punchIn: "9:00 AM",
    punchInLocation: "Chhatisgarh",
    punchOut: "--",
    punchOutLocation: "--",
  },
};

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState("");

  // Handle date selection from the calendar
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Fetch punch-in and punch-out times with locations for the selected day
  const getPunchTimes = (date) => {
    const punch = punchTimes[date];
    if (punch) {
      return (
        <View style={styles.punchContainer}>
          <Text style={styles.punchText}>Punch In: {punch.punchIn}</Text>
          <Text style={styles.punchText}>Punch In Location: {punch.punchInLocation}</Text>
          <Text style={styles.punchText}>Punch Out: {punch.punchOut}</Text>
          <Text style={styles.punchText}>Punch Out Location: {punch.punchOutLocation}</Text>
        </View>
      );
    }
    return <Text style={styles.noPunchText}>No punches for this date</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Stylish Header with Gradient Background */}
      <Text style={styles.header}>🕒 Your Attendance</Text>
      
      {/* Calendar Component */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={Object.keys(punchTimes).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: "#ff6f61" };
            return acc;
          }, {})}
          theme={{
            todayTextColor: "#ff6347",
            arrowColor: "#1f2937",
            monthTextColor: "#1f2937",
            selectedDayBackgroundColor: "#ff6f61",
            selectedDayTextColor: "#fff",
          }}
        />
      </View>

      {/* Punch In and Out Times for the selected date */}
      <ScrollView style={styles.detailsContainer}>
        {selectedDate ? (
          <>
            <Text style={styles.dateText}>Details for {selectedDate}</Text>
            {getPunchTimes(selectedDate)}
          </>
        ) : (
          <Text style={styles.selectDateText}>Select a date to view attendance</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#ff6f61",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  calendarContainer: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  dateText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 15,
  },
  punchContainer: {
    padding: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 6,
    borderLeftColor: "#ff6f61", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  punchText: {
    fontSize: 18,
    color: "#1f2937",
    marginBottom: 7,
  },
  noPunchText: {
    fontSize: 18,
    color: "#9ca3af",
  },
  selectDateText: {
    fontSize: 18,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default Attendance;
