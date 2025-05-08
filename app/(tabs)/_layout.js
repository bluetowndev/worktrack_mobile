import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
      }}
      initialRouteName="UserDashboard" // Set Dashboard as the initial screen
    >
      {/* Dashboard - First */}
      <Tabs.Screen
        name="UserDashboard"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="tachometer" color={color} />
          ),
        }}
      />

      {/* Camera - Middle */}
      <Tabs.Screen
        name="camera"
        options={{
          headerShown: false,
          title: "Camera",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="camera" color={color} />
          ),
        }}
      />

      {/* Profile - Last */}
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}