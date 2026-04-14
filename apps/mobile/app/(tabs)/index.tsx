import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { ANALYTICS_EVENTS } from "@ai-resume/shared";
import { GlassCard } from "../../src/components/GlassCard";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { SectionTitle } from "../../src/components/SectionTitle";
import { trackMobileEvent } from "../../src/lib/analytics";
import { createAnalysisScan, fetchLatestImportedJob, uploadResumeAsset } from "../../src/lib/data";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function HomeScreen() {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("No resume uploaded yet");
  const importedJobQuery = useQuery({
    queryKey: ["latest-imported-job"],
    queryFn: fetchLatestImportedJob
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResumeAsset,
    onSuccess: async (payload) => {
      setResumeId(payload.resumeId);
      await trackMobileEvent(ANALYTICS_EVENTS.resumeUploaded);
    }
  });

  const scanMutation = useMutation({
    mutationFn: createAnalysisScan,
    onSuccess: async (payload) => {
      await trackMobileEvent(ANALYTICS_EVENTS.scanCompleted, {
        atsScore: payload.result.atsScore
      });
      router.push(`/results/${payload.scanId}`);
    }
  });

  return (
    <Screen>
      <SectionTitle
        eyebrow="Dashboard"
        title="Optimize every application."
        subtitle="Upload your latest PDF, paste a job description, and get an explainable ATS-ready score."
      />

      <GlassCard delay={40}>
        <View style={styles.stack}>
          <Text style={styles.label}>Resume PDF</Text>
          <Text style={styles.helper}>{fileName}</Text>
          <PrimaryButton
            label={uploadMutation.isPending ? "Uploading..." : "Choose PDF"}
            variant="secondary"
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true
              });

              if (result.canceled) {
                return;
              }

              const asset = result.assets[0];
              setFileName(asset.name);
              await uploadMutation.mutateAsync(asset);
            }}
          />
        </View>
      </GlassCard>

      {importedJobQuery.data ? (
        <GlassCard delay={80}>
          <View style={styles.importBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Imported from Chrome</Text>
              <Text style={styles.helper}>
                {importedJobQuery.data.title} at {importedJobQuery.data.company}
              </Text>
            </View>
            <PrimaryButton
              label="Use import"
              variant="secondary"
              onPress={async () => {
                setJobDescription(importedJobQuery.data?.description ?? "");
                await trackMobileEvent(ANALYTICS_EVENTS.jobDescriptionImported);
              }}
            />
          </View>
        </GlassCard>
      ) : null}

      <GlassCard delay={120}>
        <View style={styles.stack}>
          <Text style={styles.label}>Job description</Text>
          <TextInput
            multiline
            numberOfLines={10}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste a role description or import one from the Chrome extension."
            placeholderTextColor={colors.textMuted}
            style={styles.textarea}
          />
          <PrimaryButton
            label={scanMutation.isPending ? "Running scan..." : "Run AI scan"}
            disabled={!resumeId || !jobDescription.trim()}
            onPress={async () => {
              await scanMutation.mutateAsync({
                resumeId: resumeId!,
                jobDescription,
                importedJobId: importedJobQuery.data?.id ?? null
              });
            }}
          />
          {scanMutation.isPending ? <ActivityIndicator color={colors.primary} /> : null}
          {uploadMutation.error ? <Text style={styles.error}>{uploadMutation.error.message}</Text> : null}
          {scanMutation.error ? <Text style={styles.error}>{scanMutation.error.message}</Text> : null}
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md
  },
  importBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  label: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 22
  },
  textarea: {
    minHeight: 220,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: spacing.lg,
    color: colors.text,
    textAlignVertical: "top"
  },
  error: {
    color: "#B24646"
  }
});
