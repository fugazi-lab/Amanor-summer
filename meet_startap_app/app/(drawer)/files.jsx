/*
    files.jsx — your media locker.
    pick a file → give it a name, description, and company → saved LOCALLY on device.

    Uploads are no longer sent to Appwrite. The file itself is copied into this
    app's private document directory, and its metadata (name/company/description/
    username) is kept in AsyncStorage as a simple JSON index.

    Install first:
      npx expo install expo-file-system @react-native-async-storage/async-storage

    NOTE: because everything lives on-device now, other screens that used to read
    the Appwrite "files" collection (flagged.jsx, report-pick.jsx) will NOT see
    these files anymore — there is no server-side copy to query.
*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── LOCAL STORAGE CONFIG ─────────────────────────────────────
const MEDIA_DIR = `${FileSystem.documentDirectory}amanor_media/`;
const INDEX_KEY = "amanor_files_index_v1";

const ensureMediaDir = async () => {
  const info = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
};

const genId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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

// ── COLOURS ──────────────────────────────────────────────────
const C = {
  bg:       "#fffaeb",
  brown:    "#b38e75",
  dark:     "#6d4d40",
  pink:     "#d395a2",
  burgundy: "#8b2c3a",
};

// ── HELPERS ──────────────────────────────────────────────────
const isAudio = (mime) => mime?.startsWith("audio/");
const isVideo = (mime) => mime?.startsWith("video/");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const getErrMsg = (err) => {
  if (!err) return "Unknown error.";
  if (typeof err === "string") return err;
  return err.message || JSON.stringify(err) || "Unknown error.";
};

const extFromName = (name) => {
  const m = /\.[^/.]+$/.exec(name || "");
  return m ? m[0] : "";
};

// ── SAVE FILE TO DEVICE ──────────────────────────────────────
// Copies the picked asset into this app's private document directory and
// returns the local file:// URI that the record should point to.
const saveFileLocally = async (asset, id) => {
  await ensureMediaDir();
  const dest = `${MEDIA_DIR}${id}${extFromName(asset.name)}`;

  if (Platform.OS === "web") {
    // On web there's no real filesystem — persist the picked file as a
    // base64 data URI inside AsyncStorage-backed metadata instead of copying.
    if (!asset.file) throw new Error("No file object. Try re-selecting the file.");
    const dataUri = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(asset.file);
    });
    return dataUri;
  }

  await FileSystem.copyAsync({ from: asset.uri, to: dest });
  return dest;
};

const deleteFileLocally = async (uri) => {
  if (!uri || Platform.OS === "web") return; // data URIs need no cleanup
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // best-effort cleanup only
  }
};

// ── AUDIO PLAYER ─────────────────────────────────────────────
function AudioRow({ file, onDelete }) {
  const [sound, setSound]     = useState(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = async () => {
    try {
      if (sound) {
        if (playing) { await sound.pauseAsync(); setPlaying(false); }
        else         { await sound.playAsync();  setPlaying(true);  }
      } else {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: file.localUri }, { shouldPlay: true }
        );
        s.setOnPlaybackStatusUpdate((st) => { if (st.didJustFinish) setPlaying(false); });
        setSound(s);
        setPlaying(true);
      }
    } catch (err) {
      Alert.alert("Playback error", getErrMsg(err));
    }
  };

  return (
    <View style={styles.fileCard}>
      <View style={[styles.fileIconBox, { backgroundColor: "#e8f4fd" }]}>
        <Text style={styles.fileEmoji}>🎵</Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{file.name || file.fileName}</Text>
        {!!file.company && <Text style={styles.fileCompany}>🏢 {file.company}</Text>}
        {!!file.description && <Text style={styles.fileDesc} numberOfLines={2}>{file.description}</Text>}
        <Text style={styles.fileMeta}>{formatDate(file.createdAt)}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
        <Text style={styles.playButtonText}>{playing ? "⏸" : "▶"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(file)}>
        <Text style={styles.deleteButtonText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── VIDEO PLAYER ─────────────────────────────────────────────
function VideoRow({ file, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.fileCard}>
      {expanded ? (
        <View style={{ width: "100%" }}>
          <Text style={styles.fileName}>{file.name || file.fileName}</Text>
          {!!file.company && <Text style={styles.fileCompany}>🏢 {file.company}</Text>}
          {!!file.description && <Text style={styles.fileDesc}>{file.description}</Text>}
          <Video
            source={{ uri: file.localUri }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
          <TouchableOpacity style={styles.collapseButton} onPress={() => setExpanded(false)}>
            <Text style={styles.collapseText}>▲ collapse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.fileIconBox, { backgroundColor: "#f0e8ff" }]}>
            <Text style={styles.fileEmoji}>🎬</Text>
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{file.name || file.fileName}</Text>
            {!!file.company && <Text style={styles.fileCompany}>🏢 {file.company}</Text>}
            {!!file.description && <Text style={styles.fileDesc} numberOfLines={2}>{file.description}</Text>}
            <Text style={styles.fileMeta}>{formatDate(file.createdAt)}</Text>
          </View>
          <TouchableOpacity style={styles.playButton} onPress={() => setExpanded(true)}>
            <Text style={styles.playButtonText}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(file)}>
            <Text style={styles.deleteButtonText}>🗑</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────
export default function FilesScreen() {
  const { username } = useLocalSearchParams();
  const user = username || "anon";

  const [files, setFiles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading]   = useState(false);

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAsset, setPendingAsset] = useState(null);
  const [inputName, setInputName]       = useState("");
  const [inputCompany, setInputCompany] = useState("");
  const [inputDesc, setInputDesc]       = useState("");

  // ── FETCH (from local AsyncStorage index) ──────────────────
  const fetchFiles = async () => {
    try {
      const all = await readIndex();
      const mine = all
        .filter((f) => f.username === user)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFiles(mine);
    } catch (err) {
      console.error("Fetch error:", getErrMsg(err));
      Alert.alert("Error", "Couldn't load your files.\n" + getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchFiles(); }, []);

  // ── STEP 1: pick file → open modal ────────────────────────
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "video/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const baseName = asset.name.replace(/\.[^/.]+$/, "");
      setInputName(baseName);
      setInputCompany("");
      setInputDesc("");
      setPendingAsset(asset);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Error", getErrMsg(err));
    }
  };

  // ── STEP 2: submit modal → save on device ─────────────────
  const handleSubmitUpload = async () => {
    if (!inputName.trim()) {
      Alert.alert("Name required", "Please give your file a name.");
      return;
    }
    if (!inputCompany.trim()) {
      Alert.alert("Company required", "Please enter the company name.");
      return;
    }
    if (!pendingAsset) return;

    setModalVisible(false);
    setUploading(true);

    try {
      const id = genId();
      const localUri = await saveFileLocally(pendingAsset, id);

      const record = {
        id,
        localUri,
        username:    user,
        fileName:    pendingAsset.name,
        mimeType:    pendingAsset.mimeType || "application/octet-stream",
        name:        inputName.trim(),
        company:     inputCompany.trim(),
        description: inputDesc.trim(),
        createdAt:   new Date().toISOString(),
      };

      const all = await readIndex();
      all.push(record);
      await writeIndex(all);

      Alert.alert("Saved!", `"${inputName.trim()}" is saved on this device.`);
      fetchFiles();
    } catch (err) {
      console.error("Save error:", getErrMsg(err));
      Alert.alert("Save failed", getErrMsg(err));
    } finally {
      setUploading(false);
      setPendingAsset(null);
    }
  };

  const handleDeleteFile = (file) => {
    Alert.alert(
      "Delete file?",
      `Remove "${file.name}" from this device? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFileLocally(file.localUri);
              const all = await readIndex();
              await writeIndex(all.filter((f) => f.id !== file.id));
              fetchFiles();
            } catch (err) {
              Alert.alert("Delete failed", getErrMsg(err));
            }
          },
        },
      ]
    );
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setPendingAsset(null);
    setInputName("");
    setInputCompany("");
    setInputDesc("");
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Media 🎧</Text>
        <Text style={styles.headerSub}>
          audio and video files — stored only on this device, {user}.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brown} />
        }
      >
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handlePickFile}
          disabled={uploading}
          activeOpacity={0.82}
        >
          {uploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.uploadButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>＋ Add Audio or Video</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Your Files</Text>

        {loading ? (
          <ActivityIndicator size="large" color={C.brown} style={{ marginTop: 24 }} />
        ) : files.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>no files yet. add something!</Text>
          </View>
        ) : (
          files.map((file) => {
            if (isAudio(file.mimeType)) return <AudioRow key={file.id} file={file} onDelete={handleDeleteFile} />;
            if (isVideo(file.mimeType)) return <VideoRow key={file.id} file={file} onDelete={handleDeleteFile} />;
            return (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileIconBox}>
                  <Text style={styles.fileEmoji}>📁</Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name || file.fileName}</Text>
                  {!!file.company && <Text style={styles.fileCompany}>🏢 {file.company}</Text>}
                  {!!file.description && <Text style={styles.fileDesc}>{file.description}</Text>}
                  <Text style={styles.fileMeta}>{formatDate(file.createdAt)}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteFile(file)}>
                  <Text style={styles.deleteButtonText}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── MODAL ── */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancelModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Name your file</Text>

              {pendingAsset && (
                <View style={styles.filePreview}>
                  <Text style={styles.filePreviewEmoji}>
                    {isAudio(pendingAsset.mimeType) ? "🎵" : "🎬"}
                  </Text>
                  <Text style={styles.filePreviewName} numberOfLines={1}>
                    {pendingAsset.name}
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="give it a name"
                placeholderTextColor={C.brown}
                value={inputName}
                onChangeText={setInputName}
                autoFocus
              />

              <Text style={styles.inputLabel}>Company *</Text>
              <TextInput
                style={styles.input}
                placeholder="company name"
                placeholderTextColor={C.brown}
                value={inputCompany}
                onChangeText={setInputCompany}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="what's this about? (optional)"
                placeholderTextColor={C.brown}
                value={inputDesc}
                onChangeText={setInputDesc}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={handleCancelModal}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.uploadBtn]}
                  onPress={handleSubmitUpload}
                >
                  <Text style={[styles.modalBtnText, { fontWeight: "800" }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.dark,
    paddingVertical: 22, paddingHorizontal: 20,
    borderBottomWidth: 3, borderBottomColor: C.burgundy,
  },
  headerTitle: {
    fontSize: 26, fontWeight: "900", color: C.bg,
    letterSpacing: -0.5, marginBottom: 6,
  },
  headerSub: { fontSize: 12, color: C.brown, fontStyle: "italic" },

  scroll: { padding: 18, paddingBottom: 48 },

  uploadButton: {
    backgroundColor: C.burgundy, padding: 18,
    borderRadius: 14, alignItems: "center", marginBottom: 26,
    shadowColor: C.dark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  uploadButtonDisabled: { opacity: 0.6 },
  uploadButtonText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },
  uploadingRow: { flexDirection: "row", alignItems: "center" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: C.brown,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
  },

  emptyState: { alignItems: "center", marginTop: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: C.brown, fontSize: 14, fontStyle: "italic" },

  fileCard: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: C.pink,
    shadowColor: C.dark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  fileIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: "#f5ede6", alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  fileEmoji: { fontSize: 22 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: "700", color: C.dark, marginBottom: 2 },
  fileCompany: { fontSize: 12, color: C.burgundy, fontWeight: "600", marginBottom: 2 },
  fileDesc: { fontSize: 12, color: "#6b5047", lineHeight: 17, marginBottom: 3 },
  fileMeta: { fontSize: 11, color: C.brown, fontStyle: "italic" },

  playButton: {
    backgroundColor: C.pink, width: 40, height: 40,
    borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  playButtonText: { fontSize: 16, color: "#fff" },

  deleteButton: {
    backgroundColor: "#f0e0e0", width: 36, height: 36,
    borderRadius: 18, alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  deleteButtonText: { fontSize: 14 },

  videoPlayer: {
    width: "100%", height: 200, borderRadius: 10,
    backgroundColor: "#000", marginTop: 8,
  },
  collapseButton: { marginTop: 8, alignItems: "center" },
  collapseText: { color: C.brown, fontSize: 12, fontStyle: "italic" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(109,77,64,0.55)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalContent: {
    width: "100%", maxHeight: "90%", backgroundColor: C.bg,
    borderRadius: 20, padding: 22,
    shadowColor: C.dark, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
    borderTopWidth: 4, borderTopColor: C.pink,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: C.dark, marginBottom: 16 },

  filePreview: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 10, padding: 10,
    marginBottom: 18, borderWidth: 1, borderColor: "#f0e0d0",
  },
  filePreviewEmoji: { fontSize: 20, marginRight: 10 },
  filePreviewName: { flex: 1, fontSize: 12, color: C.brown, fontStyle: "italic" },

  inputLabel: {
    fontSize: 12, fontWeight: "700", color: C.dark,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6,
  },
  input: {
    borderWidth: 1.5, borderColor: C.brown, backgroundColor: "#fff",
    borderRadius: 10, padding: 13, marginBottom: 14,
    color: C.dark, fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: "top" },

  modalButtons: { flexDirection: "row", gap: 12, marginTop: 4 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: "center" },
  cancelBtn: { backgroundColor: C.dark },
  uploadBtn: { backgroundColor: C.pink },
  modalBtnText: { color: "#fff", fontSize: 15 },
});