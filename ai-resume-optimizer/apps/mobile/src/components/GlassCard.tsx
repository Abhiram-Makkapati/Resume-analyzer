import { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radii, spacing } from "../theme/tokens";

export const GlassCard = ({
  children,
  style,
  delay = 0
}: PropsWithChildren<{ style?: ViewStyle; delay?: number }>) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={[styles.card, style]}>
    {children}
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#7282B7",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6
  }
});
