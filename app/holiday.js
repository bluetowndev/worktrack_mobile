import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ScrollView,
  } from "react-native";
  import { Calendar } from "react-native-calendars";
  
  const HolidayListScreen = () => {
    const [holidays, setHolidays] = useState([
      { id: 1, name: "New Year's Day", date: "2025-01-01" },
      { id: 2, name: "Republic Day", date: "2025-01-26" },
      { id: 3, name: "Holi", date: "2025-03-17" },
      { id: 4, name: "Good Friday", date: "2025-04-18" },
      { id: 5, name: "Independence Day", date: "2025-08-15" },
      { id: 6, name: "Diwali", date: "2025-11-12" },
      { id: 7, name: "Christmas", date: "2025-12-25" },
    ]);
  
    // Mark holidays on the calendar
    const markedDates = holidays.reduce((acc, holiday) => {
      acc[holiday.date] = {
        marked: true,
        dotColor: "#FF6F61",
        selected: true,
        selectedColor: "#FFD9D4",
      };
      return acc;
    }, {});
  
    return (
      <ScrollView style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>📅 Holiday List</Text>
  
        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Holiday Calendar</Text>
          <Calendar
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#FF6F61",
              todayTextColor: "#4CAF50",
              arrowColor: "#4CAF50",
              dotColor: "#FF6F61",
              monthTextColor: "#4CAF50",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
            }}
          />
        </View>
  
        {/* Holiday List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
          <FlatList
            data={holidays}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.holidayItem}>
                <Text style={styles.holidayName}>{item.name}</Text>
                <Text style={styles.holidayDate}>{item.date}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FAFAFA",
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: "#4CAF50",
      textAlign: "center",
      marginBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 10,
    },
    holidayItem: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    holidayName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
    },
    holidayDate: {
      fontSize: 16,
      fontWeight: "500",
      color: "#FF6F61",
    },
  });
  
  export default HolidayListScreen;
  