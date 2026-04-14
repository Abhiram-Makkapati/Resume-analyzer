"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { COLLECTIONS, PLAN_IDS, toIsoString, type AnalysisResult } from "@ai-resume/shared";
import { auth, db, storage } from "./firebase";
import type { ScanDocument, ScanWithResult, SubscriptionDocument, UserDocument } from "./types";

const getIdToken = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You need to sign in first.");
  }

  return user.getIdToken();
};

const getFunctionBase = () =>
  `https://${process.env.NEXT_PUBLIC_FUNCTIONS_REGION ?? "us-central1"}-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

export const syncUserDocument = async () => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    return;
  }

  const payload: UserDocument = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    createdAt: toIsoString(),
    updatedAt: toIsoString(),
    plan: PLAN_IDS.free
  };

  await setDoc(doc(db, COLLECTIONS.users, user.uid), payload, { merge: true });
};

export const uploadResume = async (file: File) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in before uploading a resume.");
  }

  const storagePath = `resumes/${user.uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type
  });

  const downloadUrl = await getDownloadURL(storageRef);
  const resumeRef = doc(collection(db, COLLECTIONS.resumes));
  const now = toIsoString();

  await setDoc(resumeRef, {
    id: resumeRef.id,
    userId: user.uid,
    fileName: file.name,
    storagePath,
    downloadUrl,
    contentType: file.type || "application/pdf",
    createdAt: now,
    updatedAt: now
  });

  await setDoc(
    doc(db, COLLECTIONS.users, user.uid),
    {
      defaultResumeId: resumeRef.id,
      updatedAt: now
    },
    { merge: true }
  );

  return {
    resumeId: resumeRef.id,
    storagePath
  };
};

export const createAnalysisScan = async (input: {
  resumeId: string;
  jobDescription: string;
  importedJobId?: string | null;
}) => {
  const token = await getIdToken();
  const response = await fetch(`${getFunctionBase()}/analyzeResume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to complete the scan.");
  }

  return payload as {
    ok: true;
    scanId: string;
    resultId: string;
    result: AnalysisResult;
  };
};

export const fetchUserScans = async () => {
  const user = auth.currentUser;

  if (!user) {
    return [] as ScanDocument[];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.scans),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );

  return snapshot.docs.map((entry) => entry.data() as ScanDocument);
};

export const fetchScanWithResult = async (scanId: string): Promise<ScanWithResult | null> => {
  const scanSnapshot = await getDoc(doc(db, COLLECTIONS.scans, scanId));

  if (!scanSnapshot.exists()) {
    return null;
  }

  const scan = scanSnapshot.data() as ScanDocument;
  let result: AnalysisResult | null = null;

  if (scan.resultId) {
    const resultSnapshot = await getDoc(doc(db, COLLECTIONS.scanResults, scan.resultId));
    if (resultSnapshot.exists()) {
      result = resultSnapshot.data() as AnalysisResult;
    }
  }

  return {
    ...scan,
    result
  };
};

export const fetchLatestImportedJob = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.importedJobs),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    )
  );

  return snapshot.docs[0]?.data() ?? null;
};

export const fetchSubscription = async (): Promise<SubscriptionDocument | null> => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const subscriptionSnapshot = await getDoc(doc(db, COLLECTIONS.subscriptions, user.uid));
  return subscriptionSnapshot.exists()
    ? (subscriptionSnapshot.data() as SubscriptionDocument)
    : null;
};

export const createStripeCheckout = async () => {
  const token = await getIdToken();
  const response = await fetch(`${getFunctionBase()}/createStripeCheckoutSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to start checkout.");
  }

  return payload.url as string;
};
