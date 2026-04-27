import { initializeApp, getApps, cert, AppOptions } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

const adminOptions: AppOptions = {};

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  adminOptions.credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
}

const app = getApps()[0] ?? initializeApp(adminOptions);

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export const adminAuth = getAuth(app);
