import { initializeApp, getApps } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXT_FIREBASE_API_KEY,
  authDomain: process.env.EXT_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXT_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXT_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXT_FIREBASE_APP_ID
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const extensionAuth = getAuth(app);
setPersistence(extensionAuth, browserLocalPersistence).catch(() => undefined);

export const getFunctionBaseUrl = () =>
  `https://${process.env.EXT_FUNCTIONS_REGION}-${process.env.EXT_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
