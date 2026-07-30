/*
    auth.jsx — log in / sign up. styled to match AmanOr design.
    fonts: Otomanopee One (title) + Ledger (body)
    run first: npx expo install @expo-google-fonts/otomanopee-one @expo-google-fonts/ledger expo-font
*/

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Client, Databases, Query, ID } from "react-native-appwrite";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { Ionicons } from "@expo/vector-icons";

const APPWRITE_CONFIG = {
  endpoint:   "https://cloud.appwrite.io/v1",
  projectId:  "69af49d80022d666076a",
  dbId:       "69b0806500366fecf954",
  usersColId: "users",
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

const findUserByUsername = async (username) => {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.dbId,
    APPWRITE_CONFIG.usersColId,
    [Query.search("username", username)]
  );
  return res.documents.find(
    (doc) => doc.username.toLowerCase() === username.toLowerCase()
  ) || null;
};

export default function AuthScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // clamp scaling width to a phone-like max so proportions stay consistent
  // on wide viewports (pc / tablet / web) instead of ballooning with them
  const layoutWidth = Math.min(width, 480);
  const wp = (p) => (layoutWidth * p) / 100;
  const hp = (p) => (height * p) / 100;

  const [mode, setMode]         = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isLogin = mode === "login";
  const clearError = () => setErrorMsg("");

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async () => {
    clearError();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter your username and password.");
      return;
    }
    try {
      setLoading(true);
      const user = await findUserByUsername(username.trim());
      if (!user) { setErrorMsg("No account found. Try signing up!"); return; }
      if (user.password !== password) { setErrorMsg("Wrong password. Try again."); return; }
      setUsername(""); setPassword("");
      router.replace({ pathname: "/home", params: { username: user.username } });
    } catch (err) {
      console.error("Login error:", JSON.stringify(err));
      if (err.code === 401) setErrorMsg("Permission denied. Check Appwrite permissions.");
      else if (err.code === 400) setErrorMsg("Index missing. Add Fulltext index on 'username'.");
      else setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN UP ────────────────────────────────────────────────
  const handleSignup = async () => {
    clearError();
    if (!username.trim() || !password.trim()) { setErrorMsg("Please fill in all fields."); return; }
    if (username.trim().length < 2) { setErrorMsg("Username must be at least 2 characters."); return; }
    if (password.length < 4) { setErrorMsg("Password must be at least 4 characters."); return; }
    try {
      setLoading(true);
      const existing = await findUserByUsername(username.trim());
      if (existing) { setErrorMsg("That username is taken. Pick another."); return; }
      const newUser = await databases.createDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.usersColId,
        ID.unique(),
        { username: username.trim(), password }
      );
      const created = username.trim();
      setUsername(""); setPassword("");
      Alert.alert("Welcome!", "Account created.", [
        { text: "Let's go", onPress: () => router.replace({ pathname: "/home", params: { username: created } }) },
      ]);
    } catch (err) {
      console.error("Signup error:", JSON.stringify(err));
      if (err.code === 401) setErrorMsg("Permission denied. Check Appwrite permissions.");
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
              source={require("../assets/bulblogo.png")}
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
              marginBottom: hp(4),
            }}
          >
            {isLogin ? "Log In Now" : "Sign Up Now"}
          </Text>

          {/* ── USERNAME ── */}
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginBottom: hp(1) }}>
            Username (Anonymous Or Nickname)
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
              placeholder="e.g. brave_owl92"
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
            }}
          >
            <TextInput
              style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: C.text, paddingVertical: hp(1.6) }}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
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
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(5), color: C.white, letterSpacing: 1 }}>
                {isLogin ? "Log In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {/* ── DOT DIVIDER ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(3.5), marginBottom: hp(2.5) }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border, opacity: 0.7 }} />
            <Ionicons name="ellipse" size={wp(1.6)} color={C.burgundy} style={{ marginHorizontal: wp(2) }} />
            <View style={{ flex: 1, height: 1, backgroundColor: C.border, opacity: 0.7 }} />
          </View>

          {/* ── SWITCH MODE LINK ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.text }}>
              {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            </Text>
            <TouchableOpacity
              onPress={() => { setMode(isLogin ? "signup" : "login"); clearError(); }}
            >
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.burgundy, fontWeight: "700" }}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}