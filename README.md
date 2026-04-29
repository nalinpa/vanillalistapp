# 📍 Expo + Firebase Gamification Boilerplate

A robust, location-based React Native mobile app boilerplate built with Expo. This template includes a fully generic gamification engine (badges, achievements, database checkpoints), offline-first data synchronization, and Firebase backend integration.

## 🛠 Tech Stack
* **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (Expo Router)
* **Backend:** [Firebase](https://firebase.google.com/) (Auth, Firestore)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with AsyncStorage persistence)
* **Maps & Location:** `react-native-maps`, `expo-location`, `geolib`
* **Error Tracking:** [Sentry](https://sentry.io/)

## ✨ Core Features
* **Location & Checkpoint Tracking:** Geofencing logic to track distance and verify when a user reaches a specific coordinate.
* **Offline-First Sync Engine:** A robust Zustand-powered background queue that saves user completions locally and syncs to Firestore when the network returns.
* **Gamification & Badges:** A fully generic achievement system calculating progress across regions and categories.
* **Authentication:** Built-in Firebase Email/Password auth and account deletion flows.

---

## 🚀 Getting Started

Follow these steps to instantiate a new app from this boilerplate.

### 1. Clone & Install
Clone the boilerplate into a new folder and install the dependencies.

```bash
git clone [https://github.com/nalinpa/vanillalistapp.git](https://github.com/nalinpa/vanillalistapp.git) ./mobile
cd mobile
npm install
```

### 2. Run the Scaffolding
The boilerplate uses a generic "Location" entity. Use the scaffolding script to re-brand the app and rename the core entities to fit your project.

Open scaffold.js.

Update the REPLACEMENTS object with your specific App Name, Tagline, Colors, and Entity names (Singular and Plural).

Run the script:

```Bash
node scaffold.js
```

### 3. Post-Scaffold Cleanup (Manual Renaming)
While the script updates code content, you must manually rename the following specific files and folders to match your new entity name (replacing {location} or {locations} with your new term).

Rename Folders:

src/components/location/ -> src/components/[entity]/

Rename Files:

src/lib/hooks/usePublic{locations}Reviews.ts

src/lib/hooks/use{locations}ReviewsSummary.ts

src/lib/hooks/useSorted{locations}Rows.ts

src/lib/hooks/use{locations}.ts

src/lib/hooks/use{location}CompletionMutation.ts

src/components/map/{locations}MapView.tsx

src/components/map/{location}Marker.tsx

src/components/[entity]/list/{location}ListView.tsx

src/components/[entity]/list/{location}ListHeader.tsx

src/components/[entity]/list/{location}FiltersCard.tsx

src/components/[entity]/detail/{location}Hero.tsx

src/components/progress/{locations}ToReviewCard.tsx

(Note: Depending on your exact scaffolding, double-check your import paths after renaming if your IDE doesn't auto-update them.)

### 4. Firebase Configuration
Create a .env file in the root directory with your Firebase project keys:

Code snippet
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
Next, configure the native Android connection:  

Go to the Firebase Console -> Project Overview -> Add App -> Android.  

Set the Android package name to exactly match the one in your app.json / app.config.ts.  

Register the app and download the google-services.json file.

### 5. Expo EAS Configuration
Because we are building in the cloud with Expo Application Services (EAS), we need to securely provide the Firebase JSON file to the build server.

Go to your project dashboard on expo.dev.

Navigate to Secrets.

Add a new File secret.

Name the secret exactly GOOGLE_SERVICES_JSON.

Upload the google-services.json file you downloaded from Firebase.

### 6. Initialize New Git Repository
Disconnect from the boilerplate repository and push to your own new project.

```Bash
git remote remove origin
git remote add origin [https://github.com/yourusername/YOUR_NEW_REPO_NAME.git](https://github.com/yourusername/YOUR_NEW_REPO_NAME.git)
git add .
git commit -m "Initial commit: App scaffolded and configured"
git push -u origin main
```

### 7. Build and Run
Kick off your first development build using EAS. This will generate a custom Dev Client .apk that includes all your native Firebase configuration.

```Bash
eas build --profile development --platform android
```

Once the build is complete, download and install the .apk on your emulator or physical device. Finally, start your local development server:

```Bash
npx expo start --dev-client
```