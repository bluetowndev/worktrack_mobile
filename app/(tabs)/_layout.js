import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      }}
      initialRouteName="UserDashboard"
    >
      {/* Dashboard - First */}
      <Tabs.Screen
        name="UserDashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              size={focused ? 26 : 24} 
              name="dashboard" 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
          tabBarLabel: "Dashboard",
        }}
      />

      {/* Camera - Middle */}
      <Tabs.Screen
        name="camera"
        options={{
          title: "Capture",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              size={focused ? 26 : 24} 
              name="camera-alt" 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
          tabBarLabel: "Capture",
        }}
      />

      {/* Profile - Last */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              size={focused ? 26 : 24} 
              name="person" 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}