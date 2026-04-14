import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { GlassCard } from "../src/components/GlassCard";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { Screen } from "../src/components/Screen";
import { SectionTitle } from "../src/components/SectionTitle";
import { mobileEnv } from "../src/lib/env";
import { useMobileAuth } from "../src/providers/auth-provider";
import { colors, radii, spacing } from "../src/theme/tokens";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { signInWithEmail, signInWithGoogleToken, signUpWithEmail } = useMobileAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: mobileEnv.googleExpoClientId,
    iosClientId: mobileEnv.googleIosClientId,
    androidClientId: mobileEnv.googleAndroidClientId,
    webClientId: mobileEnv.googleWebClientId,
    redirectUri: makeRedirectUri()
  });

  useEffect(() => {
    const signIn = async () => {
      const token = response?.params.id_token;
      if (!token) {
        return;
      }

      await signInWithGoogleToken(token);
      router.replace("/(tabs)");
    };

    signIn().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Google sign-in failed.");
    });
  }, [response, signInWithGoogleToken]);

  return (
    <Screen contentStyle={styles.container}>
      <SectionTitle
        eyebrow="Welcome"
        title="Build better applications on the go."
        subtitle="Analyze your resume, import jobs from Chrome, and keep every scan synced across mobile and web."
      />

      <GlassCard>
        <View style={styles.form}>
          <TextInput
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <PrimaryButton
            label={mode === "signin" ? "Sign in" : "Create account"}
            onPress={async () => {
              try {
                setError("");
                if (mode === "signin") {
                  await signInWithEmail(email, password);
                } else {
                  await signUpWithEmail(email, password);
                }
                router.replace("/(tabs)");
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : "Authentication failed.");
              }
            }}
          />
          <PrimaryButton label="Continue with Google" variant="secondary" onPress={() => promptAsync()} />
          <Text style={styles.switchText} onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    minHeight: "100%",
    gap: spacing.xl
  },
  form: {
    gap: spacing.md
  },
  input: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  switchText: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600"
  },
  errorText: {
    color: "#B24646"
  }
});
