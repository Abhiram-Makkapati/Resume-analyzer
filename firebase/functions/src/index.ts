import { onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import {
  ANALYTICS_EVENTS,
  COLLECTIONS,
  FREE_PLAN_DAILY_SCANS,
  PLAN_IDS,
  subscriptionDocumentSchema,
  toIsoString,
  truncateText,
  type AnalysisResult
} from "@ai-resume/shared";
import { adminAuth, adminDb } from "./admin.js";
import { runCors } from "./http.js";
import { parseResumeFromStorage } from "./pdf.js";
import { analyzeResumeWithOpenAi } from "./openai.js";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const WEB_APP_URL = defineSecret("WEB_APP_URL");

const authenticateRequest = async (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new HttpsError("unauthenticated", "Missing authorization token.");
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();
  return adminAuth.verifyIdToken(token);
};

const getPlanForUser = async (uid: string) => {
  const subscriptionSnapshot = await adminDb.collection(COLLECTIONS.subscriptions).doc(uid).get();

  if (!subscriptionSnapshot.exists) {
    return {
      plan: PLAN_IDS.free,
      provider: "none",
      status: "inactive"
    } as const;
  }

  const parsed = subscriptionDocumentSchema.safeParse(subscriptionSnapshot.data());

  if (!parsed.success) {
    return {
      plan: PLAN_IDS.free,
      provider: "none",
      status: "inactive"
    } as const;
  }

  return parsed.data;
};

const getTodayScanCount = async (uid: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const scansSnapshot = await adminDb
    .collection(COLLECTIONS.scans)
    .where("userId", "==", uid)
    .where("createdAt", ">=", startOfDay.toISOString())
    .get();

  return scansSnapshot.size;
};

const storeAnalyticsSnapshot = async (uid: string, result: AnalysisResult) => {
  const snapshotId = `${uid}_${new Date().toISOString().slice(0, 10)}`;
  await adminDb.collection(COLLECTIONS.analyticsSnapshots).doc(snapshotId).set(
    {
      userId: uid,
      metrics: result.analyticsSnapshot,
      updatedAt: toIsoString()
    },
    { merge: true }
  );
};

export const analyzeResume = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [OPENAI_API_KEY]
  },
  async (req, res) => {
    await runCors(req, res);

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const decodedToken = await authenticateRequest(req.headers.authorization);
      const { resumeId, jobDescription, importedJobId } = req.body as {
        resumeId?: string;
        jobDescription?: string;
        importedJobId?: string;
      };

      if (!resumeId || !jobDescription) {
        throw new HttpsError("invalid-argument", "resumeId and jobDescription are required.");
      }

      const subscription = await getPlanForUser(decodedToken.uid);
      const todayScanCount = await getTodayScanCount(decodedToken.uid);

      if (subscription.plan === PLAN_IDS.free && todayScanCount >= FREE_PLAN_DAILY_SCANS) {
        res.status(402).json({
          error: "Free scan limit reached for today.",
          code: "SCAN_LIMIT_REACHED"
        });
        return;
      }

      const resumeSnapshot = await adminDb.collection(COLLECTIONS.resumes).doc(resumeId).get();

      if (!resumeSnapshot.exists || resumeSnapshot.data()?.userId !== decodedToken.uid) {
        throw new HttpsError("permission-denied", "Resume not found.");
      }

      const now = toIsoString();
      const scanRef = adminDb.collection(COLLECTIONS.scans).doc();

      await scanRef.set({
        id: scanRef.id,
        userId: decodedToken.uid,
        resumeId,
        jobDescription,
        importedJobId: importedJobId ?? null,
        status: "processing",
        plan: subscription.plan,
        createdAt: now,
        updatedAt: now
      });

      const resumeText = await parseResumeFromStorage(resumeSnapshot.data()!.storagePath);
      const result = await analyzeResumeWithOpenAi({
        apiKey: OPENAI_API_KEY.value(),
        resumeText,
        jobDescription
      });

      const resultRef = adminDb.collection(COLLECTIONS.scanResults).doc(scanRef.id);

      await resultRef.set({
        id: resultRef.id,
        userId: decodedToken.uid,
        scanId: scanRef.id,
        resumeId,
        ...result,
        createdAt: now,
        updatedAt: now
      });

      await scanRef.update({
        status: "completed",
        updatedAt: toIsoString(),
        atsScore: result.atsScore,
        resultId: resultRef.id
      });

      await storeAnalyticsSnapshot(decodedToken.uid, result);

      res.json({
        ok: true,
        scanId: scanRef.id,
        resultId: resultRef.id,
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze resume.";
      res.status(500).json({ error: message });
    }
  }
);

export const importJobDescription = onRequest(
  {
    region: "us-central1",
    cors: true
  },
  async (req, res) => {
    await runCors(req, res);

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const decodedToken = await authenticateRequest(req.headers.authorization);
      const { title, company, sourceUrl, description } = req.body as {
        title?: string;
        company?: string;
        sourceUrl?: string;
        description?: string;
      };

      if (!sourceUrl || !description) {
        throw new HttpsError("invalid-argument", "sourceUrl and description are required.");
      }

      const jobRef = adminDb.collection(COLLECTIONS.importedJobs).doc();
      await jobRef.set({
        id: jobRef.id,
        userId: decodedToken.uid,
        title: truncateText(title ?? "Imported job", 90),
        company: truncateText(company ?? "Unknown company", 90),
        sourceUrl,
        description,
        createdAt: toIsoString()
      });

      res.json({
        ok: true,
        importedJobId: jobRef.id
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import job description.";
      res.status(500).json({ error: message });
    }
  }
);

export const createStripeCheckoutSession = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [STRIPE_SECRET_KEY, WEB_APP_URL]
  },
  async (req, res) => {
    await runCors(req, res);

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const decodedToken = await authenticateRequest(req.headers.authorization);
      const { priceId } = req.body as { priceId?: string };

      if (!priceId) {
        throw new HttpsError("invalid-argument", "Missing Stripe price id.");
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: decodedToken.email,
        client_reference_id: decodedToken.uid,
        subscription_data: {
          metadata: {
            uid: decodedToken.uid
          }
        },
        success_url: `${WEB_APP_URL.value()}/pricing?checkout=success`,
        cancel_url: `${WEB_APP_URL.value()}/pricing?checkout=cancelled`,
        allow_promotion_codes: true,
        metadata: {
          uid: decodedToken.uid
        }
      });

      res.json({ url: session.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create checkout session.";
      res.status(500).json({ error: message });
    }
  }
);

export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const signature = req.headers["stripe-signature"];
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        String(signature),
        STRIPE_WEBHOOK_SECRET.value()
      );

      if (event.type.startsWith("customer.subscription")) {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata.uid ?? "";
        const isActive = ["active", "trialing"].includes(subscription.status);

        if (uid) {
          await adminDb.collection(COLLECTIONS.subscriptions).doc(uid).set({
            userId: uid,
            plan: isActive ? PLAN_IDS.pro : PLAN_IDS.free,
            provider: "stripe",
            status: isActive ? "active" : subscription.status === "canceled" ? "canceled" : "past_due",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            entitlementId: subscription.id,
            updatedAt: toIsoString(),
            lastEvent: ANALYTICS_EVENTS.subscriptionStarted
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook failed.";
      res.status(400).send(message);
    }
  }
);

export const revenueCatWebhook = onRequest(
  {
    region: "us-central1",
    cors: true
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const event = req.body?.event;
    const uid = event?.app_user_id as string | undefined;

    if (!uid) {
      res.status(200).json({ ignored: true });
      return;
    }

    const isActive = ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"].includes(event.type);

    await adminDb.collection(COLLECTIONS.subscriptions).doc(uid).set(
      {
        userId: uid,
        plan: isActive ? PLAN_IDS.pro : PLAN_IDS.free,
        provider: "revenuecat",
        status: isActive ? "active" : "canceled",
        currentPeriodEnd: event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null,
        entitlementId: event.entitlement_id ?? null,
        updatedAt: toIsoString()
      },
      { merge: true }
    );

    res.json({ received: true });
  }
);
