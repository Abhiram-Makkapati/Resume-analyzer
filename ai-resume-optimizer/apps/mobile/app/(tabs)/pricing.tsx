import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { GlassCard } from "../../src/components/GlassCard";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { SectionTitle } from "../../src/components/SectionTitle";
import { trackMobileEvent } from "../../src/lib/analytics";
import { fetchSubscription } from "../../src/lib/data";
import { getRevenueCatOfferings, purchaseRevenueCatPackage } from "../../src/lib/revenuecat";
import { colors, spacing } from "../../src/theme/tokens";

export default function PricingScreen() {
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  return (
    <Screen>
      <SectionTitle
        eyebrow="Pro"
        title="Upgrade without friction."
        subtitle="RevenueCat handles mobile entitlements while Firebase keeps the subscription state synced in your backend."
      />

      <GlassCard>
        <View style={styles.stack}>
          <Text style={styles.planTitle}>Free</Text>
          <Text style={styles.copy}>2 scans per day, ATS score, keyword analysis, and scan history.</Text>
        </View>
      </GlassCard>

      <GlassCard delay={50}>
        <View style={styles.stack}>
          <Text style={styles.planTitle}>Pro</Text>
          <Text style={styles.copy}>
            Unlimited scans, complete rewrite packs, exports, and deeper analytics over time.
          </Text>
          <PrimaryButton
            label={subscriptionQuery.data?.plan === "pro" ? "Restore / Manage" : "Upgrade with RevenueCat"}
            onPress={async () => {
              await trackMobileEvent(ANALYTICS_EVENTS.paywallViewed);
              const offerings = await getRevenueCatOfferings();
              if (!offerings.length) {
                return;
              }
              await purchaseRevenueCatPackage(offerings[0]);
              await trackMobileEvent(ANALYTICS_EVENTS.subscriptionStarted);
            }}
          />
          {subscriptionQuery.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 23
  }
});
