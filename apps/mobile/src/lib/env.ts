const requireEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }

  return value;
};

export const mobileEnv = {
  firebaseApiKey: requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  firebaseAuthDomain: requireEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  firebaseProjectId: requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  firebaseStorageBucket: requireEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  firebaseMessagingSenderId: requireEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  firebaseAppId: requireEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
  functionsRegion: process.env.EXPO_PUBLIC_FUNCTIONS_REGION ?? "us-central1",
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "",
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "",
  googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ""
};
