import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="attendance" options={{ headerShown: false }} />
      <Stack.Screen name="AttendanceRecord" options={{ headerShown: false }} />
      <Stack.Screen name="Calendar" options={{ headerShown: false }} />
      <Stack.Screen name="Apply for Leave" options={{ headerShown: false }} />
      <Stack.Screen name="Holiday" options={{ headerShown: false }} />
      <Stack.Screen name="Notice" options={{ headerShown: false }} />
      <Stack.Screen name="Claim" options={{ headerShown: false }} />
      <Stack.Screen name="Employee Detail" options={{ headerShown: false }} />
      <Stack.Screen name="Logout" options={{ headerShown: false }} />
      <Stack.Screen name="mapview" options={{ headerShown: false }} />
    </Stack>
  );
}