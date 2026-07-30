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
import { Ionicons } from "@expo/vector-icons";
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
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
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
  border:   "#d9bfc2",
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
  const { width, height } = useWindowDimensions();

  // clamp scaling width to a phone-like max so proportions stay consistent
  // on wide viewports (pc / tablet / web) instead of ballooning with them
  const layoutWidth = Math.min(width, 480);
  const wp = (p) => (layoutWidth * p) / 100;
  const hp = (p) => (height * p) / 100;

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
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── BACK ── */}
      <TouchableOpacity
        style={{ position: "absolute", top: hp(2), left: wp(5), zIndex: 10, flexDirection: "row", alignItems: "center" }}
        onPress={() => router.replace("/(drawer)/role-pick")}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={wp(5)} color={C.burgundy} />
        <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: C.burgundy, marginLeft: wp(1) }}>
          Back
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            paddingHorizontal: wp(9),
            paddingTop: hp(7),
            paddingBottom: hp(4),
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── LOGO ── */}
          <View style={{ alignItems: "center", marginBottom: hp(2) }}>
            <Image
              source={require("../../assets/bulblogo.png")}
              style={{ width: wp(13), height: wp(13) }}
              resizeMode="contain"
            />
          </View>

          {/* ── TITLE ── */}
          <Text
            style={{
              fontFamily: "OtomanopeeOne_400Regular",
              fontSize: wp(9),
              color: C.burgundy,
              textAlign: "center",
              marginBottom: hp(1.2),
            }}
          >
            Company Log In
          </Text>

          <Text
            style={{
              fontFamily: "Ledger_400Regular",
              fontSize: wp(3.4),
              color: C.muted,
              textAlign: "center",
              lineHeight: wp(4.6),
              marginBottom: hp(4),
              paddingHorizontal: wp(2),
            }}
          >
            Use the username, password, and company code AmanOr gave you.
          </Text>

          {/* ── USERNAME ── */}
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginBottom: hp(1) }}>
            Username
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: wp(3.5),
              paddingHorizontal: wp(4),
              marginBottom: hp(2.5),
            }}
          >
            <TextInput
              style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: C.text, paddingVertical: hp(1.6) }}
              placeholder="Username"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(t) => { setUsername(t); clearError(); }}
            />
          </View>

          {/* ── PASSWORD ── */}
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginBottom: hp(1) }}>
            Password
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: wp(3.5),
              paddingHorizontal: wp(4),
              marginBottom: hp(2.5),
            }}
          >
            <TextInput
              style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: C.text, paddingVertical: hp(1.6) }}
              placeholder="Password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
            />
          </View>

          {/* ── COMPANY CODE ── */}
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginBottom: hp(1) }}>
            Company Code
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: wp(3.5),
              paddingHorizontal: wp(4),
            }}
          >
            <TextInput
              style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: C.text, paddingVertical: hp(1.6) }}
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
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(1.8) }}>
              <Ionicons name="alert-circle-outline" size={wp(4)} color={C.burgundy} />
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.4), color: C.burgundy, marginLeft: wp(1.5), flex: 1 }}>
                {errorMsg}
              </Text>
            </View>
          )}

          {/* ── SUBMIT BUTTON ── */}
          <TouchableOpacity
            style={{
              backgroundColor: C.burgundy,
              borderRadius: wp(10),
              paddingVertical: hp(2.2),
              alignItems: "center",
              marginTop: hp(4),
              opacity: loading ? 0.7 : 1,
              shadowColor: C.burgundy,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(5), color: C.white, letterSpacing: 1 }}>
                Log In
              </Text>
            )}
          </TouchableOpacity>

          {/* ── NO ACCOUNT HINT ── */}
          <Text
            style={{
              fontFamily: "Ledger_400Regular",
              fontSize: wp(3.2),
              color: C.muted,
              textAlign: "center",
              lineHeight: wp(4.4),
              marginTop: hp(2.5),
              paddingHorizontal: wp(2),
            }}
          >
            Don't have credentials yet? Contact AmanOr to set up your company account.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}