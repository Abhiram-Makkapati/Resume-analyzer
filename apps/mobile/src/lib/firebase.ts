import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { mobileEnv } from "./env";

const firebaseConfig = {
  apiKey: mobileEnv.firebaseApiKey,
  authDomain: mobileEnv.firebaseAuthDomain,
  projectId: mobileEnv.firebaseProjectId,
  storageBucket: mobileEnv.firebaseStorageBucket,
  messagingSenderId: mobileEnv.firebaseMessagingSenderId,
  appId: mobileEnv.firebaseAppId
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
