"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchUserScans } from "../../../lib/data";
import { Card } from "../../../components/card";
import { SectionHeading } from "../../../components/section-heading";

export default function HistoryPage() {
  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: fetchUserScans
  });

  return (
    <>
      <SectionHeading title="Scan history" eyebrow="Timeline">
        Track every optimization pass and compare which changes drive stronger ATS outcomes over time.
      </SectionHeading>

      <Card>
        {!scansQuery.data?.length ? (
          <div className="empty-state">
            <strong>Your history is empty.</strong>
            <p className="muted">Scans will appear here after your first resume comparison.</p>
          </div>
        ) : (
          <div className="feature-list">
            {scansQuery.data.map((scan) => (
              <Link key={scan.id} href={`/dashboard/${scan.id}`} className="scan-row">
                <strong>{scan.atsScore ?? "--"}/100</strong>
                <div>
                  <strong>{scan.status === "completed" ? "Open result" : "Still processing"}</strong>
                  <p>{new Date(scan.createdAt).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
