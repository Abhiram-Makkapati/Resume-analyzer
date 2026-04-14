import "react-native-reanimated";
import { Stack } from "expo-router";
import { AppProvider } from "../src/providers/app-provider";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="results/[scanId]" />
      </Stack>
    </AppProvider>
  );
}
