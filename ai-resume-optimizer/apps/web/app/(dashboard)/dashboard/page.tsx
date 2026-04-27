"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSubscription, fetchUserScans } from "../../../lib/data";
import { Card } from "../../../components/card";
import { SectionHeading } from "../../../components/section-heading";
import { UploadPanel } from "../../../components/upload-panel";

export default function DashboardPage() {
  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: fetchUserScans
  });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  return (
    <>
      <SectionHeading title="Your scan dashboard" eyebrow="Workspace">
        Upload once, compare instantly, and keep every optimization pass in one clean history.
      </SectionHeading>

      <div className="dashboard-grid two-column">
        <UploadPanel />
        <Card>
          <div className="card-title-row">
            <h3>Usage snapshot</h3>
            <span className="metric-chip">{subscriptionQuery.data?.plan ?? "free"} plan</span>
          </div>
          <div className="feature-list">
            <div className="feature-item">
              <div>
                <strong>{scansQuery.data?.length ?? 0} recent scans</strong>
                <p>Every scan stores ATS score, result history, and your latest improvements.</p>
              </div>
            </div>
            <div className="feature-item">
              <div>
                <strong>2 free scans per day</strong>
                <p>Upgrade to Pro for unlimited scans, export versions, and full rewrite coverage.</p>
              </div>
            </div>
            <div className="feature-item">
              <div>
                <strong>Extension-ready imports</strong>
                <p>Bring live job descriptions from Chrome directly into your next optimization pass.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-title-row">
          <h3>Recent activity</h3>
          <span className="metric-chip">{scansQuery.data?.length ?? 0} items</span>
        </div>
        {!scansQuery.data?.length ? (
          <div className="empty-state">
            <strong>No scans yet.</strong>
            <p className="muted">Upload a resume and run your first comparison to start building history.</p>
          </div>
        ) : (
          <div className="feature-list">
            {scansQuery.data.map((scan) => (
              <div key={scan.id} className="scan-row">
                <strong>{scan.atsScore ?? "--"}/100</strong>
                <div>
                  <strong>{scan.status === "completed" ? "Analysis ready" : "Processing"}</strong>
                  <p>{new Date(scan.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
