@echo off
echo ========================================
echo WorkTrack APK Build Script
echo ========================================

echo Step 1: Cleaning previous builds...
if exist android rmdir /s /q android
if exist dist rmdir /s /q dist

echo Step 2: Installing dependencies...
call npm install

echo Step 3: Generating native Android code...
call npx expo prebuild --platform android

echo Step 4: Building APK...
cd android
call gradlew assembleRelease

echo ========================================
echo Build Complete!
echo APK Location: android\app\build\outputs\apk\release\app-release.apk
echo ========================================
pause
