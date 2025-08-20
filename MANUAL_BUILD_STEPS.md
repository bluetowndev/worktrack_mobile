# Manual APK Build Steps for WorkTrack

## Prerequisites
1. Install Android Studio: https://developer.android.com/studio
2. Install Java JDK 17: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
3. Set environment variables:
   - JAVA_HOME=C:\Program Files\Java\jdk-17
   - ANDROID_HOME=C:\Users\[YourUsername]\AppData\Local\Android\Sdk
   - Add to PATH: %ANDROID_HOME%\platform-tools

## Step-by-Step Commands

### Step 1: Clean and Prepare
```bash
# Navigate to your project
cd d:\Worktrack_new_codes\Mobile_App

# Clean previous builds
rmdir /s /q android (if exists)
rmdir /s /q dist (if exists)

# Install dependencies
npm install
```

### Step 2: Generate Native Code
```bash
# Generate Android native code
npx expo prebuild --platform android
```

### Step 3: Build APK
```bash
# Navigate to android folder
cd android

# Build release APK
gradlew assembleRelease
```

### Step 4: Find Your APK
The APK will be located at:
`android\app\build\outputs\apk\release\app-release.apk`

## Alternative: Using Android Studio
1. After Step 2, open Android Studio
2. Open the `android` folder as a project
3. Go to Build > Generate Signed Bundle / APK
4. Choose APK and follow the wizard

## Troubleshooting
- If gradlew command fails, try: `.\gradlew assembleRelease`
- If Java errors occur, ensure JAVA_HOME is set correctly
- If Android SDK errors occur, ensure ANDROID_HOME is set correctly
- Run `npx react-native doctor` to check your environment

## Environment Check
Run these commands to verify your setup:
```bash
java -version
echo %JAVA_HOME%
echo %ANDROID_HOME%
adb version
```
