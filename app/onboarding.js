import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  StatusBar
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const OnBoarding = () => {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // Custom Next Button Component
  const NextButton = ({ ...props }) => (
    <TouchableOpacity
      style={styles.nextButton}
      {...props}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.nextButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="arrow-forward" size={24} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );

  // Custom Done Button Component  
  const DoneButton = ({ ...props }) => (
    <TouchableOpacity
      style={styles.doneButton}
      {...props}
    >
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.doneButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="check" size={24} color="white" />
        <Text style={styles.doneButtonText}>Get Started</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Custom Skip Button Component
  const SkipButton = ({ ...props }) => (
    <TouchableOpacity
      style={styles.skipButton}
      {...props}
    >
      <Text style={styles.skipButtonText}>Skip</Text>
    </TouchableOpacity>
  );

  if (showOnboarding) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <Onboarding
          onDone={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
          NextButtonComponent={NextButton}
          DoneButtonComponent={DoneButton}
          SkipButtonComponent={SkipButton}
          bottomBarHighlight={false}
          showPagination={true}
          pages={[
            {
              backgroundColor: "#667eea",
              image: (
                <View style={styles.imageContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.imageBackground}
                  >
                    <Image
                      source={require("../assets/worktrack image.jpg")}
                      style={styles.onboardingImage}
                      resizeMode="contain"
                    />
                    <View style={styles.iconOverlay}>
                      <MaterialIcons name="work" size={60} color="rgba(255,255,255,0.9)" />
                    </View>
                  </LinearGradient>
                </View>
              ),
              title: "Welcome to WorkTrack",
              subtitle: "Your ultimate field work companion. Streamline your tasks, track attendance, and boost productivity with our comprehensive solution.",
              titleStyles: styles.onboardingTitle,
              subTitleStyles: styles.onboardingSubtitle,
            },
            {
              backgroundColor: "#764ba2",
              image: (
                <View style={styles.imageContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.imageBackground}
                  >
                    <Image
                      source={require("../assets/worktrack image.jpg")}
                      style={styles.onboardingImage}
                      resizeMode="contain"
                    />
                    <View style={styles.iconOverlay}>
                      <MaterialIcons name="assignment" size={60} color="rgba(255,255,255,0.9)" />
                    </View>
                  </LinearGradient>
                </View>
              ),
              title: "Smart Task Management",
              subtitle: "Effortlessly manage your field tasks with intelligent tracking, real-time updates, and seamless coordination.",
              titleStyles: styles.onboardingTitle,
              subTitleStyles: styles.onboardingSubtitle,
            },
            {
              backgroundColor: "#4facfe",
              image: (
                <View style={styles.imageContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.imageBackground}
                  >
                    <Image
                      source={require("../assets/worktrack image.jpg")}
                      style={styles.onboardingImage}
                      resizeMode="contain"
                    />
                    <View style={styles.iconOverlay}>
                      <MaterialIcons name="trending-up" size={60} color="rgba(255,255,255,0.9)" />
                    </View>
                  </LinearGradient>
                </View>
              ),
              title: "Enhanced Productivity",
              subtitle: "Transform your workflow with advanced analytics, automated reporting, and intelligent insights to maximize your efficiency.",
              titleStyles: styles.onboardingTitle,
              subTitleStyles: styles.onboardingSubtitle,
            },
          ]}
        />
      </>
    );
  }

  return (
    <LinearGradient 
      colors={['#4facfe', '#00f2fe']} 
      style={styles.welcomeContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4facfe" />
      
      {/* Animated Welcome Section */}
      <View style={styles.welcomeContent}>
        {/* Enhanced Picture Section */}
        <View style={styles.welcomeImageContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
            style={styles.welcomeImageBackground}
          >
            <Image
              source={require("../assets/worktrack image.jpg")}
              style={styles.welcomeImage}
              resizeMode="contain"
            />
            <View style={styles.welcomeIconOverlay}>
              <MaterialIcons name="work" size={80} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Welcome Text */}
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>
            Welcome to WorkTrack!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Transform your productivity with our comprehensive field work management solution. Track tasks, manage attendance, and achieve your goals with unprecedented ease.
          </Text>
        </View>

        {/* Enhanced Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push("/Login")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.getStartedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="arrow-forward" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.getStartedText}>
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <MaterialIcons name="location-on" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>GPS Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="camera-alt" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>Photo Capture</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="analytics" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>Analytics</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Onboarding styles
  nextButton: {
    marginRight: 15,
  },
  nextButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButton: {
    marginRight: 15,
  },
  doneButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    marginLeft: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onboardingImage: {
    width: '80%',
    height: '80%',
    borderRadius: width * 0.28,
  },
  iconOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 35,
    padding: 10,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeImageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeImageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  welcomeImage: {
    width: '80%',
    height: '80%',
    borderRadius: width * 0.24,
  },
  welcomeIconOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 45,
    padding: 15,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    marginBottom: 40,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OnBoarding;
