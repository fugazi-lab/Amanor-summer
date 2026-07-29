/*
    auth-company.jsx — company sign in.
    styled to match AmanOr design (same as auth.jsx / auth-therapist.jsx).
    LOG IN ONLY — no sign up. Company accounts are provisioned by AmanOr:
    the employer is handed a username, password, and company code up front.
    All three must match a record in the "companies" Appwrite collection.
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Client, Databases, Query } from "react-native-appwrite";

const APPWRITE_CONFIG = {
  endpoint:      "https://cloud.appwrite.io/v1",
  projectId:     "69af49d80022d666076a",
  dbId:          "69b0806500366fecf954",
  companiesColId: "companies",   // ← create this collection in Appwrite
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setPlatform("com.meetstartap.app");

const databases = new Databases(client);

const C = {
  bg:       "#f5f0e0",
  burgundy: "#7a2035",
  text:     "#3a2020",
  muted:    "#9a8070",
  border:   "#9a8070",
  white:    "#ffffff",
};

const findCompanyByUsername = async (username) => {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.dbId,
    APPWRITE_CONFIG.companiesColId,
    [Query.search("username", username)]
  );
  return res.documents.find(
    (doc) => doc.username.toLowerCase() === username.toLowerCase()
  ) || null;
};

export default function CompanyAuthScreen() {
  const router = useRouter();

  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");

  const clearError = () => setErrorMsg("");

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async () => {
    clearError();
    if (!username.trim() || !password.trim() || !companyCode.trim()) {
      setErrorMsg("Please enter your username, password, and company code.");
      return;
    }
    try {
      setLoading(true);
      const company = await findCompanyByUsername(username.trim());
      if (!company) { setErrorMsg("No company account found. Check your username."); return; }
      if (company.password !== password) { setErrorMsg("Wrong password. Try again."); return; }
      if (company.companyCode.trim().toLowerCase() !== companyCode.trim().toLowerCase()) {
        setErrorMsg("Wrong company code. Try again.");
        return;
      }
      const loggedInUsername = username.trim();
      setUsername(""); setPassword(""); setCompanyCode("");
      router.replace({
        pathname: "/(drawer)/company-home",
        params: { username: loggedInUsername },
      });
    } catch (err) {
      console.error("Company login error:", JSON.stringify(err));
      if (err.code === 401) setErrorMsg("Permission denied. Check Appwrite permissions.");
      else if (err.code === 400) setErrorMsg("Index missing. Add Fulltext index on 'username'.");
      else setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── TITLE ── */}
          <Text style={styles.title}>Company{"\n"}Log In</Text>

          <Text style={styles.subtitle}>
            Use the username, password, and company code AmanOr gave you.
          </Text>

          <View style={{ height: 40 }} />

          {/* ── USERNAME ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(t) => { setUsername(t); clearError(); }}
            />
          </View>

          <View style={{ height: 28 }} />

          {/* ── PASSWORD ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
            />
          </View>

          <View style={{ height: 28 }} />

          {/* ── COMPANY CODE ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Company Code"
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              value={companyCode}
              onChangeText={(t) => { setCompanyCode(t); clearError(); }}
            />
          </View>

          {/* ── ERROR ── */}
          {errorMsg !== "" && (
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          )}

          <View style={{ height: 40 }} />

          {/* ── SUBMIT BUTTON ── */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          {/* ── NO ACCOUNT HINT ── */}
          <Text style={styles.noAccountText}>
            Don't have credentials yet? Contact AmanOr to set up your company account.
          </Text>

          <View style={{ flex: 1, minHeight: 60 }} />

          {/* ── LOGO ── */}
          <View style={styles.bottomLogoWrap}>
            <Image
              source={require("../../assets/bulblogo.png")}
              style={styles.bottomLogo}
              resizeMode="contain"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/(drawer)/role-pick")}>
        <Text style={styles.backLinkText}>{"< Back"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: "9%",
    paddingTop: "14%",
    paddingBottom: 32,
  },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 48,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 58,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 19,
  },

  inputWrap: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  input: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
    color: C.text,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },

  errorText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.burgundy,
    marginTop: 14,
  },

  button: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.white,
    letterSpacing: 1,
  },

  noAccountText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12.5,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
  },

  backLink: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 36,
    marginBottom: 16,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  backLinkText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.white,
    letterSpacing: 0.5,
  },

  bottomLogoWrap: {
    position: "absolute",
    right: "5%",
    bottom: "4%",
    width: "12%",
    aspectRatio: 1,
  },

  bottomLogo: {
    width: "100%",
    height: "100%",
    opacity: 0.35,
  },
});