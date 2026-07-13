/*
    report-form.jsx — fill in your details and submit the report.
*/

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

// ── always use the appwrite WEB sdk on web, native sdk on native ──
import { Client as WebClient, Databases as WebDatabases, ID as WebID } from "appwrite";
import { Client as NativeClient, Databases as NativeDatabases, ID as NativeID } from "react-native-appwrite";

const CFG = {
  endpoint:     "https://cloud.appwrite.io/v1",
  projectId:    "69af49d80022d666076a",
  dbId:         "69b0806500366fecf954",
  reportsColId: "reports",
};

let db, ID;
if (Platform.OS === "web") {
  const wc = new WebClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId);
  db = new WebDatabases(wc);
  ID = WebID;
} else {
  const nc = new NativeClient()
    .setEndpoint(CFG.endpoint)
    .setProject(CFG.projectId)
    .setPlatform("com.meetstartap.app");
  db = new NativeDatabases(nc);
  ID = NativeID;
}

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  border:   "#9a8070",
  white:    "#ffffff",
};

const RELATIONSHIPS = ["Supervisor", "Coworker", "Manager", "Client / Customer", "Other"];

export default function ReportFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // params come in as strings from expo-router
  const mode = params.mode || "named";
  const recordingIds = params.recordingIds || "";
  const isAnonymous = mode === "anonymous";

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [company, setCompany]       = useState("");
  const [position, setPosition]     = useState("");
  const [personPos, setPersonPos]   = useState("");
  const [relationship, setRelationship] = useState("");
  const [showRelDrop, setShowRelDrop]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  const [fontsLoaded] = useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });

  // reset submitted state every time this screen mounts
  useEffect(() => {
    setSubmitted(false);
  }, []);

  const handleSubmit = async () => {
    if (!company.trim()) {
      Alert.alert("Required", "Please enter the company / workplace name.");
      return;
    }
    if (!isAnonymous && !name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    const payload = {
      name:           isAnonymous ? "Anonymous" : name.trim(),
      email:          email.trim(),
      company:        company.trim(),
      position:       position.trim(),
      personPosition: personPos.trim(),
      relationship:   relationship || "Not specified",
      recordingIds:   recordingIds,
      anonymous:      isAnonymous,
    };

    console.log("Submitting report...");
    console.log("Platform:", Platform.OS);
    console.log("Collection:", CFG.reportsColId);
    console.log("Payload:", JSON.stringify(payload));

    try {
      setSubmitting(true);

      const docId = ID.unique();
      console.log("Doc ID:", docId);

      const result = await db.createDocument(
        CFG.dbId,
        CFG.reportsColId,
        docId,
        payload
      );

      console.log("Success! Doc created:", result.$id);
      setSubmitted(true);
      // auto-navigate home after 2.5 seconds
      setTimeout(() => router.replace("/(drawer)/home"), 2500);
    } catch (err) {
      // log every possible property of the error
      console.error("Submit FAILED");
      console.error("err.message:", err?.message);
      console.error("err.code:", err?.code);
      console.error("err.type:", err?.type);
      console.error("err.response:", JSON.stringify(err?.response));
      console.error("full err:", JSON.stringify(err));

      const msg = err?.message || err?.response?.message || JSON.stringify(err) || "Unknown error.";
      Alert.alert("Submission Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={[styles.root, styles.successRoot]}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.successBulb} resizeMode="contain" />
        <Text style={styles.successEmoji}>✓</Text>
        <Text style={styles.successTitle}>Report Submitted</Text>
        <Text style={styles.successSubtitle}>
          Thank you for speaking up.{"\n"}Your report has been received.
        </Text>
        <Text style={styles.successNote}>Taking you back to home…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>

      <View style={styles.topBulb}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>
          {isAnonymous ? "Report Anonymously" : "Report With Name"}
        </Text>

        <View style={{ height: 24 }} />

        {/* name — only if not anonymous */}
        {!isAnonymous && (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Your Name:"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        {/* email — only if not anonymous */}
        {!isAnonymous && (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Email Address:"
              placeholderTextColor={C.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        )}

        {/* company */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Company/Workplace Name:"
            placeholderTextColor={C.muted}
            value={company}
            onChangeText={setCompany}
          />
        </View>

        {/* your position */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Your position:"
            placeholderTextColor={C.muted}
            value={position}
            onChangeText={setPosition}
          />
        </View>

        {/* person's position */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Position of the person involved:"
            placeholderTextColor={C.muted}
            value={personPos}
            onChangeText={setPersonPos}
          />
        </View>

        {/* relationship dropdown */}
        <View style={styles.inputWrap}>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowRelDrop(!showRelDrop)}
            activeOpacity={0.8}
          >
            <Text style={[styles.input, { flex: 1, paddingVertical: 0 }]}>
              {relationship || "Relationship To You"}
            </Text>
            <Text style={styles.dropArrow}>∨</Text>
          </TouchableOpacity>
        </View>

        {showRelDrop && (
          <View style={styles.dropdown}>
            {RELATIONSHIPS.map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.dropItem}
                onPress={() => { setRelationship(r); setShowRelDrop(false); }}
              >
                <Text style={styles.dropItemText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* attached recordings */}
        {!!recordingIds && recordingIds.length > 0 && (
          <View style={styles.attachedNote}>
            <Text style={styles.attachedText}>
              📎 {recordingIds.split(",").filter(Boolean).length} recording(s) attached
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />

        {/* submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={styles.submitBtnText}>Continue</Text>
          )}
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
  scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 16 },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 34, color: C.burgundy, lineHeight: 42,
  },

  inputWrap: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 22,
  },
  input: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15, color: C.text,
    paddingVertical: 10, paddingHorizontal: 0,
  },

  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
  },
  dropArrow: { fontSize: 16, color: C.muted, marginLeft: 8 },

  dropdown: {
    backgroundColor: C.white, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 16, overflow: "hidden",
  },
  dropItem: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#f0e8df",
  },
  dropItemText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15, color: C.text, textAlign: "center",
  },

  attachedNote: {
    backgroundColor: "#fde8e8", borderRadius: 8, padding: 10, marginBottom: 8,
  },
  attachedText: {
    fontFamily: "Ledger_400Regular", fontSize: 13, color: C.burgundy,
  },

  submitBtn: {
    backgroundColor: C.burgundy, borderRadius: 40,
    paddingVertical: 20, alignItems: "center",
    shadowColor: C.burgundy, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22, color: C.white, letterSpacing: 1,
  },

  backLink: { alignItems: "center", marginTop: 18 },
  backLinkText: {
    fontFamily: "Ledger_400Regular", fontSize: 15, color: C.muted,
  },

  // success screen
  successRoot: { alignItems: "center", justifyContent: "center", gap: 16 },
  successBulb: { width: 60, height: 60, opacity: 0.5, marginBottom: 8 },
  successEmoji: { fontSize: 64, color: C.burgundy },
  successTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 32, color: C.burgundy, textAlign: "center",
  },
  successSubtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16, color: C.text, textAlign: "center", lineHeight: 26,
  },
  successNote: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13, color: C.muted, fontStyle: "italic", marginTop: 8,
  },
});