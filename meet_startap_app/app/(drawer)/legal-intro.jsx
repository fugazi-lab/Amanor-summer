/*
    legal-intro.jsx — your legal rights landing page.
    two options: what is harassment, and your rights & options.
    fonts: Otomanopee One + Ledger
*/

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const C = {
  bg:          "#F5F0E4",
  burgundy:    "#7a2035",
  text:        "#2C1810",
  muted:       "#6B5B4E",
  btnPink:     "#C4909A",   // rosy pink — first button
  btnBrown:    "#6B4F3A",   // warm dark brown — second button
  white:       "#ffffff",
};

export default function LegalIntroScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>

      {/* ── BULB TOP LEFT ── */}
      <View style={styles.topBulb}>
        <Image
          source={require("../../assets/bulblogo.png")}
          style={styles.bulb}
          resizeMode="contain"
        />
      </View>

      <View style={styles.body}>

        {/* ── TITLE ── */}
        <Text style={styles.title}>Your Legal Rights</Text>

        {/* ── SUBTITLE ── */}
        <Text style={styles.subtitle}>
          Learn Your Rights Against{"\n"}Workplace Sexual Harassment
        </Text>

        <View style={{ height: 40 }} />

        {/* ── BUTTON 1: What Is Workplace Sexual Harassment ── */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.btnPink }]}
          onPress={() => router.push("/(drawer)/legal-what")}
          activeOpacity={0.85}
        >
          <View style={styles.btnIconCircle}>
            <Text style={styles.btnIconText}>ℹ</Text>
          </View>
          <Text style={styles.btnText}>
            What Is Workplace Sexual{"\n"}Harassment?
          </Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />

        {/* ── BUTTON 2: Your Rights & Legal Options ── */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.btnBrown }]}
          onPress={() => router.push("/(drawer)/legal")}
          activeOpacity={0.85}
        >
          <View style={[styles.btnIconCircle, { borderColor: "rgba(255,255,255,0.5)" }]}>
            <Text style={styles.btnIconText}>⚖️</Text>
          </View>
          <Text style={styles.btnText}>
            Your Rights & Legal{"\n"}Options
          </Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />

        {/* ── BUTTON 3: Get Professional Legal Guidance ── */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.btnPink }]}
          onPress={() => router.push("/(drawer)/legal-lawyer")}
          activeOpacity={0.85}
        >
          <View style={styles.btnIconCircle}>
            <Text style={styles.btnIconText}>👩‍⚖️</Text>
          </View>
          <Text style={styles.btnText}>
            Get Professional Legal{"\n"}Guidance
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  topBulb: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "flex-start",
  },
  bulb: {
    width: 36,
    height: 36,
    opacity: 0.6,
  },

  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 38,
    color: C.burgundy,
    lineHeight: 46,
    marginBottom: 20,
  },

  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
    color: C.muted,
    lineHeight: 24,
    textAlign: "center",
  },

  // option buttons
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  btnIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  btnIconText: {
    fontSize: 18,
    color: C.white,
  },
  btnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.white,
    lineHeight: 23,
    flex: 1,
  },
});