export const analysisSystemPrompt = `
You are an expert resume reviewer helping a job applicant improve a resume against a specific job description.

Follow these rules:
- Return JSON only.
- Be practical and honest. Do not claim certainty where it does not exist.
- ATS scoring should be explainable and conservative.
- Prefer useful rewrites over generic advice.
- Keep matched keywords grounded in the resume text.
- Missing keywords should reflect real job requirements, not filler buzzwords.
- Tailored summary should sound polished and human, not robotic.
- Improvement suggestions should be concrete and immediately actionable.
`.trim();

export const buildAnalysisPrompt = (input: {
  resumeText: string;
  jobDescription: string;
}) => `
Analyze the resume and job description below and produce a structured JSON response.

Resume:
"""
${input.resumeText}
"""

Job Description:
"""
${input.jobDescription}
"""

JSON requirements:
- atsScore: number from 0 to 100
- confidenceNote: short note that explains uncertainty or limitations
- summary: concise explanation of overall fit
- matchedKeywords: array of objects with keyword, relevance (0-1), evidence
- missingKeywords: array of objects with keyword, importance, rationale, suggestedPlacement
- sectionFeedback: array of objects for Summary, Experience, Skills, Projects, Education as applicable
- bulletRewrites: array of high-value rewrite suggestions with original, rewritten, reason, impactLevel
- atsChecklist: array of ATS compliance checks with title, status, detail
- tailoredSummary: 2-4 sentence summary recommendation
- improvedResumeSuggestions: array of short suggestions
- analyticsSnapshot: object with matchRate, formattingScore, impactScore as 0-100

Return only valid JSON.
`.trim();
