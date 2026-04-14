"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, CircleAlert, Download, Sparkles } from "lucide-react";
import { ANALYTICS_EVENTS, PLAN_IDS, type AnalysisResult } from "@ai-resume/shared";
import { Button } from "./button";
import { Card } from "./card";
import { trackWebEvent } from "../lib/firebase";

export const ResultsOverview = ({
  result,
  plan
}: {
  result: AnalysisResult;
  plan: "free" | "pro";
}) => {
  const copyRewrite = async (value: string) => {
    await navigator.clipboard.writeText(value);
    await trackWebEvent(ANALYTICS_EVENTS.rewriteApplied);
  };

  const exportResult = async () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resume-analysis.json";
    anchor.click();
    URL.revokeObjectURL(url);
    await trackWebEvent(ANALYTICS_EVENTS.exportClicked);
  };

  return (
    <div className="results-grid">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="score-card accent-card">
          <span className="eyebrow">ATS Score</span>
          <div className="score-row">
            <div>
              <h2>{result.atsScore}</h2>
              <p>{result.summary}</p>
            </div>
            <Sparkles size={22} />
          </div>
          <small>{result.confidenceNote}</small>
        </Card>
      </motion.div>

      <div className="results-grid two-column">
        <Card>
          <div className="card-title-row">
            <h3>Matched keywords</h3>
            <span className="metric-chip">{result.analyticsSnapshot.matchRate}% match</span>
          </div>
          <div className="pill-row">
            {result.matchedKeywords.map((item) => (
              <span key={item.keyword} className="pill success">
                {item.keyword}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title-row">
            <h3>Missing keywords</h3>
            <span className="metric-chip warning">{result.missingKeywords.length} gaps</span>
          </div>
          <div className="keyword-list">
            {result.missingKeywords.map((item) => (
              <div key={item.keyword} className="list-row">
                <CircleAlert size={16} />
                <div>
                  <strong>{item.keyword}</strong>
                  <p>{item.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-title-row">
          <h3>Section feedback</h3>
          <span className="metric-chip">{result.sectionFeedback.length} sections reviewed</span>
        </div>
        <div className="section-grid">
          {result.sectionFeedback.map((section) => (
            <div key={section.section} className="section-item">
              <div className="section-header">
                <strong>{section.section}</strong>
                <span>{section.score}/100</span>
              </div>
              <p>{section.feedback}</p>
              <small>{section.recommendation}</small>
            </div>
          ))}
        </div>
      </Card>

      <div className="results-grid two-column">
        <Card>
          <div className="card-title-row">
            <h3>Bullet rewrites</h3>
            <span className="metric-chip">{plan === PLAN_IDS.pro ? "Pro unlocked" : "Preview"}</span>
          </div>
          <div className="rewrite-list">
            {result.bulletRewrites.slice(0, plan === PLAN_IDS.pro ? undefined : 2).map((rewrite) => (
              <div key={rewrite.original} className="rewrite-card">
                <small>Original</small>
                <p>{rewrite.original}</p>
                <ArrowUpRight size={16} />
                <small>Improved</small>
                <p>{rewrite.rewritten}</p>
                <Button variant="secondary" onClick={() => copyRewrite(rewrite.rewritten)}>
                  Copy rewrite
                </Button>
              </div>
            ))}
            {plan !== PLAN_IDS.pro ? (
              <div className="paywall-inline">
                <p>Upgrade to unlock the full tailored rewrite set and exported resume versions.</p>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="card-title-row">
            <h3>ATS checklist</h3>
            <Button variant="secondary" onClick={exportResult}>
              <Download size={16} />
              Export
            </Button>
          </div>
          <div className="checklist">
            {result.atsChecklist.map((item) => (
              <div key={item.title} className="list-row">
                <CheckCircle2 size={16} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-title-row">
          <h3>Tailored summary recommendation</h3>
          <span className="metric-chip">Recruiter-friendly</span>
        </div>
        <p className="longform">{result.tailoredSummary}</p>
        <div className="suggestion-list">
          {result.improvedResumeSuggestions.map((item) => (
            <span key={item} className="pill neutral">
              {item}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
