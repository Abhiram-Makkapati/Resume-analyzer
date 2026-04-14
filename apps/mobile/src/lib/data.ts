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
import { ref, uploadBytes } from "firebase/storage";
import {
  COLLECTIONS,
  PLAN_IDS,
  toIsoString,
  type AnalysisResult,
  importedJobSchema,
  scanDocumentSchema,
  subscriptionDocumentSchema,
  userDocumentSchema
} from "@ai-resume/shared";
import type { z } from "zod";
import { auth, db, storage } from "./firebase";

type ScanDocument = z.infer<typeof scanDocumentSchema>;
type SubscriptionDocument = z.infer<typeof subscriptionDocumentSchema>;
type UserDocument = z.infer<typeof userDocumentSchema>;
type ImportedJob = z.infer<typeof importedJobSchema>;

const functionBase = `https://${process.env.EXPO_PUBLIC_FUNCTIONS_REGION ?? "us-central1"}-${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const getToken = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return user.getIdToken();
};

export const syncUserDocument = async () => {
  const user = auth.currentUser;

  if (!user?.email) {
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

export const uploadResumeAsset = async (asset: {
  uri: string;
  mimeType?: string | null;
  name?: string | null;
}) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in before uploading.");
  }

  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const storagePath = `resumes/${user.uid}/${Date.now()}-${asset.name ?? "resume.pdf"}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, {
    contentType: asset.mimeType ?? "application/pdf"
  });

  const resumeRef = doc(collection(db, COLLECTIONS.resumes));
  const now = toIsoString();

  await setDoc(resumeRef, {
    id: resumeRef.id,
    userId: user.uid,
    fileName: asset.name ?? "resume.pdf",
    storagePath,
    contentType: asset.mimeType ?? "application/pdf",
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

  return { resumeId: resumeRef.id };
};

export const createAnalysisScan = async (input: {
  resumeId: string;
  jobDescription: string;
  importedJobId?: string | null;
}) => {
  const token = await getToken();
  const response = await fetch(`${functionBase}/analyzeResume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to analyze resume.");
  }

  return payload as { scanId: string; resultId: string; result: AnalysisResult };
};

export const fetchScans = async (): Promise<ScanDocument[]> => {
  const user = auth.currentUser;
  if (!user) {
    return [];
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

export const fetchScanResult = async (scanId: string) => {
  const scanSnapshot = await getDoc(doc(db, COLLECTIONS.scans, scanId));
  if (!scanSnapshot.exists()) {
    return null;
  }

  const scan = scanSnapshot.data() as ScanDocument;
  const resultSnapshot = scan.resultId ? await getDoc(doc(db, COLLECTIONS.scanResults, scan.resultId)) : null;

  return {
    ...scan,
    result: resultSnapshot?.exists() ? (resultSnapshot.data() as AnalysisResult) : null
  };
};

export const fetchSubscription = async (): Promise<SubscriptionDocument | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  const snapshot = await getDoc(doc(db, COLLECTIONS.subscriptions, user.uid));
  return snapshot.exists() ? (snapshot.data() as SubscriptionDocument) : null;
};

export const fetchLatestImportedJob = async (): Promise<ImportedJob | null> => {
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

  return (snapshot.docs[0]?.data() as ImportedJob | undefined) ?? null;
};
