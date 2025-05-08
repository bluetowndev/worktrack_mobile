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

const Assigned = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete React Native Module",
      deadline: "2025-01-31",
      description:
        "Complete the React Native module by January 31, 2025, and submit the project for review.",
    },
    {
      id: 2,
      title: "Prepare UI/UX Design for Dashboard",
      deadline: "2025-02-05",
      description:
        "Design a user-friendly dashboard interface and submit it for approval by February 5, 2025.",
    },
    {
      id: 3,
      title: "Update Documentation",
      deadline: "2025-01-28",
      description:
        "Revise and update the project documentation to reflect the latest changes before the next team meeting.",
    },
  ]);

  const handleTaskPress = (task) => {
    Alert.alert(task.title, `Deadline: ${task.deadline}\n\n${task.description}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Assigned Tasks</Text>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => handleTaskPress(item)}
          >
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDeadline}>{item.deadline}</Text>
            </View>
            <Text style={styles.taskDescription} numberOfLines={2}>
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
    backgroundColor: "#f4f4f4",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6C63FF",
    textAlign: "center",
    marginVertical: 15,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  taskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  taskDeadline: {
    fontSize: 14,
    color: "#6C63FF",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
  },
});

export default Assigned;
