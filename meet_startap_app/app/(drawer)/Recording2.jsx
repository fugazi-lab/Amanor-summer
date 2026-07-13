import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Theme ────────────────────────────────────────────────────────────────────
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
  navBg: "#EDE8DC",
};

// ─── Lightweight SVG-free icons ───────────────────────────────────────────────
const LightbulbIcon = ({ size = 30, color = COLORS.maroon }) => {
  const s = size;
  return (
    <View style={{ width: s, height: s + 8, alignItems: "center" }}>
      {/* bulb */}
      <View
        style={{
          width: s * 0.62,
          height: s * 0.62,
          borderRadius: s * 0.31,
          borderWidth: 2.2,
          borderColor: color,
        }}
      />
      {/* neck */}
      <View
        style={{
          width: s * 0.38,
          height: 5,
          backgroundColor: color,
          borderRadius: 2,
          marginTop: 1,
        }}
      />
      {/* base */}
      <View
        style={{
          width: s * 0.28,
          height: 4,
          backgroundColor: color,
          borderRadius: 2,
          marginTop: 2,
        }}
      />
    </View>
  );
};

const MicIcon = ({ size = 20, color = COLORS.white }) => (
  <View style={{ width: size, height: size + 6, alignItems: "center" }}>
    {/* capsule */}
    <View
      style={{
        width: size * 0.52,
        height: size * 0.64,
        borderRadius: size * 0.26,
        borderWidth: 2.2,
        borderColor: color,
      }}
    />
    {/* arch */}
    <View
      style={{
        width: size * 0.78,
        height: size * 0.32,
        borderBottomLeftRadius: size * 0.39,
        borderBottomRightRadius: size * 0.39,
        borderWidth: 2.2,
        borderTopWidth: 0,
        borderColor: color,
        marginTop: -3,
      }}
    />
    {/* stand */}
    <View style={{ width: 2, height: size * 0.18, backgroundColor: color, marginTop: 1 }} />
    {/* base bar */}
    <View style={{ width: size * 0.44, height: 2, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

const HomeIcon = ({ color = COLORS.textMuted, size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "flex-end" }}>
    {/* roof */}
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.5,
        borderRightWidth: size * 0.5,
        borderBottomWidth: size * 0.42,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: color,
        position: "absolute",
        top: 0,
      }}
    />
    {/* body */}
    <View
      style={{
        width: size * 0.66,
        height: size * 0.5,
        backgroundColor: color,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 2,
      }}
    >
      <View style={{ width: size * 0.26, height: size * 0.34, backgroundColor: COLORS.navBg, borderRadius: 1 }} />
    </View>
  </View>
);

const PlusCircleIcon = ({ color = COLORS.maroon, size = 26 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: color,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <View style={{ width: size * 0.5, height: 2, backgroundColor: color, position: "absolute" }} />
    <View style={{ width: 2, height: size * 0.5, backgroundColor: color, position: "absolute" }} />
  </View>
);

const SupportIcon = ({ color = COLORS.textMuted, size = 24 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: color,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: size * 0.44, color, fontWeight: "700", lineHeight: size * 0.5 }}>?</Text>
  </View>
);

// ─── Bottom Nav Bar ───────────────────────────────────────────────────────────
function BottomNavBar({ active = "Home" }) {
  const router = useRouter();

  const tabs = [
    { key: "Home", label: "Home", route: "/(drawer)/home", Icon: HomeIcon },
    { key: "Report", label: "REPORT", route: "/(drawer)/report", Icon: PlusCircleIcon },
    { key: "Support", label: "Support", route: "/(drawer)/index", Icon: SupportIcon },
  ];

  return (
    <View style={nav.bar}>
      {tabs.map(({ key, label, route, Icon }) => {
        const isActive = active === key;
        const isReport = key === "Report";
        const color = isReport ? COLORS.maroon : isActive ? COLORS.maroon : COLORS.textMuted;
        return (
          <TouchableOpacity
            key={key}
            style={nav.tab}
            onPress={() => router.push(route)}
            activeOpacity={0.7}
          >
            <Icon color={color} size={isReport ? 26 : 24} />
            <Text style={[nav.label, { color }, isReport && nav.reportLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const nav = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: COLORS.navBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  reportLabel: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RecordingSetupScreen() {
  const [triggerWord, setTriggerWord] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognized, setRecognized] = useState(null); // null | true | false

  const handleRecord = () => {
    if (!triggerWord.trim()) {
      Alert.alert("Missing trigger word", "Please enter a trigger word before recording.");
      return;
    }
    setIsRecording(true);
    setRecognized(null);
    // Simulates a 2-second recording attempt
    setTimeout(() => {
      setIsRecording(false);
      setRecognized(Math.random() > 0.35);
    }, 2000);
  };

  const handleSetUp = () => {
    if (!triggerWord.trim()) {
      Alert.alert("Missing trigger word", "Please enter a trigger word.");
      return;
    }
    if (recognized !== true) {
      Alert.alert("Test first", "Please record and confirm your trigger word before setting up.");
      return;
    }
    Alert.alert("✅ All set!", `"${triggerWord}" will now activate recording.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      {/* Bulb logo top-left */}
      <View style={styles.topBulb}>
        <Image
          source={require("../../assets/bulblogo.png")}
          style={styles.bulbLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <Text style={styles.title}>Set Up Voice-{"\n"}Activated Recording</Text>

        {/* ── Thin rule under title ── */}
        <View style={styles.rule} />

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Subtitle ── */}
        <Text style={styles.subtitle}>
          Choose a trigger word and configure you{"\n"}AmanOr assistant
        </Text>

        {/* ── Step 1 ── */}
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
          />
          <Text style={styles.hint}>This word will start recording evidence.</Text>
        </View>

        {/* ── Step 2 ── */}
        <View style={styles.section}>
          <Text style={styles.stepLabel}>2. Test your trigger word</Text>

          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
            onPress={handleRecord}
            activeOpacity={0.85}
          >
            <Text style={styles.recordBtnText}>
              {isRecording ? "Listening…" : "Record your trigger word"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.repeatHint}>Repeat your trigger word multiple times.</Text>

          {/* Feedback */}
          <View style={styles.feedbackRow}>
            {recognized === null ? (
              <Text style={styles.feedbackMuted}>
                ✅ Trigger word recognized {"  "}/ {"  "}❌ Didn't catch that, try again!
              </Text>
            ) : recognized ? (
              <Text style={styles.feedbackOk}>✅ Trigger word recognized</Text>
            ) : (
              <Text style={styles.feedbackErr}>❌ Didn't catch that, try again!</Text>
            )}
          </View>
        </View>

        {/* ── Set Up button ── */}
        <TouchableOpacity style={styles.setupBtn} onPress={handleSetUp} activeOpacity={0.85}>
          <Text style={styles.setupBtnText}>Set Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  topBulb: {
    paddingHorizontal: 24,
    paddingTop: 14,
    alignItems: "flex-start",
  },
  bulbLogo: {
    width: 36,
    height: 36,
    opacity: 0.6,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },

  // Large centered serif title
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.maroon,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 44,
    letterSpacing: 0.3,
    marginBottom: 18,
    marginTop: 4,
  },

  // Thin rule below title
  rule: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 18,
  },

  // Divider (kept for compatibility)
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 14,
  },

  // Subtitle
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 32,
  },

  // Step section
  section: {
    width: "100%",
    marginBottom: 28,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },

  // Full-border input (matches screenshot)
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 14,
    backgroundColor: COLORS.inputBg,
    fontSize: 14,
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
  },

  // Record button — full width, mic left, text right
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: COLORS.maroonDark,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    gap: 16,
    shadowColor: COLORS.maroonDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
  },
  recordBtnActive: {
    backgroundColor: COLORS.maroonLight,
  },
  recordBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    flex: 1,
    textAlign: "center",
  },
  repeatHint: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 12,
  },

  // Feedback
  feedbackRow: {
    marginTop: 8,
    alignItems: "center",
  },
  feedbackMuted: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  feedbackOk: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: "600",
  },
  feedbackErr: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: "600",
  },

  // Set Up button — large pill
  setupBtn: {
    width: "100%",
    backgroundColor: COLORS.maroon,
    borderRadius: 40,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 12,
    shadowColor: COLORS.maroonDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  setupBtnText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});