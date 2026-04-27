import OpenAI from "openai";
import { analysisResultSchema, analysisSystemPrompt, buildAnalysisPrompt, type AnalysisResult } from "@ai-resume/shared";

export const createOpenAiClient = (apiKey: string) =>
  new OpenAI({ apiKey });

const stripJsonFences = (raw: string): string =>
  raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

export const analyzeResumeWithOpenAi = async (input: {
  apiKey: string;
  resumeText: string;
  jobDescription: string;
}): Promise<AnalysisResult> => {
  const client = createOpenAiClient(input.apiKey);

  // Use standard chat completions with JSON mode for broad model compatibility.
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: analysisSystemPrompt
      },
      {
        role: "user",
        content: buildAnalysisPrompt({
          resumeText: input.resumeText,
          jobDescription: input.jobDescription
        })
      }
    ],
    temperature: 0.3,
    max_tokens: 4096
  });

  const rawText = completion.choices[0]?.message?.content ?? "";
  const cleanText = stripJsonFences(rawText);

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(cleanText);
  } catch {
    throw new Error("The AI service returned a response that could not be parsed as JSON.");
  }

  const parsed = analysisResultSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new Error(
      `The AI service returned an incomplete analysis. Validation errors: ${parsed.error.issues
        .map((i) => i.message)
        .join(", ")}`
    );
  }

  return parsed.data;
};
