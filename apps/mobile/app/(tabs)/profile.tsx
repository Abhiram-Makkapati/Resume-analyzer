import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "../../src/components/GlassCard";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { SectionTitle } from "../../src/components/SectionTitle";
import { fetchSubscription } from "../../src/lib/data";
import { useMobileAuth } from "../../src/providers/auth-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function ProfileScreen() {
  const { user, signOutUser } = useMobileAuth();
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription
  });

  return (
    <Screen>
      <SectionTitle
        eyebrow="Profile"
        title="Your optimizer identity."
        subtitle="Manage account access, plan details, and the surfaces that share your resume data."
      />

      <GlassCard>
        <View style={styles.stack}>
          <Text style={styles.title}>{user?.displayName ?? "Resume Optimizer user"}</Text>
          <Text style={styles.copy}>{user?.email}</Text>
          <Text style={styles.copy}>Plan: {subscriptionQuery.data?.plan ?? "free"}</Text>
          <PrimaryButton label="Sign out" variant="secondary" onPress={signOutUser} />
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 22
  }
});
