import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
  } from "react-native";
  
  const NoticeScreen = () => {
    const [notices, setNotices] = useState([
      {
        id: 1,
        title: "Quarterly Team Meeting",
        date: "2025-01-30",
        description:
          "All employees are required to attend the quarterly team meeting scheduled on January 30, 2025, at 10:00 AM in the conference room.",
      },
      {
        id: 2,
        title: "Work From Home Policy Update",
        date: "2025-01-20",
        description:
          "Please note that the new work-from-home policy will take effect from February 1, 2025. For details, refer to the HR portal.",
      },
      {
        id: 3,
        title: "Holiday Reminder: Republic Day",
        date: "2025-01-26",
        description:
          "The office will remain closed on January 26, 2025, in observance of Republic Day. Happy holiday!",
      },
    ]);
  
    const handleNoticePress = (notice) => {
      Alert.alert(notice.title, notice.description);
    };
  
    return (
      <ScrollView style={styles.container}>
        {/* Screen Title */}
        <Text style={styles.title}>📢 Notices</Text>
  
        {/* Notice List */}
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.noticeItem}
              onPress={() => handleNoticePress(item)}
            >
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>{item.title}</Text>
                <Text style={styles.noticeDate}>{item.date}</Text>
              </View>
              <Text style={styles.noticeDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9fafe",
      padding: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: "#4A4E69",
      textAlign: "center",
      marginVertical: 20,
    },
    noticeItem: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    noticeContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    noticeTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#22223B",
    },
    noticeDate: {
      fontSize: 14,
      fontWeight: "500",
      color: "#9A8C98",
    },
    noticeDescription: {
      fontSize: 15,
      color: "#6C757D",
      lineHeight: 20,
    },
  });
  
  export default NoticeScreen;
  