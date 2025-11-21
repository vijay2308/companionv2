# Companion App - Testing & Simulation Guide

This guide provides step-by-step instructions on how to run and test the Companion app on your local machine.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **Android Studio** (for Android emulation)
- **Xcode** (for iOS simulation, macOS only)
- **CocoaPods** (for iOS dependencies)

## 1. Start the Backend Server

The mobile app needs the backend to function (for the Agent and MCP tools).

1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *You should see: `Backend server running on port 3000`*

## 2. Run on Android (Using Android Studio)

Since you have Android Studio installed, this is the most reliable way to test the native Android build.

1. **Open Android Studio**.
2. Click **"Open"** and select the `companion/mobile/android` folder.
   * *Note: Do not open the root `companion` folder, specifically open `companion/mobile/android`.*
3. Wait for the **Gradle Sync** to finish (this may take a few minutes the first time).
   * *Look at the bottom status bar for progress.*
4. **Create/Select a Virtual Device**:
   * Go to **Device Manager** (icon usually on the right sidebar or top toolbar).
   * If you don't have a device, click **Create Device**, choose a "Pixel" phone, and download a system image (e.g., API 34 or 35).
   * Start the emulator by clicking the **Play** button in Device Manager.
5. **Run the App**:
   * In the top toolbar, ensure your emulator is selected in the device dropdown.
   * Click the green **Run (Play)** button (or press `Ctrl+R` / `Cmd+R`).
6. **Metro Bundler**:
   * A terminal window might open running "Metro". If not, you can start it manually in a separate terminal:
     ```bash
     cd mobile
     npx expo start
     ```
   * **Important**: Since we are using a custom native build, the app on your emulator will be a "Development Build" (it might look like Expo Go but with a different icon or splash).
   * If you see "Incompatible Expo Go", it means you are trying to open the project in the standard Expo Go app. Make sure you are launching the **"mobile"** app (or "Companion") installed by Android Studio, NOT the "Expo Go" app.
   * When running `npx expo start`, press `a` only if you want to open the standard Expo Go (which won't work). Instead, just ensure Metro is running, and open the app manually on the emulator.

## 3. Run on iOS (Using Simulator)

1. Open a terminal.
2. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
3. Run the iOS command:
   ```bash
   npm run ios
   ```
   * *This command will automatically open the iOS Simulator and install the app.*

## 4. Testing the App

Once the app is running on your simulator/emulator:

### **Concierge Mode (Cloud)**
1. Go to **Settings** (tap the avatar in the top right).
2. Ensure **"Pilot Mode"** is **OFF**.
3. Go back to **Home**.
4. Type a message like: *"Send an email to HR"*
5. Press **Send**.
   * *Expected*: The agent should respond (mock response) saying it will use Google Workspace tools.

### **Pilot Mode (Device)**
1. Go to **Settings**.
2. Toggle **"Pilot Mode"** to **ON**.
3. Go back to **Home**.
4. Type a message like: *"Open Gmail and search for tickets"*
5. Press **Send**.
   * *Expected*: The agent should respond saying it will handle it on the device (mock response).

## Troubleshooting

- **"Address already in use"**: If the backend fails with this error, something is using port 3000. Kill the process or change the port in `backend/src/index.ts`.
- **Android Build Failures**: Try cleaning the build in Android Studio: **Build > Clean Project**.
- **Metro Connection Issues**: Ensure your phone/emulator is on the same Wi-Fi as your computer (if using a real device), or simply press `r` in the Metro terminal to reload.
