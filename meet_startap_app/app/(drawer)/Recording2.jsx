/*
    Recording2.jsx — voice-activated trigger setup + live monitor.

    Flow:
      1. User types a trigger word and taps "Try your trigger word" to test
         that speech recognition (running inside a hidden WebView) can hear it.
      2. Once the test succeeds, tapping "Set Up" arms continuous listening
         for that word.
      3. The moment the word is heard, recording starts automatically and a
         popup appears with "Dismiss" (discard) and "Save" (keep) buttons.
      4. "Save" writes the audio to the SAME local store used by files.jsx —
         copied into this app's private document directory, indexed in
         AsyncStorage — so it shows up right alongside uploaded media there.

    Install first:
      npx expo install react-native-webview expo-av expo-file-system
        @react-native-async-storage/async-storage

    NOTE: continuous in-app speech recognition here relies on the browser's
    Web Speech API (`webkitSpeechRecognition`), available inside Android's
    WebView (Chromium) but NOT supported in iOS's WKWebView. On iOS this is
    detected and reported, since there is no in-app fallback for live
    trigger-word listening without a native speech module.
*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
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
import { WebView } from "react-native-webview";

const Text = ({ style, ...props }) => <NativeText {...props} style={[{ fontFamily: "Ledger_400Regular" }, style]} />;

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
  recording: "#B23A1E",
  navBg: "#EDE8DC",
};

// ─── Local storage config (matches files.jsx exactly) ─────────────────────────
// Using the same MEDIA_DIR / INDEX_KEY means trigger-word recordings saved
// here appear in the "Your Media" list on files.jsx too.
const MEDIA_DIR = `${FileSystem.documentDirectory}amanor_media/`;
const INDEX_KEY = "amanor_files_index_v1";

const ensureMediaDir = async () => {
  const info = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
};

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const readIndex = async () => {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeIndex = async (list) => {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(list));
};

const extFromName = (name) => {
  const m = /\.[^/.]+$/.exec(name || "");
  return m ? m[0] : "";
};

const getErrMsg = (err) => {
  if (!err) return "Unknown error.";
  if (typeof err === "string") return err;
  return err.message || JSON.stringify(err) || "Unknown error.";
};

// Moves the just-finished recording into this app's private media folder
// and returns the local URI the record should point to (mirrors
// files.jsx's saveFileLocally, adapted for a live-recorded file).
const saveRecordingLocally = async (uri, id) => {
  await ensureMediaDir();

  if (Platform.OS === "web") {
    const res = await fetch(uri);
    const blob = await res.blob();
    const dataUri = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read recording."));
      reader.readAsDataURL(blob);
    });
    return dataUri;
  }

  const ext = extFromName(uri) || ".m4a";
  const dest = `${MEDIA_DIR}${id}${ext}`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  return dest;
};

const deleteFileLocally = async (uri) => {
  if (!uri || Platform.OS === "web") return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // best-effort cleanup only
  }
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

// ─── Speech-recognition WebView bridge ────────────────────────────────────────
// Runs the browser's Web Speech API inside a hidden WebView and relays
// recognized transcripts back to React Native via postMessage.
// NOTE: relies on `webkitSpeechRecognition`, available in Android's WebView
// (Chromium) but NOT supported in iOS's WKWebView.
const SPEECH_HTML = `
<!DOCTYPE html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body>
    <script>
      let recognition = null;
      let shouldListen = false;

      function post(msg) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }

      function startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          post({ type: "unsupported" });
          return;
        }

        shouldListen = true;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = function (event) {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
          }
          post({ type: "result", transcript: transcript.trim() });
        };

        recognition.onerror = function (event) {
          post({ type: "error", error: event.error });
        };

        recognition.onend = function () {
          // Browsers auto-stop recognition periodically; restart while
          // we're still supposed to be listening (keeps it "continuous").
          if (shouldListen) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        try {
          recognition.start();
          post({ type: "started" });
        } catch (e) {
          post({ type: "error", error: String(e) });
        }
      }

      function stopListening() {
        shouldListen = false;
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {}
        }
      }

      document.addEventListener("message", handleMessage);
      window.addEventListener("message", handleMessage);

      function handleMessage(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.command === "start") startListening();
          if (data.command === "stop") stopListening();
        } catch (e) {}
      }
    </script>
  </body>
</html>
`;

const TEST_LISTEN_TIMEOUT_MS = 6000;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RecordingSetupScreen() {
  useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const user = username || "anon";

  const [triggerWord, setTriggerWord] = useState("");

  // Step 2 "Try your trigger word" test flow
  const [testStatus, setTestStatus] = useState("idle"); // idle | listening | recording
  const [recognized, setRecognized] = useState(null); // null | true | false
  const [speechSupported, setSpeechSupported] = useState(true);

  // Post "Set Up" continuous monitor
  const [armed, setArmed] = useState(false);
  const [monitorPhase, setMonitorPhase] = useState(null); // null | "listening" | "recording"
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const webviewRef = useRef(null);
  const listenContextRef = useRef(null); // "test" | "monitor" — which flow the WebView is currently serving
  const testTimeoutRef = useRef(null);
  const recordingRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(testTimeoutRef.current);
      postToWebview("stop");
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postToWebview = (command) => {
    webviewRef.current?.postMessage(JSON.stringify({ command }));
  };

  // ── WebView message handling (shared by test + monitor flows) ──────────────
  const handleWebviewMessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (data.type === "unsupported") {
      setSpeechSupported(false);
      clearTimeout(testTimeoutRef.current);

      if (listenContextRef.current === "test" && testStatus === "listening") {
        setRecognized(false);
        startTestFallbackRecording();
      }
      if (listenContextRef.current === "monitor" && armed) {
        setArmed(false);
        setMonitorPhase(null);
        Alert.alert(
          "Speech recognition unavailable",
          "Your device doesn't support in-app speech recognition, so live trigger-word monitoring can't run. Try on Android."
        );
      }
      return;
    }

    if (data.type !== "result") return;

    const heard = data.transcript.toLowerCase();
    const target = triggerWord.trim().toLowerCase();
    if (!target || !heard.includes(target)) return;

    if (listenContextRef.current === "test" && testStatus === "listening") {
      clearTimeout(testTimeoutRef.current);
      postToWebview("stop");
      setTestStatus("idle");
      setRecognized(true);
      return;
    }

    if (listenContextRef.current === "monitor" && armed && monitorPhase === "listening") {
      postToWebview("stop");
      setMonitorPhase("recording");
      startTriggeredRecording();
    }
  };

  // ── Step 2: test the trigger word ───────────────────────────────────────────
  const handleTest = () => {
    if (testStatus === "recording") {
      stopTestFallbackRecording();
      return;
    }
    if (testStatus === "listening" || armed) return;

    if (!triggerWord.trim()) {
      Alert.alert("Missing trigger word", "Please enter a trigger word before testing.");
      return;
    }

    setRecognized(null);
    setTestStatus("listening");
    listenContextRef.current = "test";
    postToWebview("start");

    testTimeoutRef.current = setTimeout(() => {
      postToWebview("stop");
      setRecognized(false);
      startTestFallbackRecording();
    }, TEST_LISTEN_TIMEOUT_MS);
  };

  const startTestFallbackRecording = async () => {
    try {
      const { status: permStatus } = await Audio.requestPermissionsAsync();
      if (permStatus !== "granted") {
        setTestStatus("idle");
        Alert.alert("Microphone permission needed", "Enable microphone access to record.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setTestStatus("recording");
    } catch (e) {
      setTestStatus("idle");
      Alert.alert("Recording failed", "Something went wrong while starting the recording.");
    }
  };

  const stopTestFallbackRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } finally {
      setTestStatus("idle");
    }
  };

  // ── Set Up: arm / disarm continuous monitoring ──────────────────────────────
  const handleSetUp = () => {
    if (armed) {
      disarmMonitoring();
      return;
    }

    if (!triggerWord.trim()) {
      Alert.alert("Missing trigger word", "Please enter a trigger word.");
      return;
    }
    if (recognized !== true) {
      Alert.alert("Test first", "Please try your trigger word and confirm before setting up.");
      return;
    }
    if (testStatus !== "idle") return;

    setArmed(true);
    setMonitorPhase("listening");
    listenContextRef.current = "monitor";
    postToWebview("start");
    Alert.alert("Monitoring started", `Listening for "${triggerWord}"…`);
  };

  const disarmMonitoring = () => {
    postToWebview("stop");
    listenContextRef.current = null;
    setArmed(false);
    setMonitorPhase(null);
  };

  // ── Trigger heard → record → popup ──────────────────────────────────────────
  const startTriggeredRecording = async () => {
    try {
      const { status: permStatus } = await Audio.requestPermissionsAsync();
      if (permStatus !== "granted") {
        Alert.alert("Microphone permission needed", "Enable microphone access to record.");
        disarmMonitoring();
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setModalVisible(true);
    } catch (e) {
      Alert.alert("Recording failed", "Something went wrong while starting the recording.");
      setMonitorPhase(armed ? "listening" : null);
      if (armed) {
        listenContextRef.current = "monitor";
        postToWebview("start");
      }
    }
  };

  const resumeMonitoringIfArmed = () => {
    setModalVisible(false);
    if (armed) {
      setMonitorPhase("listening");
      listenContextRef.current = "monitor";
      postToWebview("start");
    } else {
      setMonitorPhase(null);
    }
  };

  const handleDismissRecording = async () => {
    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) {
        let uri = null;
        try {
          uri = rec.getURI();
        } catch {}
        await rec.stopAndUnloadAsync();
        await deleteFileLocally(uri);
      }
    } catch (err) {
      // best-effort — still close the popup and resume monitoring
    } finally {
      resumeMonitoringIfArmed();
    }
  };

  const handleSaveRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) {
      resumeMonitoringIfArmed();
      return;
    }

    setSaving(true);
    try {
      let uri = null;
      try {
        uri = rec.getURI();
      } catch {}
      await rec.stopAndUnloadAsync();
      recordingRef.current = null;

      if (!uri) throw new Error("No recording file found.");

      const id = genId();
      const localUri = await saveRecordingLocally(uri, id);

      const record = {
        id,
        localUri,
        username: user,
        fileName: `${triggerWord.trim() || "trigger"}-recording${extFromName(uri) || ".m4a"}`,
        mimeType: "audio/m4a",
        name: `Trigger: ${triggerWord.trim()}`,
        company: "",
        description: `Auto-recorded when the trigger word "${triggerWord.trim()}" was detected.`,
        createdAt: new Date().toISOString(),
      };

      const all = await readIndex();
      all.push(record);
      await writeIndex(all);

      Alert.alert("Saved!", "The recording is saved on this device.");
    } catch (err) {
      Alert.alert("Save failed", getErrMsg(err));
    } finally {
      setSaving(false);
      resumeMonitoringIfArmed();
    }
  };

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

      {/* Hidden speech-recognition WebView, shared by the test + monitor flows */}
      <WebView
        ref={webviewRef}
        source={{ html: SPEECH_HTML }}
        onMessage={handleWebviewMessage}
        style={styles.hiddenWebview}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*"]}
      />

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
        <Text style={styles.title}>Set Up Voice-{"\n"}Triggered Recording</Text>

        {/* ── Thin rule under title ── */}
        <View style={styles.rule} />

        {/* ── Subtitle ── */}
        <Text style={styles.subtitle}>
          Choose a trigger word and configure your{"\n"}AmanOr assistant
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
            editable={!armed}
          />
          <Text style={styles.hint}>This word will start recording evidence.</Text>
        </View>

        {/* ── Step 2 ── */}
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

          {/* Feedback */}
          <View style={styles.feedbackRow}>
            {!speechSupported ? (
              <Text style={styles.feedbackErr}>
                ⚠️ Speech recognition isn't supported on this device.
              </Text>
            ) : recognized === null && testStatus === "idle" ? (
              null
            ) : recognized === true ? (
              <Text style={styles.feedbackOk}>✅ Trigger word recognized</Text>
            ) : recognized === false && isTestRecording ? (
              <Text style={styles.feedbackErr}>❌ Didn't catch that — recording started instead.</Text>
            ) : recognized === false ? (
              <Text style={styles.feedbackErr}>❌ Didn't catch that, try again!</Text>
            ) : null}
          </View>
        </View>

        {/* ── Armed / monitoring banner ── */}
        {armed && (
          <View style={styles.armedBanner}>
            <Text style={styles.armedBannerText}>
              {monitorPhase === "recording"
                ? "🔴 Recording — trigger word detected"
                : `👂 Listening for "${triggerWord.trim()}"…`}
            </Text>
          </View>
        )}

        {/* ── Set Up button ── */}
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

      {/* ── Triggered-recording popup ── */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎙️ Recording</Text>
            <Text style={styles.modalSubtitle}>
              Heard "{triggerWord.trim()}" — recording is in progress.
            </Text>
            <Text style={styles.modalHint}>
              Save it to keep it on this device, or dismiss to discard it.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.dismissBtn]}
                onPress={handleDismissRecording}
                disabled={saving}
              >
                <Text style={styles.modalBtnText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveRecording}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { fontWeight: "800" }]}>
                  {saving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  hiddenWebview: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
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
    fontFamily: "OtomanopeeOne_400Regular",
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
  recordBtnRecording: {
    backgroundColor: COLORS.recording,
  },
  recordBtnDisabled: {
    opacity: 0.5,
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
    textAlign: "center",
  },

  // Armed / monitoring banner
  armedBanner: {
    width: "100%",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.maroonLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  armedBannerText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.maroonDark,
    textAlign: "center",
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
  setupBtnArmed: {
    backgroundColor: COLORS.recording,
  },
  setupBtnText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0.5,
    fontFamily: "Ledger_400Regular",
  },
  backBtn: { backgroundColor: COLORS.maroon, borderRadius: 40, paddingVertical: 18, alignItems: "center", marginHorizontal: 24, marginBottom: 16, shadowColor: COLORS.maroon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  backBtnText: { fontFamily: "Ledger_400Regular", fontSize: 20, color: COLORS.white, letterSpacing: 0.5 },

  // Triggered-recording popup
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44,24,16,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    padding: 24,
    borderTopWidth: 4,
    borderTopColor: COLORS.maroon,
    shadowColor: COLORS.maroonDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.maroon,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  modalHint: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  dismissBtn: {
    backgroundColor: COLORS.textMuted,
  },
  saveBtn: {
    backgroundColor: COLORS.maroon,
  },
  modalBtnText: {
    color: COLORS.white,
    fontSize: 15,
  },
});
