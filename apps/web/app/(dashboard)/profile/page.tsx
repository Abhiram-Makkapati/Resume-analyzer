"use client";

import { useAuth } from "../../../components/auth-provider";
import { Card } from "../../../components/card";
import { SectionHeading } from "../../../components/section-heading";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscription } from "../../../lib/data";

export default function ProfilePage() {
  const { user } = useAuth();
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  return (
    <>
      <SectionHeading title="Profile & settings" eyebrow="Account">
        Manage your identity, default plan, and connected surfaces across web, mobile, and extension.
      </SectionHeading>

      <Card>
        <div className="feature-list">
          <div className="feature-item">
            <div>
              <strong>{user?.displayName ?? "No display name set"}</strong>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="feature-item">
            <div>
              <strong>Current plan: {subscriptionQuery.data?.plan ?? "free"}</strong>
              <p>Status: {subscriptionQuery.data?.status ?? "inactive"}</p>
            </div>
          </div>
          <div className="feature-item">
            <div>
              <strong>Connected analytics</strong>
              <p>Firebase Analytics records uploads, imports, scans, exports, and upgrades.</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
