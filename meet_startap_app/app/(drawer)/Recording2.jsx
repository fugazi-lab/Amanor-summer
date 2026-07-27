import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text as NativeText,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTriggerRecording } from "@/contexts/TriggerRecordingContext";

const Text = ({ style, ...props }) => <NativeText {...props} style={[{ fontFamily: "Ledger_400Regular" }, style]} />;

const COLORS = {
  cream: "#F5F0E4",
  maroon: "#8B1A2F",
  maroonDark: "#6B1424",
  maroonLight: "#A52040",
  text: "#2C1810",
  textMuted: "#6B5B4E",
  textLight: "#9C8A7E",
  divider: "#C4B8A8",
  inputBorder: "#C4B8A8",
  inputBg: "#FDFAF5",
  white: "#FFFFFF",
  success: "#2E7D32",
  error: "#C62828",
  recording: "#B23A1E",
};

export default function RecordingSetupScreen() {
  useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });
  const router = useRouter();
  const { username } = useLocalSearchParams();

  const {
    setUsername,
    triggerWord, setTriggerWord,
    testStatus, recognized, speechSupported,
    armed, monitorPhase,
    handleTest, handleSetUp,
  } = useTriggerRecording();

  // Keep the global recorder's "who is this for" in sync with this screen.
  useEffect(() => {
    if (username) setUsername(username);
  }, [username]);

  const isTestListening = testStatus === "listening";
  const isTestRecording = testStatus === "recording";

  const testButtonLabel = isTestListening
    ? "Listening…"
    : isTestRecording
    ? "Recording… (tap to stop)"
    : "Try your trigger word";

  const setUpButtonLabel = armed
    ? monitorPhase === "recording"
      ? "Recording…"
      : "Stop Monitoring"
    : "Set Up";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      <View style={styles.topBulb}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.bulbLogo} resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Set Up Voice-{"\n"}Triggered Recording</Text>
        <View style={styles.rule} />
        <Text style={styles.subtitle}>
          Choose a trigger word and configure your{"\n"}AmanOr assistant
        </Text>

        <View style={styles.section}>
          <Text style={styles.stepLabel}>1. Choose your trigger word</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your trigger word"
            placeholderTextColor={COLORS.textLight}
            value={triggerWord}
            onChangeText={setTriggerWord}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!armed}
          />
          <Text style={styles.hint}>This word will start recording evidence — anywhere in the app once monitoring is set up.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.stepLabel}>2. Test your trigger word</Text>

          <TouchableOpacity
            style={[
              styles.recordBtn,
              isTestListening && styles.recordBtnActive,
              isTestRecording && styles.recordBtnRecording,
              armed && styles.recordBtnDisabled,
            ]}
            onPress={handleTest}
            activeOpacity={0.85}
            disabled={armed}
          >
            <Text style={styles.recordBtnText}>{testButtonLabel}</Text>
          </TouchableOpacity>

          <Text style={styles.repeatHint}>
            Say your trigger word clearly. If we don't catch it in time, recording will start automatically.
          </Text>

          <View style={styles.feedbackRow}>
            {!speechSupported ? (
              <Text style={styles.feedbackErr}>⚠️ Speech recognition isn't supported on this device.</Text>
            ) : recognized === true ? (
              <Text style={styles.feedbackOk}>✅ Trigger word recognized</Text>
            ) : recognized === false && isTestRecording ? (
              <Text style={styles.feedbackErr}>❌ Didn't catch that — recording started instead.</Text>
            ) : recognized === false ? (
              <Text style={styles.feedbackErr}>❌ Didn't catch that, try again!</Text>
            ) : null}
          </View>
        </View>

        {armed && (
          <View style={styles.armedBanner}>
            <Text style={styles.armedBannerText}>
              {monitorPhase === "recording"
                ? "🔴 Recording — trigger word detected"
                : `👂 Listening for "${triggerWord.trim()}"… (works app-wide)`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.setupBtn, armed && styles.setupBtnArmed]}
          onPress={handleSetUp}
          activeOpacity={0.85}
          disabled={monitorPhase === "recording"}
        >
          <Text style={styles.setupBtnText}>{setUpButtonLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(drawer)/home")}>
        <Text style={styles.backBtnText}>{"< Back"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  topBulb: { paddingHorizontal: 24, paddingTop: 14, alignItems: "flex-start" },
  bulbLogo: { width: 36, height: 36, opacity: 0.6 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32, alignItems: "center" },
  title: {
    fontSize: 36, fontWeight: "800", color: COLORS.maroon, textAlign: "center",
    fontFamily: "OtomanopeeOne_400Regular", lineHeight: 44, letterSpacing: 0.3,
    marginBottom: 18, marginTop: 4,
  },
  rule: { width: "100%", height: 1, backgroundColor: COLORS.divider, marginBottom: 18 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: "center", lineHeight: 23, marginBottom: 32 },
  section: { width: "100%", marginBottom: 28 },
  stepLabel: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 12 },
  input: {
    width: "100%", height: 52, borderWidth: 1.5, borderColor: COLORS.inputBorder,
    borderRadius: 6, paddingHorizontal: 14, backgroundColor: COLORS.inputBg, fontSize: 14, color: COLORS.text,
  },
  hint: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
  recordBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-start",
    backgroundColor: COLORS.maroonDark, borderRadius: 18, paddingVertical: 18, paddingHorizontal: 22,
    gap: 16, width: "100%",
  },
  recordBtnActive: { backgroundColor: COLORS.maroonLight },
  recordBtnRecording: { backgroundColor: COLORS.recording },
  recordBtnDisabled: { opacity: 0.5 },
  recordBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "600", letterSpacing: 0.3, flex: 1, textAlign: "center" },
  repeatHint: { fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", marginTop: 12 },
  feedbackRow: { marginTop: 8, alignItems: "center" },
  feedbackOk: { fontSize: 13, color: COLORS.success, fontWeight: "600" },
  feedbackErr: { fontSize: 13, color: COLORS.error, fontWeight: "600", textAlign: "center" },
  armedBanner: {
    width: "100%", backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.maroonLight,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16, alignItems: "center",
  },
  armedBannerText: { fontSize: 13.5, fontWeight: "700", color: COLORS.maroonDark, textAlign: "center" },
  setupBtn: {
    width: "100%", backgroundColor: COLORS.maroon, borderRadius: 40, paddingVertical: 22,
    alignItems: "center", marginTop: 12,
  },
  setupBtnArmed: { backgroundColor: COLORS.recording },
  setupBtnText: { color: COLORS.white, fontSize: 22, fontWeight: "600", letterSpacing: 0.5, fontFamily: "Ledger_400Regular" },
  backBtn: {
    backgroundColor: COLORS.maroon, borderRadius: 40, paddingVertical: 18, alignItems: "center",
    marginHorizontal: 24, marginBottom: 16,
  },
  backBtnText: { fontFamily: "Ledger_400Regular", fontSize: 20, color: COLORS.white, letterSpacing: 0.5 },
});