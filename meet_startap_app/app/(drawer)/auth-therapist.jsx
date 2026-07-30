/*
    auth-therapist.jsx — therapist log in / sign up.
    styled to match AmanOr design (same as auth.jsx).
    sign up has extra fields: phone number + certification ID image (image picked but not saved yet).
    therapists stored in separate "therapists" Appwrite collection.
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ionicons } from "@expo/vector-icons";
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
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
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
  border:   "#d9bfc2",
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
  const { width, height } = useWindowDimensions();

  // clamp scaling width to a phone-like max so proportions stay consistent
  // on wide viewports (pc / tablet / web) instead of ballooning with them
  const layoutWidth = Math.min(width, 480);
  const wp = (p) => (layoutWidth * p) / 100;
  const hp = (p) => (height * p) / 100;

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
      router.replace({
        pathname: "/(drawer)/therapist-home",
        params: { username: therapist.username },
      });
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
        {
          text: "Let's go",
          onPress: () =>
            router.replace({
              pathname: "/(drawer)/therapist-home",
              params: { username: created },
            }),
        },
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
              fontSize: wp(7.5),
              color: C.burgundy,
              textAlign: "center",
              marginBottom: hp(4),
            }}
          >
            {isLogin ? "Therapist Log In" : "Therapist Sign Up"}
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

          {/* ── SIGN UP ONLY FIELDS ── */}
          {!isLogin && (
            <>
              {/* phone number */}
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginTop: hp(2.5), marginBottom: hp(1) }}>
                Phone Number
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
                  placeholder="Phone Number"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(t) => { setPhone(t); clearError(); }}
                />
              </View>

              {/* certification ID image */}
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, marginTop: hp(2.5), marginBottom: hp(1.2) }}>
                Certification ID
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1.5,
                  borderColor: C.border,
                  borderStyle: "dashed",
                  borderRadius: wp(3.5),
                  overflow: "hidden",
                }}
                onPress={handlePickCert}
                activeOpacity={0.85}
              >
                {certImage ? (
                  <Image
                    source={{ uri: certImage }}
                    style={{ width: "100%", height: hp(19) }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ height: hp(15.5), alignItems: "center", justifyContent: "center", gap: hp(1.2) }}>
                    <Ionicons name="document-text-outline" size={wp(8)} color={C.muted} />
                    <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted, textAlign: "center", paddingHorizontal: wp(6) }}>
                      Tap to attach certification image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {certImage && (
                <TouchableOpacity
                  onPress={() => setCertImage(null)}
                  style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-end", marginTop: hp(1) }}
                >
                  <Ionicons name="close-circle-outline" size={wp(4)} color={C.burgundy} />
                  <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.burgundy, marginLeft: wp(1) }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

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

          {/* ── SWITCH MODE ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.text }}>
              {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            </Text>
            <TouchableOpacity onPress={() => { setMode(isLogin ? "signup" : "login"); clearError(); }}>
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