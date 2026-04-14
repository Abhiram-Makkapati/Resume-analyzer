import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, spacing } from "../theme/tokens";

export const PrimaryButton = ({
  label,
  onPress,
  variant = "primary",
  disabled,
  style
}: {
  label: string;
  onPress?: () => void | Promise<void>;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) => (
  <Pressable onPress={onPress} disabled={disabled} style={style}>
    {variant === "primary" ? (
      <LinearGradient colors={[colors.primary, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, disabled && styles.disabled]}>
        <Text style={styles.primaryLabel}>{label}</Text>
      </LinearGradient>
    ) : (
      <View style={[styles.button, styles.secondary, disabled && styles.disabled]}>
        <Text style={styles.secondaryLabel}>{label}</Text>
      </View>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: colors.border
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.text,
    fontWeight: "700"
  },
  disabled: {
    opacity: 0.55
  }
});
