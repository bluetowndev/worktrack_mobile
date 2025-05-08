import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useNavigation } from "@react-navigation/native";

const OnBoarding = () => {
  const navigation = useNavigation();
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <Onboarding
        onDone={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
        pages={[
          {
            backgroundColor: "white",
            image: (
              <Image
                source={require("../assets/worktrack image.jpg")}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              />
            ),
            title: "Welcome to WorkTrack",
            subtitle: "Simplifying Field Work for You",
          },
          {
            backgroundColor: "#6C6EF5",
            image: (
              <Image
                source={require("../assets/worktrack image.jpg")}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              />
            ),
            title: "Manage Tasks",
            subtitle: "Track your field tasks with ease.",
          },
          {
            backgroundColor: "#333333",
            image: (
              <Image
                source={require("../assets/worktrack image.jpg")}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              />
            ),
            title: "Stay Organized",
            subtitle: "Boost your productivity every day.",
          },
        ]}
      />
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
      {/* Picture Section */}
      <Image
        source={require("../assets/worktrack image.jpg")}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />

      {/* WorkTrack Title */}
      <Text style={{ fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
        <Text style={{ color: "#6C6EF5" }}>Work</Text>
        <Text style={{ color: "black" }}>Track</Text>
      </Text>

      {/* Welcome Text */}
      <Text style={{ fontSize: 24, fontWeight: "600", color: "gray", textAlign: "center", marginBottom: 20 }}>
        Simplifying Field Work
      </Text>

      {/* Button Section */}
      <TouchableOpacity
        style={{ backgroundColor: "#6C6EF5", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnBoarding;
