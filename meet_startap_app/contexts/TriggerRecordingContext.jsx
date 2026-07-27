/*
    TriggerRecordingContext.jsx — global voice-trigger listening + recording.

    Moved out of Recording2.jsx so the hidden speech-recognition WebView and
    the trigger-word monitor keep running — and can still pop up the
    Save/Dismiss card — no matter which screen the user is on.
    Mount <TriggerRecordingProvider> ONCE at the root of the app
    (see app/_layout.jsx). Do NOT put it inside a screen that unmounts.
*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

// ── Local storage config (matches files.jsx) ────────────────────────────────
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

const COLORS = {
  cream: "#F5F0E4",
  maroon: "#8B1A2F",
  text: "#2C1810",
  textMuted: "#6B5B4E",
  white: "#FFFFFF",
};

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
          if (shouldListen) {
            try { recognition.start(); } catch (e) {}
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
          try { recognition.stop(); } catch (e) {}
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

const TriggerRecordingCtx = createContext(null);

export function TriggerRecordingProvider({ children }) {
  const [username, setUsername] = useState("anon");
  const [triggerWord, setTriggerWord] = useState("");

  const [testStatus, setTestStatus] = useState("idle"); // idle | listening | recording
  const [recognized, setRecognized] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [armed, setArmed] = useState(false);
  const [monitorPhase, setMonitorPhase] = useState(null); // null | "listening" | "recording"
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const webviewRef = useRef(null);
  const listenContextRef = useRef(null); // "test" | "monitor"
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
    Alert.alert(
      "Monitoring started",
      `Listening for "${triggerWord}"… This now keeps running anywhere in the app, not just this screen.`
    );
  };

  const disarmMonitoring = () => {
    postToWebview("stop");
    listenContextRef.current = null;
    setArmed(false);
    setMonitorPhase(null);
  };

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
        try { uri = rec.getURI(); } catch {}
        await rec.stopAndUnloadAsync();
        await deleteFileLocally(uri);
      }
    } catch (err) {
      // best-effort — still close and resume
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
      try { uri = rec.getURI(); } catch {}
      await rec.stopAndUnloadAsync();
      recordingRef.current = null;

      if (!uri) throw new Error("No recording file found.");

      const id = genId();
      const localUri = await saveRecordingLocally(uri, id);

      const record = {
        id,
        localUri,
        username,
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

  const value = {
    username,
    setUsername,
    triggerWord,
    setTriggerWord,
    testStatus,
    recognized,
    speechSupported,
    armed,
    monitorPhase,
    handleTest,
    handleSetUp,
  };

  return (
    <TriggerRecordingCtx.Provider value={value}>
      {children}

      {/* Hidden speech-recognition WebView — lives at the app root so
          listening survives navigating to any other screen. */}
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
            }}>
           
           <WebView
                ref={webviewRef}
                source={{ html: SPEECH_HTML }}
                onMessage={handleWebviewMessage}
                style={{ 
                    position: "absolute",
                    width: 0,
                    height: 0,}}
                pointerEvents="none"
                javaScriptEnabled
                domStorageEnabled
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={["*"]}
            />
        </View>

      {/* Triggered-recording popup — rendered at the root so it can appear
          over whatever screen the user is currently on. */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => {}}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>🎙️ Recording</Text>
            <Text style={s.modalSubtitle}>
              Heard “{triggerWord.trim()}” — recording is in progress.
            </Text>
            <Text style={s.modalHint}>
              Save it to keep it on this device, or dismiss to discard it.
            </Text>

            <View style={s.modalButtons}>
              <TouchableOpacity
                style={[s.modalBtn, s.dismissBtn]}
                onPress={handleDismissRecording}
                disabled={saving}
              >
                <Text style={s.modalBtnText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.saveBtn]}
                onPress={handleSaveRecording}
                disabled={saving}
              >
                <Text style={[s.modalBtnText, { fontWeight: "800" }]}>
                  {saving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TriggerRecordingCtx.Provider>
  );
}

export function useTriggerRecording() {
  const ctx = useContext(TriggerRecordingCtx);
  if (!ctx) {
    throw new Error("useTriggerRecording must be used inside <TriggerRecordingProvider>");
  }
  return ctx;
}

const s = StyleSheet.create({
  hiddenWebview: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
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
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: COLORS.maroon, marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: COLORS.text, textAlign: "center", marginBottom: 6 },
  modalHint: { fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: "center" },
  dismissBtn: { backgroundColor: COLORS.textMuted },
  saveBtn: { backgroundColor: COLORS.maroon },
  modalBtnText: { color: COLORS.white, fontSize: 15 },
});
