import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { analysisResultSchema, analysisSystemPrompt, buildAnalysisPrompt, type AnalysisResult } from "@ai-resume/shared";

export const createOpenAiClient = (apiKey: string) =>
  new OpenAI({
    apiKey
  });

export const analyzeResumeWithOpenAi = async (input: {
  apiKey: string;
  resumeText: string;
  jobDescription: string;
}): Promise<AnalysisResult> => {
  const client = createOpenAiClient(input.apiKey);

  const response = await client.responses.parse({
    model: "gpt-4.1",
    input: [
      {
        role: "developer",
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
    text: {
      format: zodTextFormat(analysisResultSchema, "resume_analysis")
    }
  });

  const parsed = analysisResultSchema.safeParse(response.output_parsed);

  if (!parsed.success) {
    throw new Error("The AI service returned malformed analysis output.");
  }

  return parsed.data;
};
