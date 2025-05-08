import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Calendar } from "react-native-calendars";

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [punchTimes, setPunchTimes] = useState({});

  // Example marking data
  const markedDates = {
    "2025-01-20": { marked: true, dotColor: "green", selected: true, selectedColor: "green" }, // Present
    "2025-01-21": { marked: true, dotColor: "red", selected: true, selectedColor: "red" },    // Absent
    "2025-01-22": { marked: true, dotColor: "orange", selected: true, selectedColor: "orange" }, // Half Day
    "2025-01-23": { marked: true, dotColor: "blue", selected: true, selectedColor: "blue" }, // Leave
    "2025-01-24": { marked: true, dotColor: "green", selected: true, selectedColor: "green" }, // Present
    "2025-01-25": { marked: true, dotColor: "red", selected: true, selectedColor: "red" }, // Absent
  };

  // Count occurrences of each status
  const statusCounts = {
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  };

  Object.values(markedDates).forEach(({ dotColor }) => {
    if (dotColor === "green") statusCounts.present++;
    else if (dotColor === "red") statusCounts.absent++;
    else if (dotColor === "orange") statusCounts.halfDay++;
    else if (dotColor === "blue") statusCounts.leave++;
  });

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handlePunchIn = () => {
    if (selectedDate) {
      setPunchTimes((prev) => ({
        ...prev,
        [selectedDate]: { ...prev[selectedDate], punchIn: new Date().toLocaleTimeString() },
      }));
    }
  };

  const handlePunchOut = () => {
    if (selectedDate) {
      setPunchTimes((prev) => ({
        ...prev,
        [selectedDate]: { ...prev[selectedDate], punchOut: new Date().toLocaleTimeString() },
      }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Attendance Calendar</Text>
      </View>

      {/* Calendar */}
      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: "#6C63FF",
              marked: markedDates[selectedDate]?.marked ?? false,
              dotColor: markedDates[selectedDate]?.dotColor || "transparent",
            },
          }),
        }}
        onDayPress={onDayPress}
        theme={{
          todayTextColor: "#6C63FF",
          arrowColor: "#6C63FF",
          selectedDayBackgroundColor: "#6C63FF",
          selectedDayTextColor: "#ffffff",
          textDayFontWeight: "bold",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "bold",
        }}
      />

      {/* Legend with Counts */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "green" }]} />
          <Text style={styles.legendText}>Present: {statusCounts.present}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "red" }]} />
          <Text style={styles.legendText}>Absent: {statusCounts.absent}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "orange" }]} />
          <Text style={styles.legendText}>Half Day: {statusCounts.halfDay}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "blue" }]} />
          <Text style={styles.legendText}>Leave: {statusCounts.leave}</Text>
        </View>
      </View>

      {/* Selected Date Info */}
      {selectedDate ? (
        <View style={styles.details}>
          <Text style={styles.detailsText}>
            Selected Date: <Text style={styles.detailsDate}>{selectedDate}</Text>
          </Text>
          <Text style={styles.detailsText}>
            Status:{" "}
            <Text style={styles.detailsStatus}>
              {markedDates[selectedDate]
                ? markedDates[selectedDate].dotColor === "green"
                  ? "Present"
                  : markedDates[selectedDate].dotColor === "red"
                  ? "Absent"
                  : markedDates[selectedDate].dotColor === "orange"
                  ? "Half Day"
                  : "Leave"
                : "No status"}
            </Text>
          </Text>
          <Text style={styles.detailsText}>
            Punch In: {punchTimes[selectedDate]?.punchIn || "Not recorded"}
          </Text>
          <Text style={styles.detailsText}>
            Punch Out: {punchTimes[selectedDate]?.punchOut || "Not recorded"}
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Punch In" onPress={handlePunchIn} color="#6C63FF" />
            <Button title="Punch Out" onPress={handlePunchOut} color="#FF6363" />
          </View>
        </View>
      ) : (
        <Text style={styles.selectPrompt}>Select a date to see details.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  legend: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    color: "#333",
  },
  details: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailsDate: {
    fontWeight: "bold",
    color: "#6C63FF",
  },
  detailsStatus: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  selectPrompt: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default CalendarScreen;
