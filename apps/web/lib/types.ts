import type {
  AnalysisResult,
  scanDocumentSchema,
  subscriptionDocumentSchema,
  userDocumentSchema
} from "@ai-resume/shared";
import type { z } from "zod";

export type ScanDocument = z.infer<typeof scanDocumentSchema>;
export type SubscriptionDocument = z.infer<typeof subscriptionDocumentSchema>;
export type UserDocument = z.infer<typeof userDocumentSchema>;

export type ScanWithResult = ScanDocument & {
  result?: AnalysisResult | null;
};
