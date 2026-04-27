"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { createAnalysisScan, fetchLatestImportedJob, uploadResume } from "../lib/data";
import { trackWebEvent } from "../lib/firebase";
import { Button } from "./button";
import { Card } from "./card";

export const UploadPanel = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Upload your resume PDF to unlock AI scoring.");

  const importedJobQuery = useQuery({
    queryKey: ["latest-imported-job"],
    queryFn: fetchLatestImportedJob
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: async (payload) => {
      setResumeId(payload.resumeId);
      setStatusMessage("Resume uploaded. Add a job description to start the scan.");
      await trackWebEvent(ANALYTICS_EVENTS.resumeUploaded);
    }
  });

  const scanMutation = useMutation({
    mutationFn: createAnalysisScan,
    onSuccess: async (payload) => {
      await trackWebEvent(ANALYTICS_EVENTS.scanCompleted, {
        atsScore: payload.result.atsScore
      });
      router.push(`/dashboard/${payload.scanId}`);
    }
  });

  const importedJob = importedJobQuery.data;

  const canAnalyze = useMemo(() => Boolean(resumeId && jobDescription.trim()), [jobDescription, resumeId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!resumeId) {
      setStatusMessage("Upload a PDF before running an analysis.");
      return;
    }

    await scanMutation.mutateAsync({
      resumeId,
      jobDescription,
      importedJobId: importedJob?.id ?? null
    });
  };

  return (
    <Card className="upload-panel">
      <div className="panel-banner">
        <div>
          <span className="eyebrow">Resume Scan</span>
          <h3>Turn any resume + job posting into a precise action plan.</h3>
        </div>
        <Sparkles size={18} />
      </div>

      {importedJob ? (
        <div className="import-banner">
          <div>
            <strong>Job imported from the extension</strong>
            <p>
              {importedJob.title} at {importedJob.company}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              setJobDescription(importedJob.description);
              await trackWebEvent(ANALYTICS_EVENTS.jobDescriptionImported);
            }}
          >
            Use imported job
          </Button>
        </div>
      ) : null}

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="dropzone">
          <input
            type="file"
            accept="application/pdf"
            onChange={async (event) => {
              const nextFile = event.target.files?.[0];
              setFile(nextFile ?? null);
            }}
          />
          <div>
            <strong>{file ? file.name : "Upload resume PDF"}</strong>
            <p>ATS-safe PDF uploads with Firebase Storage.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!file || uploadMutation.isPending}
            onClick={async () => {
              if (!file) {
                return;
              }

              await uploadMutation.mutateAsync(file);
            }}
          >
            {uploadMutation.isPending ? <LoaderCircle className="spin" size={16} /> : "Upload"}
          </Button>
        </label>

        <label className="field-group">
          <span>Job description</span>
          <textarea
            rows={10}
            placeholder="Paste the full role description or import it from the Chrome extension."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
        </label>

        <div className="inline-status">
          <p>{statusMessage}</p>
          <Button type="submit" disabled={!canAnalyze || scanMutation.isPending}>
            {scanMutation.isPending ? <LoaderCircle className="spin" size={16} /> : "Run AI scan"}
          </Button>
        </div>
      </form>

      {scanMutation.error ? <p className="error-text">{scanMutation.error.message}</p> : null}
      {uploadMutation.error ? <p className="error-text">{uploadMutation.error.message}</p> : null}
    </Card>
  );
};
