/*
    auth-therapist.jsx — therapist log in / sign up.
    styled to match AmanOr design (same as auth.jsx).
    sign up has extra fields: phone number + certification ID image (image picked but not saved yet).
    therapists stored in separate "therapists" Appwrite collection.
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { Client, Databases, ID, Query } from "react-native-appwrite";

const APPWRITE_CONFIG = {
  endpoint:        "https://cloud.appwrite.io/v1",
  projectId:       "69af49d80022d666076a",
  dbId:            "69b0806500366fecf954",
  therapistsColId: "therapists",   // ← create this collection in Appwrite
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

const findTherapistByUsername = async (username) => {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.dbId,
    APPWRITE_CONFIG.therapistsColId,
    [Query.search("username", username)]
  );
  return res.documents.find(
    (doc) => doc.username.toLowerCase() === username.toLowerCase()
  ) || null;
};

export default function TherapistAuthScreen() {
  const router = useRouter();

  const [mode, setMode]           = useState("login");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [phone, setPhone]         = useState("");
  const [certImage, setCertImage] = useState(null); // local uri only, not uploaded
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");

  const isLogin = mode === "login";
  const clearError = () => setErrorMsg("");

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  // ── PICK CERT IMAGE (not saved yet) ───────────────────────
  const handlePickCert = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setCertImage(result.assets[0].uri);
    }
  };

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async () => {
    clearError();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter your username and password.");
      return;
    }
    try {
      setLoading(true);
      const therapist = await findTherapistByUsername(username.trim());
      if (!therapist) { setErrorMsg("No therapist account found. Try signing up!"); return; }
      if (therapist.password !== password) { setErrorMsg("Wrong password. Try again."); return; }
      setUsername(""); setPassword("");
      // navigate to therapist home — create this route when ready
      router.replace({ pathname: "/therapist-home", params: { username: therapist.username } });
    } catch (err) {
      console.error("Therapist login error:", JSON.stringify(err));
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
    if (!username.trim() || !password.trim()) { setErrorMsg("Please fill in all required fields."); return; }
    if (username.trim().length < 2)           { setErrorMsg("Username must be at least 2 characters."); return; }
    if (password.length < 4)                  { setErrorMsg("Password must be at least 4 characters."); return; }
    if (!phone.trim())                        { setErrorMsg("Please enter your phone number."); return; }
    if (!certImage)                           { setErrorMsg("Please attach your certification ID image."); return; }

    try {
      setLoading(true);
      const existing = await findTherapistByUsername(username.trim());
      if (existing) { setErrorMsg("That username is taken. Pick another."); return; }

      await databases.createDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.therapistsColId,
        ID.unique(),
        {
          username: username.trim(),
          password,
          phone:    phone.trim(),
          // certImageId left empty for now — will be handled later
        }
      );

      const created = username.trim();
      setUsername(""); setPassword(""); setPhone(""); setCertImage(null);
      Alert.alert("Welcome!", "Therapist account created.", [
        { text: "Let's go", onPress: () => router.replace({ pathname: "/therapist-home", params: { username: created } }) },
      ]);
    } catch (err) {
      console.error("Therapist signup error:", JSON.stringify(err));
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
            {isLogin ? "Therapist\nLog In" : "Therapist\nSign Up"}
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

          {/* ── SIGN UP ONLY FIELDS ── */}
          {!isLogin && (
            <>
              <View style={{ height: 28 }} />

              {/* phone number */}
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(t) => { setPhone(t); clearError(); }}
                />
              </View>

              <View style={{ height: 28 }} />

              {/* certification ID image */}
              <Text style={styles.certLabel}>Certification ID</Text>
              <TouchableOpacity
                style={styles.certPickerBtn}
                onPress={handlePickCert}
                activeOpacity={0.85}
              >
                {certImage ? (
                  <Image
                    source={{ uri: certImage }}
                    style={styles.certPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.certPlaceholder}>
                    <Text style={styles.certPlaceholderIcon}>📄</Text>
                    <Text style={styles.certPlaceholderText}>Tap to attach certification image</Text>
                  </View>
                )}
              </TouchableOpacity>
              {certImage && (
                <TouchableOpacity onPress={() => setCertImage(null)} style={styles.certRemove}>
                  <Text style={styles.certRemoveText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </>
          )}

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

          {/* ── SWITCH MODE ── */}
          <View style={styles.switchRow}>
            <Text style={styles.switchBase}>
              {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            </Text>
            <TouchableOpacity onPress={() => { setMode(isLogin ? "signup" : "login"); clearError(); }}>
              <Text style={styles.switchLink}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── BACK ── */}
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>{"< Back"}</Text>
          </TouchableOpacity>

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

  // cert image
  certLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    marginBottom: 10,
  },
  certPickerBtn: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: "dashed",
    borderRadius: 12,
    overflow: "hidden",
  },
  certPreview: {
    width: "100%",
    height: 160,
  },
  certPlaceholder: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  certPlaceholderIcon: {
    fontSize: 32,
  },
  certPlaceholderText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },
  certRemove: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  certRemoveText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.burgundy,
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

  backLink: {
    alignItems: "center",
    marginTop: 16,
  },
  backLinkText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.muted,
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