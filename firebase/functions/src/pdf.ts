import pdfParse from "pdf-parse";
import { adminStorage } from "./admin.js";

export const parseResumeFromStorage = async (storagePath: string): Promise<string> => {
  const bucket = adminStorage.bucket();
  const [fileBuffer] = await bucket.file(storagePath).download();
  const parsed = await pdfParse(fileBuffer);
  return parsed.text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
};
