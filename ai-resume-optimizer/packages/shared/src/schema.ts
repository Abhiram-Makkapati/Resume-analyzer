import { z } from "zod";

export const keywordMatchSchema = z.object({
  keyword: z.string(),
  relevance: z.number().min(0).max(1),
  evidence: z.string()
});

export const missingKeywordSchema = z.object({
  keyword: z.string(),
  importance: z.enum(["high", "medium", "low"]),
  rationale: z.string(),
  suggestedPlacement: z.string()
});

export const sectionFeedbackSchema = z.object({
  section: z.string(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  recommendation: z.string()
});

export const bulletRewriteSchema = z.object({
  original: z.string(),
  rewritten: z.string(),
  reason: z.string(),
  impactLevel: z.enum(["high", "medium", "low"])
});

export const atsChecklistItemSchema = z.object({
  title: z.string(),
  status: z.enum(["pass", "warning", "fail"]),
  detail: z.string()
});

export const analysisResultSchema = z.object({
  atsScore: z.number().min(0).max(100),
  confidenceNote: z.string(),
  summary: z.string(),
  matchedKeywords: z.array(keywordMatchSchema),
  missingKeywords: z.array(missingKeywordSchema),
  sectionFeedback: z.array(sectionFeedbackSchema),
  bulletRewrites: z.array(bulletRewriteSchema),
  atsChecklist: z.array(atsChecklistItemSchema),
  tailoredSummary: z.string(),
  improvedResumeSuggestions: z.array(z.string()),
  analyticsSnapshot: z.object({
    matchRate: z.number().min(0).max(100),
    formattingScore: z.number().min(0).max(100),
    impactScore: z.number().min(0).max(100)
  })
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const resumeDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fileName: z.string(),
  storagePath: z.string(),
  contentType: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parsedTextPreview: z.string().optional()
});

export const scanStatusSchema = z.enum(["queued", "processing", "completed", "failed"]);

export const scanDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  resumeId: z.string(),
  jobDescription: z.string(),
  importedJobId: z.string().optional(),
  status: scanStatusSchema,
  plan: z.enum(["free", "pro"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  atsScore: z.number().min(0).max(100).optional(),
  resultId: z.string().optional(),
  errorMessage: z.string().optional()
});

export const subscriptionDocumentSchema = z.object({
  userId: z.string(),
  plan: z.enum(["free", "pro"]),
  provider: z.enum(["none", "stripe", "revenuecat"]),
  status: z.enum(["inactive", "trialing", "active", "past_due", "canceled"]),
  currentPeriodEnd: z.string().nullable(),
  entitlementId: z.string().nullable(),
  updatedAt: z.string()
});

export const userDocumentSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  defaultResumeId: z.string().optional(),
  plan: z.enum(["free", "pro"]).default("free")
});

export const importedJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  company: z.string(),
  sourceUrl: z.string().url(),
  description: z.string(),
  createdAt: z.string()
});
