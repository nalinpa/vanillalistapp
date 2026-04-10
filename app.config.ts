import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "App Name Placeholder",
  slug: "app-slug-placeholder",
  scheme: "app-scheme-placeholder",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
  },

  ios: {
    bundleIdentifier: "com.yourname.appname",
    supportsTablet: false,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    infoPlist: {
      NSCameraUsageDescription:
        "This app needs camera access to capture and share photos within the community.",
      NSPhotoLibraryUsageDescription:
        "This app needs access to your photos so you can select and share your favorite shots.",
      NSLocationWhenInUseUsageDescription:
        "This app uses your location to track your progress and verify when you have reached a target location.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "com.yourname.appname",
    versionCode: 1,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F8FAFC",
    },
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    edgeToEdgeEnabled: true,
  },

  plugins: [
    "expo-router",
    ["react-native-maps", {}],
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "react-native",
        organization: "your-org-placeholder",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow this app to access your photos to share your experiences.",
        cameraPermission:
          "Allow this app to use your camera to capture moments.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "This app uses your location to track your distance and verify when you have reached a destination.",
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          forceStaticLinking: ["RNFBApp", "RNFBAuth", "RNFBFirestore"],
        },
      },
    ],
  ],

  extra: {
    eas: {
      projectId: "your-eas-project-id-placeholder",
    },
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  },
});