import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const tileSize = (width - 60) / 2; // Adjust tile size for 2 columns with padding

const UserDashboard = () => {
  const router = useRouter();
  const [absentees, setAbsentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAbsentees, setShowAbsentees] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  const menuOptions = [
    { title: "📢 Notices", route: "/notice" },
    { title: "Apply for Leave", route: "/applyforleave" },
    { title: "Holiday", route: "/holiday" },
    { title: "Employee Detail", route: "/employeedetail" },
    { title: "Calendar", route: "/calendar" },
    { title: "Claim", route: "/claim" },
    { title: "Assigned", route: "/assigned" },
    { title: "Absent Today", action: "fetchAbsentees" },
  ];

  const tasks = [
    {
      id: "1",
      title: "View Record",
      icon: "people",
      colors: ["#FF6B6B", "#FF8E53"],
      route: "/AttendanceRecord",
    },
    {
      id: "2",
      title: "Complete Design Review",
      icon: "brush",
      colors: ["#4ECDC4", "#45B7D1"],
    },
    {
      id: "3",
      title: "Submit Project Proposal",
      icon: "description",
      colors: ["#96CEB4", "#A8E6CF"],
    },
  ];

  const handleLogout = () => {
    router.replace("/Login");
  };

  const fetchAbsentees = async () => {
    try {
      setLoading(true);
      setShowAbsentees(false);
      const response = await fetch(
        "https://backend-xre7.onrender.com/api/user/users-without-attendance"
      );
      const data = await response.json();
      setAbsentees(data);
      setShowAbsentees(true);
    } catch (error) {
      console.error("Error fetching absentees:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const renderTaskTile = ({ item }) => {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          if (item.route) {
            router.push(item.route);
          } else {
            console.log(`Tapped: ${item.title}`);
          }
        }}
      >
        <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={item.colors} style={styles.tileGradient}>
            <MaterialIcons name={item.icon} size={40} color="white" style={styles.tileIcon} />
            <Text style={styles.tileText} numberOfLines={2}>
              {item.title}
            </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F0F5" }}>
      <Animated.View
        style={{
          position: "absolute",
          left: slideAnim,
          top: 0,
          bottom: 0,
          width: 250,
          backgroundColor: "#6C63FF",
          paddingVertical: 40,
          paddingHorizontal: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={toggleMenu} style={{ alignSelf: "flex-end", marginBottom: 20 }}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        {menuOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.route) {
                router.push(item.route);
                toggleMenu();
              } else if (item.action === "fetchAbsentees") {
                fetchAbsentees();
                toggleMenu();
              }
            }}
            style={{ paddingVertical: 12 }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <LinearGradient
        colors={["#6C63FF", "#9C63FF"]}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>WorkTrack</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        key={`flatlist-${showAbsentees ? "with-header" : "without-header"}`} // Dynamic key to force re-render
        ListHeaderComponent={
          showAbsentees && (
            <View
              style={{
                backgroundColor: "white",
                padding: 15,
                borderRadius: 10,
                marginBottom: 15,
                marginHorizontal: 15,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                Absentees List
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color="#6C63FF" />
              ) : absentees.length > 0 ? (
                absentees.map((item) => (
                  <View
                    key={item._id}
                    style={{
                      backgroundColor: "#EFEFEF",
                      padding: 10,
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: "#333", fontSize: 16 }}>{item.fullName}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#777", marginTop: 10 }}>No absentees found.</Text>
              )}
            </View>
          )
        }
        contentContainerStyle={{ padding: 15 }}
        data={tasks}
        renderItem={renderTaskTile}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: tileSize,
    height: tileSize,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  tileGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  tileIcon: {
    marginBottom: 10,
  },
  tileText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default UserDashboard;