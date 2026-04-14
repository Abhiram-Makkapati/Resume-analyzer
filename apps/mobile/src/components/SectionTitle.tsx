import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/tokens";

export const SectionTitle = ({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.eyebrow}>{eyebrow}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  eyebrow: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    color: colors.primary,
    backgroundColor: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24
  }
});
