/*
    report-pick.jsx — choose which recordings to attach to your report.
    then moves to the report form.
*/

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

// ── SDK ──────────────────────────────────────────────────────
import { Client as NativeClient, Databases as NativeDatabases, Query as NativeQuery } from "react-native-appwrite";
import { Client as WebClient, Databases as WebDatabases, Query as WebQuery } from "appwrite";

const CFG = {
  endpoint:   "https://cloud.appwrite.io/v1",
  projectId:  "69af49d80022d666076a",
  dbId:       "69b0806500366fecf954",
  filesColId: "files",
};

let db, Query;
if (Platform.OS === "web") {
  const wc = new WebClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId);
  db = new WebDatabases(wc); Query = WebQuery;
} else {
  const nc = new NativeClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId).setPlatform("com.meetstartap.app");
  db = new NativeDatabases(nc); Query = NativeQuery;
}

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  brown:    "#6B4F3A",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
  selected: "#f0e0e4",
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function ReportPickScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();

  const [files, setFiles]       = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(true);

  const [fontsLoaded] = useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await db.listDocuments(CFG.dbId, CFG.filesColId, [Query.limit(100)]);
        setFiles(res.documents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: "/(drawer)/report-form",
      params: {
        mode,
        recordingIds: Array.from(selected).join(","),
      },
    });
  };

  if (!fontsLoaded) return <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={C.burgundy} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.root}>

      <View style={styles.topBulb}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Choose Recordings</Text>
        <Text style={styles.subtitle}>Select recordings to attach to your report.{"\n"}You can skip this step.</Text>

        <View style={styles.divider} />

        {loading ? (
          <ActivityIndicator color={C.burgundy} style={{ marginTop: 32 }} />
        ) : files.length === 0 ? (
          <Text style={styles.emptyText}>No recordings found. You can continue without attaching any.</Text>
        ) : (
          files.map((file) => {
            const isSelected = selected.has(file.$id);
            return (
              <TouchableOpacity
                key={file.$id}
                style={[styles.fileCard, isSelected && styles.fileCardSelected]}
                onPress={() => toggle(file.$id)}
                activeOpacity={0.82}
              >
                <Text style={styles.fileEmoji}>
                  {file.mimeType?.startsWith("audio/") ? "🎵" : "🎬"}
                </Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name || file.fileName}</Text>
                  {!!file.company && <Text style={styles.fileCompany}>{file.company}</Text>}
                  <Text style={styles.fileMeta}>{formatDate(file.$createdAt)}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 32 }} />

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>
            {selected.size > 0 ? `Continue with ${selected.size} recording${selected.size > 1 ? "s" : ""}` : "Continue Without Recordings"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>{"< Back"}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBulb: { paddingHorizontal: 24, paddingTop: 16, alignItems: "flex-start" },
  bulb: { width: 36, height: 36, opacity: 0.6 },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },

  title: { fontFamily: "OtomanopeeOne_400Regular", fontSize: 32, color: C.burgundy, marginBottom: 10 },
  subtitle: { fontFamily: "Ledger_400Regular", fontSize: 14, color: C.muted, lineHeight: 22, marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.divider, marginBottom: 20 },

  emptyText: { fontFamily: "Ledger_400Regular", fontSize: 14, color: C.muted, textAlign: "center", marginTop: 24, lineHeight: 22 },

  fileCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: "transparent",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  fileCardSelected: { borderColor: C.burgundy, backgroundColor: C.selected },
  fileEmoji: { fontSize: 22, marginRight: 12 },
  fileInfo: { flex: 1 },
  fileName: { fontFamily: "Ledger_400Regular", fontSize: 14, color: C.text, fontWeight: "700", marginBottom: 2 },
  fileCompany: { fontFamily: "Ledger_400Regular", fontSize: 12, color: C.burgundy, marginBottom: 1 },
  fileMeta: { fontFamily: "Ledger_400Regular", fontSize: 11, color: C.muted, fontStyle: "italic" },

  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: C.divider,
    alignItems: "center", justifyContent: "center", marginLeft: 10,
  },
  checkboxSelected: { backgroundColor: C.burgundy, borderColor: C.burgundy },
  checkmark: { color: C.white, fontSize: 14, fontWeight: "700" },

  continueBtn: {
    backgroundColor: C.burgundy, borderRadius: 40,
    paddingVertical: 18, alignItems: "center",
    shadowColor: C.burgundy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  continueBtnText: { fontFamily: "Ledger_400Regular", fontSize: 17, color: C.white, letterSpacing: 0.3 },

  backLink: { alignItems: "center", marginTop: 18 },
  backLinkText: { fontFamily: "Ledger_400Regular", fontSize: 15, color: C.muted },
});