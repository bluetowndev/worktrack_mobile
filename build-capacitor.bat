@echo off
echo ========================================
echo WorkTrack Capacitor APK Build Script
echo ========================================

echo Step 1: Installing Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo Step 2: Exporting Expo app...
call npx expo export --platform android

echo Step 3: Initializing Capacitor...
call npx cap init worktrack com.mihir3838.workk

echo Step 4: Adding Android platform...
call npx cap add android

echo Step 5: Copying web assets...
call npx cap copy android

echo Step 6: Opening in Android Studio...
call npx cap open android

echo ========================================
echo Capacitor setup complete!
echo Open Android Studio to build APK
echo ========================================
pause
