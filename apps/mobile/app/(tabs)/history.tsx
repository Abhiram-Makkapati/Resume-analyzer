import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchScans } from "../../src/lib/data";
import { Screen } from "../../src/components/Screen";
import { SectionTitle } from "../../src/components/SectionTitle";
import { GlassCard } from "../../src/components/GlassCard";
import { colors, spacing } from "../../src/theme/tokens";

export default function HistoryScreen() {
  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: fetchScans
  });

  return (
    <Screen>
      <SectionTitle
        eyebrow="History"
        title="Every scan, one timeline."
        subtitle="Open previous analyses and compare the changes you made across different job targets."
      />

      {scansQuery.data?.length ? (
        scansQuery.data.map((scan, index) => (
          <GlassCard key={scan.id} delay={index * 40}>
            <Pressable onPress={() => router.push(`/results/${scan.id}`)} style={styles.row}>
              <Text style={styles.score}>{scan.atsScore ?? "--"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{scan.status === "completed" ? "Open analysis" : "Processing scan"}</Text>
                <Text style={styles.subtitle}>{new Date(scan.createdAt).toLocaleString()}</Text>
              </View>
            </Pressable>
          </GlassCard>
        ))
      ) : (
        <GlassCard>
          <Text style={styles.title}>No scans yet</Text>
          <Text style={styles.subtitle}>Your analysis history will appear here after your first run.</Text>
        </GlassCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  score: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 28
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4
  }
});
