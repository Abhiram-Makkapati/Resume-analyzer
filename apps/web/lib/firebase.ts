"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { webEnv } from "./env";

const firebaseConfig = {
  apiKey: webEnv.firebaseApiKey,
  authDomain: webEnv.firebaseAuthDomain,
  projectId: webEnv.firebaseProjectId,
  storageBucket: webEnv.firebaseStorageBucket,
  messagingSenderId: webEnv.firebaseMessagingSenderId,
  appId: webEnv.firebaseAppId,
  measurementId: webEnv.firebaseMeasurementId
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp, webEnv.functionsRegion);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let analyticsInstance: Analytics | null = null;

export const getAnalyticsInstance = async () => {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (!(await isSupported())) {
    return null;
  }

  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
};

export const trackWebEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>
) => {
  const analytics = await getAnalyticsInstance();

  if (!analytics) {
    return;
  }

  logEvent(analytics, eventName, params);
};
