export const APP_NAME = "AI Resume Optimizer";

export const COLLECTIONS = {
  users: "users",
  resumes: "resumes",
  scans: "scans",
  scanResults: "scanResults",
  subscriptions: "subscriptions",
  analyticsSnapshots: "analyticsSnapshots",
  importedJobs: "importedJobs"
} as const;

export const FREE_PLAN_DAILY_SCANS = 2;

export const PLAN_IDS = {
  free: "free",
  pro: "pro"
} as const;

export const FUNCTION_NAMES = {
  analyzeResume: "analyzeResume",
  createStripeCheckoutSession: "createStripeCheckoutSession",
  stripeWebhook: "stripeWebhook",
  revenueCatWebhook: "revenueCatWebhook",
  importJobDescription: "importJobDescription"
} as const;

export const ANALYTICS_EVENTS = {
  resumeUploaded: "resume_uploaded",
  jobDescriptionImported: "job_description_imported",
  scanCompleted: "scan_completed",
  atsScoreViewed: "ats_score_viewed",
  rewriteApplied: "rewrite_applied",
  exportClicked: "export_clicked",
  paywallViewed: "paywall_viewed",
  subscriptionStarted: "subscription_started"
} as const;
