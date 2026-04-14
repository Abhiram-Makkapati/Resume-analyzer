"use client";

import { useQuery } from "@tanstack/react-query";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { createStripeCheckout, fetchSubscription } from "../../../lib/data";
import { trackWebEvent } from "../../../lib/firebase";
import { Button } from "../../../components/button";
import { Card } from "../../../components/card";
import { SectionHeading } from "../../../components/section-heading";

export default function PricingPage() {
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  return (
    <>
      <SectionHeading title="Pricing" eyebrow="Monetization">
        Keep the free plan lightweight and unlock unlimited scans, tailored rewrites, and exports with Pro.
      </SectionHeading>

      <div className="pricing-row">
        <Card className="pricing-card">
          <div>
            <h3>Free</h3>
            <p>2 scans/day, ATS score, keyword coverage, history, extension import support.</p>
          </div>
          <span className="metric-chip">Current default</span>
        </Card>

        <Card className="pricing-card accent-card">
          <div>
            <h3>Pro</h3>
            <p>Unlimited scans, full rewrite packs, exports, deeper analytics, and richer resume insights.</p>
          </div>
          <Button
            onClick={async () => {
              await trackWebEvent(ANALYTICS_EVENTS.paywallViewed);
              const checkoutUrl = await createStripeCheckout();
              window.location.href = checkoutUrl;
            }}
          >
            {subscriptionQuery.data?.plan === "pro" ? "Manage plan" : "Upgrade with Stripe"}
          </Button>
        </Card>
      </div>
    </>
  );
}
