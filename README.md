# 📍 Expo + Firebase Gamification Boilerplate

A robust, location-based React Native mobile app boilerplate built with Expo. This template includes a fully generic gamification engine (badges, achievements, location checkpoints), offline-first data synchronization, and Firebase backend integration.

## 🛠 Tech Stack
* **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (Expo Router)
* **Backend:** [Firebase](https://firebase.google.com/) (Auth, Firestore)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with AsyncStorage persistence)
* **UI/Theming:** [UI Kitten](https://akveo.github.io/react-native-ui-kitten/) / Custom Design System
* **Maps & Location:** `react-native-maps`, `expo-location`, `geolib`
* **Error Tracking:** [Sentry](https://sentry.io/)

## ✨ Core Features
* **Location & Checkpoint Tracking:** Geofencing logic to track distance and verify when a user reaches a specific location/checkpoint.
* **Offline-First Sync Engine:** A robust Zustand-powered background queue that saves user completions locally and syncs to Firestore when the network returns.
* **Gamification & Badges:** A fully generic achievement system calculating progress across regions, categories, and sharing milestones.
* **Authentication:** Built-in Firebase Email/Password auth and account deletion flows.
* **Generic Data Models:** Ready-to-use models for Locations, Reviews, Categories, and User Profiles.
* **Cross-Platform Routing:** Turn-by-turn navigation fallback to Google Maps/Apple Maps natively.

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g eas-cli`)
* A Firebase Project (Web App + iOS/Android Apps configured)

### 2. Installation
Clone your boilerplate repository and install dependencies:

```bash
# Clone the repository
git clone [https://github.com/YourUsername/your-app-repo-name.git](https://github.com/YourUsername/your-app-repo-name.git)

# Navigate into the project directory
cd your-app-repo-name

# Install dependencies
npm install
3. Environment Variables
Create a .env file in the root directory. You will need your Firebase project keys and Sentry DSN.

Code snippet
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_url
4. Native Configuration (Google Services)
To build natively or use native Firebase modules, place your configuration files in the root directory:

iOS: Download GoogleService-Info.plist from Firebase and place it in the root.

Android: Download google-services.json from Firebase and place it in the root.

5. Running the App
Start the Expo development server:

Bash
npx expo start
Press i to open in iOS Simulator.

Press a to open in Android Emulator.

Scan the QR code with the Expo Go app to test on a physical device.

📂 Project Structure
Plaintext
├── app/                 # Expo Router file-based routing (screens and tabs)
├── assets/              # App icons, splash screens, and static images
├── src/
│   ├── components/      # Reusable UI components (Cards, Modals, Buttons)
│   ├── lib/             # Constants, Theme configs, utilities (geolib, Sentry)
│   ├── models/          # TypeScript types and interfaces
│   ├── services/        # Firebase API calls (Auth, Firestore reads/writes)
│   └── store/           # Zustand state slices (Location, User, Sync Queue)
├── app.config.ts        # Dynamic Expo configuration
├── app.json             # Static Expo app configuration
└── package.json
🏗 Building for Production
This project is pre-configured for Expo Application Services (EAS). Update your EAS Project ID in app.config.ts and app.json, then run:

Bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android