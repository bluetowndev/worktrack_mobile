import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const tileSize = (width - 60) / 2; // Adjust tile size for 2 columns with padding

// Separate TaskTile component to avoid hooks in render function
const TaskTile = ({ item, index, router }) => {
  const tileScaleAnim = useRef(new Animated.Value(1)).current;
  const tileOpacityAnim = useRef(new Animated.Value(0)).current;

  // Stagger animation for tiles
  useEffect(() => {
    Animated.timing(tileOpacityAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(tileScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(tileScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tileContainer,
        {
          opacity: tileOpacityAnim,
          transform: [{ scale: tileScaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          if (item.route) {
            router.push(item.route);
          } else {
            console.log(`Tapped: ${item.title}`);
          }
        }}
        style={styles.tile}
      >
        <LinearGradient 
          colors={item.colors} 
          style={styles.tileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tileIconContainer}>
            <MaterialIcons name={item.icon} size={32} color="white" />
          </View>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.tileSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.tileArrow}>
            <MaterialIcons name="arrow-forward-ios" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const UserDashboard = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-280))[0];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Enhanced menu options with icons
  const menuOptions = [
    { title: "Notices", route: "/notice", icon: "notifications", color: "#FF6B6B" },
    { title: "Apply for Leave", route: "/applyforleave", icon: "event-available", color: "#4ECDC4" },
    { title: "Holiday", route: "/holiday", icon: "beach-access", color: "#45B7D1" },
    { title: "Employee Detail", route: "/employeedetail", icon: "person", color: "#96CEB4" },
    { title: "Calendar", route: "/calendar", icon: "calendar-today", color: "#FCEA2B" },
    { title: "Claim", route: "/claim", icon: "receipt", color: "#FF9F43" },
    { title: "Assigned", route: "/assigned", icon: "assignment", color: "#A55EEA" },
  ];

  // Enhanced task cards with modern design
  const tasks = [
    {
      id: "1",
      title: "View Records",
      subtitle: "Check attendance history",
      icon: "view-list",
      colors: ["#667eea", "#764ba2"],
      route: "/AttendanceRecord",
    },
    {
      id: "2",
      title: "Map View", 
      subtitle: "Track location visits",
      icon: "map",
      colors: ["#f093fb", "#f5576c"],
      route: "/mapview",
    },
    {
      id: "3",
      title: "Quick Actions",
      subtitle: "Access common features",
      icon: "flash-on",
      colors: ["#4facfe", "#00f2fe"],
    },
    {
      id: "4",
      title: "Reports",
      subtitle: "View analytics & stats",
      icon: "analytics",
      colors: ["#43e97b", "#38f9d7"],
    },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogout = () => {
    router.replace("/Login");
  };

  const toggleMenu = () => {
    if (menuVisible) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(false);
      });
    } else {
      // Open menu
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderTaskTile = ({ item, index }) => {
    return <TaskTile item={item} index={index} router={router} />;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <SafeAreaView style={styles.container}>
        {/* Backdrop Overlay */}
        {menuVisible && (
          <Animated.View 
            style={[
              styles.backdrop,
              {
                opacity: slideAnim.interpolate({
                  inputRange: [-280, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropTouchable}
              onPress={toggleMenu}
              activeOpacity={1}
            />
          </Animated.View>
        )}

        {/* Enhanced Sidebar */}
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient 
            colors={['#667eea', '#764ba2']} 
            style={styles.sidebarGradient}
          >
            {/* Sidebar Header */}
            <View style={styles.sidebarHeader}>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.sidebarLogo}>
                <MaterialIcons name="work" size={40} color="white" />
                <Text style={styles.sidebarTitle}>WorkTrack</Text>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
              {menuOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route);
                      toggleMenu();
                    }
                  }}
                  style={styles.menuItem}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon} size={20} color="white" />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Enhanced Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <MaterialIcons name="menu" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="work" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>WorkTrack</Text>
              </View>
              
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <MaterialIcons name="logout" size={20} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Welcome Section */}
          <Animated.View 
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Choose an action to get started with your field work
            </Text>
          </Animated.View>

          {/* Task Grid */}
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <FlatList
              data={tasks}
              renderItem={renderTaskTile}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridContainer}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Backdrop Styles
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  backdropTouchable: {
    flex: 1,
  },

  // Sidebar Styles
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarGradient: {
    flex: 1,
    paddingTop: 50,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sidebarLogo: {
    alignItems: 'center',
  },
  sidebarTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  // Main Content Styles
  mainContent: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
  },

  // Content Container
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Tile Styles
  tileContainer: {
    width: (width - 48) / 2,
  },
  tile: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tileGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  tileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tileSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
  },
  tileArrow: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default UserDashboard;