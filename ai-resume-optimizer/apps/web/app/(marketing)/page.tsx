import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Workflow } from "lucide-react";
import { Button } from "../../components/button";
import { Card } from "../../components/card";

const features = [
  "ATS score with explainable fit breakdown",
  "Keyword gap analysis grounded in the job description",
  "Tailored bullet rewrites and summary suggestions",
  "Chrome extension import flow for live job pages"
];

export default function MarketingPage() {
  return (
    <div className="page-shell">
      <header className="landing-nav">
        <Link href="/" className="brand-mark">
          <div className="brand-orb" />
          <div>
            <strong>AI Resume Optimizer</strong>
            <p>Make every application sharper</p>
          </div>
        </Link>
        <div className="hero-actions">
          <Link href="/pricing">
            <Button variant="secondary">Pricing</Button>
          </Link>
          <Link href="/auth">
            <Button>Open app</Button>
          </Link>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">Premium resume intelligence</span>
        <div className="hero-grid">
          <Card className="accent-card">
            <h1>Optimize your resume like a top recruiting ops team built it.</h1>
            <p>
              Upload a resume, import a job posting, and get an ATS-ready analysis with missing
              keywords, smarter phrasing, and practical next edits in minutes.
            </p>
            <div className="hero-actions">
              <Link href="/auth">
                <Button>
                  Start free
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary">See Pro features</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="feature-list">
              {features.map((feature) => (
                <div className="feature-item" key={feature}>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{feature}</strong>
                    <p>Built for fast internship and new-grad application loops.</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="stats-row">
          <Card className="stat-card">
            <div className="card-title-row">
              <strong>Scan faster</strong>
              <Sparkles size={18} />
            </div>
            <p className="muted">Free users get 2 scans per day. Pro unlocks unlimited tailored analysis.</p>
          </Card>
          <Card className="stat-card">
            <div className="card-title-row">
              <strong>Work across devices</strong>
              <Workflow size={18} />
            </div>
            <p className="muted">Use mobile, web, and the Chrome extension with a shared Firebase backend.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
