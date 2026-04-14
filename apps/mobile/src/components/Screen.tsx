import { PropsWithChildren } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, spacing } from "../theme/tokens";

export const Screen = ({
  children,
  scroll = true,
  contentStyle
}: PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle }>) => {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <LinearGradient
      colors={["#FFFDF9", "#F4F7FC", "#FAF1EF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    paddingBottom: spacing.xxl
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.lg
  }
});
