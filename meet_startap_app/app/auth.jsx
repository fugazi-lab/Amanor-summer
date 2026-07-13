/*
    auth.jsx — log in / sign up. styled to match AmanOr design.
    fonts: Otomanopee One (title) + Ledger (body)
    run first: npx expo install @expo-google-fonts/otomanopee-one @expo-google-fonts/ledger expo-font
*/

import {
  StyleSheet,
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
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Client, Databases, Query, ID } from "react-native-appwrite";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

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
  pink:     "#d4a0a8",
  border:   "#9a8070",
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
          <Text style={styles.title}>
            {isLogin ? "Log In\nNow" : "Sign Up\nNow"}
          </Text>

          {/* ── SPACER ── */}
          <View style={{ height: 48 }} />

          {/* ── USERNAME ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Username (Anonymous or nickname)"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(t) => { setUsername(t); clearError(); }}
            />
          </View>

          {/* hint only on signup */}
          {!isLogin && (
            <Text style={styles.hint}>
              * Use an anonymous nickname. Do not use your real name.
            </Text>
          )}

          <View style={{ height: 32 }} />

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

          {/* ── ERROR ── */}
          {errorMsg !== "" && (
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          )}

          <View style={{ height: 40 }} />

          {/* ── SUBMIT BUTTON ── */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Log In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          {/* ── SWITCH MODE LINK ── */}
          <View style={styles.switchRow}>
            <Text style={styles.switchBase}>
              {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            </Text>
            <TouchableOpacity
              onPress={() => { setMode(isLogin ? "signup" : "login"); clearError(); }}
            >
              <Text style={styles.switchLink}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── SPACER pushes logo to bottom ── */}
          <View style={{ flex: 1, minHeight: 60 }} />

          {/* ── LOGO ── */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/bulblogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 36,
    paddingTop: 60,
    paddingBottom: 32,
  },

  // big two-line title
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 48,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 56,
    letterSpacing: 0.5,
  },

  // underline-only inputs
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

  hint: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
  },

  errorText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.burgundy,
    marginTop: 14,
  },

  // pill button
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

  // switch mode row
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  switchBase: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
  },
  switchLink: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.burgundy,
  },

  // logo bottom centre
  logoWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  logo: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
});