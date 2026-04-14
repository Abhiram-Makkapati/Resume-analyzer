const getEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }

  return value;
};

export const webEnv = {
  firebaseApiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  firebaseAuthDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  firebaseProjectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  firebaseStorageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  firebaseMessagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  firebaseAppId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  firebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  functionsRegion: process.env.NEXT_PUBLIC_FUNCTIONS_REGION ?? "us-central1",
  stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "",
  extensionImportUrl: process.env.NEXT_PUBLIC_EXTENSION_IMPORT_URL ?? ""
};
