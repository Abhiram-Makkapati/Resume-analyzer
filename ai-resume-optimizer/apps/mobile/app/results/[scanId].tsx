import { useEffect } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { GlassCard } from "../../src/components/GlassCard";
import { Screen } from "../../src/components/Screen";
import { SectionTitle } from "../../src/components/SectionTitle";
import { trackMobileEvent } from "../../src/lib/analytics";
import { fetchScanResult, fetchSubscription } from "../../src/lib/data";
import { useMobileAuth } from "../../src/providers/auth-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function ResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { user, isLoading } = useMobileAuth();
  const scanQuery = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => fetchScanResult(scanId)
  });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  useEffect(() => {
    const score = scanQuery.data?.result?.atsScore;
    if (score !== undefined) {
      trackMobileEvent(ANALYTICS_EVENTS.atsScoreViewed, { atsScore: score });
    }
  }, [scanQuery.data?.result?.atsScore]);

  if (!isLoading && !user) {
    return <Redirect href="/auth" />;
  }

  if (!scanQuery.data?.result) {
    return (
      <Screen>
        <SectionTitle eyebrow="Result" title="Loading analysis" subtitle="Your latest scan will appear here shortly." />
      </Screen>
    );
  }

  const result = scanQuery.data.result;

  return (
    <Screen>
      <SectionTitle
        eyebrow="Result"
        title={`ATS score: ${result.atsScore}/100`}
        subtitle={result.summary}
      />

      <GlassCard>
        <Text style={styles.label}>Confidence note</Text>
        <Text style={styles.body}>{result.confidenceNote}</Text>
      </GlassCard>

      <GlassCard delay={40}>
        <Text style={styles.label}>Matched keywords</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {result.matchedKeywords.map((item) => (
            <View key={item.keyword} style={styles.successPill}>
              <Text style={styles.successText}>{item.keyword}</Text>
            </View>
          ))}
        </ScrollView>
      </GlassCard>

      <GlassCard delay={80}>
        <Text style={styles.label}>Missing keywords</Text>
        <View style={styles.stack}>
          {result.missingKeywords.map((item) => (
            <View key={item.keyword}>
              <Text style={styles.title}>{item.keyword}</Text>
              <Text style={styles.body}>{item.rationale}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard delay={120}>
        <Text style={styles.label}>Bullet rewrites</Text>
        <View style={styles.stack}>
          {result.bulletRewrites
            .slice(0, subscriptionQuery.data?.plan === "pro" ? undefined : 2)
            .map((rewrite) => (
              <View key={rewrite.original} style={styles.rewriteCard}>
                <Text style={styles.caption}>Original</Text>
                <Text style={styles.body}>{rewrite.original}</Text>
                <Text style={styles.caption}>Improved</Text>
                <Text style={styles.title}>{rewrite.rewritten}</Text>
              </View>
            ))}
          {subscriptionQuery.data?.plan !== "pro" ? (
            <Text style={styles.upgradeNote}>Upgrade to Pro to unlock the full tailored rewrite set.</Text>
          ) : null}
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.sm
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22
  },
  caption: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6
  },
  stack: {
    gap: spacing.md
  },
  rewriteCard: {
    gap: spacing.xs,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.74)",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  pillRow: {
    gap: spacing.sm
  },
  successPill: {
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  successText: {
    color: "#0F6F6A",
    fontWeight: "700"
  },
  upgradeNote: {
    color: "#A54E3D"
  }
});
