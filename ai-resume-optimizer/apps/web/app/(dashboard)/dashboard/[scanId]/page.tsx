"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { fetchScanWithResult, fetchSubscription } from "../../../../lib/data";
import { trackWebEvent } from "../../../../lib/firebase";
import { ResultsOverview } from "../../../../components/results-overview";
import { SectionHeading } from "../../../../components/section-heading";

export default function ScanResultPage() {
  const params = useParams<{ scanId: string }>();
  const scanQuery = useQuery({
    queryKey: ["scan", params.scanId],
    queryFn: () => fetchScanWithResult(params.scanId)
  });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  useEffect(() => {
    if (scanQuery.data?.result) {
      trackWebEvent(ANALYTICS_EVENTS.atsScoreViewed, {
        atsScore: scanQuery.data.result.atsScore
      });
    }
  }, [scanQuery.data?.result]);

  if (scanQuery.isLoading) {
    return <div>Loading analysis…</div>;
  }

  if (!scanQuery.data?.result) {
    return <div>No result found for this scan.</div>;
  }

  return (
    <>
      <SectionHeading title="AI analysis result" eyebrow="Result">
        Review your ATS score, keyword gaps, and the most valuable edits to make before you apply.
      </SectionHeading>
      <ResultsOverview result={scanQuery.data.result} plan={subscriptionQuery.data?.plan ?? "free"} />
    </>
  );
}
