# Android APK Build Guide for AgriBid

Your web app production build is ready in the `dist/` folder. Here's how to create an APK:

## Prerequisites
You need to install:
1. **Android SDK** (via Android Studio)
2. **Java Development Kit (JDK)** 11 or 17
3. **Gradle** (usually bundled with Android SDK)

## Installation Steps

### Step 1: Install Capacitor locally
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
```

### Step 2: Initialize Android Project
```bash
npx cap add android
```

### Step 3: Copy Web Assets to Android
```bash
npx cap copy android
```

### Step 4: Open in Android Studio
```bash
npx cap open android
```
This opens the Android project in Android Studio where you can build the APK.

### Step 5: Build APK in Android Studio
- In Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
- Or via command line:
```bash
cd android
./gradlew assembleRelease
```

## Environment Setup

### On Windows:
1. Download and install Android Studio from https://developer.android.com/studio
2. During installation, make sure to install:
   - Android SDK
   - Android Virtual Device (AVD)
   - Java Development Kit

3. Set Environment Variables:
   - `ANDROID_HOME`: Point to your Android SDK installation
   - `JAVA_HOME`: Point to your JDK installation
   - Add to PATH: `%ANDROID_HOME%\tools` and `%ANDROID_HOME%\platform-tools`

### Verify Installation:
```bash
java -version
adb --version
gradle --version
```

## Build Output
After building, your APK files will be located at:
```
android/app/build/outputs/apk/
```

- `debug/`: Debug APK (for testing)
- `release/`: Release APK (for production/publishing)

## Notes
- The web build is already optimized in `dist/`
- Your app ID is: `com.agriBid.app`
- The app can use all Capacitor plugins for native features
- Remember to update `capacitor.config.ts` if you need to configure mobile-specific settings

## Troubleshooting

**"gradle not found"**: 
- Install Android SDK completely through Android Studio
- Verify ANDROID_HOME environment variable

**"JAVA_HOME not set"**:
- Install JDK 11 or 17
- Set JAVA_HOME to the JDK installation path

**Permission denied errors**:
- Run terminal as Administrator on Windows
- Or use: `npm install ... --legacy-peer-deps`
