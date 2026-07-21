/*
    emotional-help.jsx — emotional support landing page.
    sits between home.jsx and the support/discussion screens.
    "Join The Survivors Support Network" → index.jsx (discussion board)
    "A Meeting With A Therapy" → coming soon (future page)
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const C = {
  bg:       "#f5f0e0",
  burgundy: "#7a2035",
  text:     "#3a2020",
  muted:    "#9a8070",
  white:    "#ffffff",
};

export default function EmotionalHelpScreen() {
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
      <View style={styles.container}>

        {/* ── BULB TOP LEFT ── */}
        <View style={styles.topBulb}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={styles.bulb}
            resizeMode="contain"
          />
        </View>

        {/* ── TITLE + RULE ── */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Emotional Help</Text>
          <View style={styles.rule} />
        </View>

        {/* ── BUTTONS ── */}
        <View style={styles.buttonsSection}>

          {/* Join The Survivors Support Network */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => router.push("/(drawer)/")}
            activeOpacity={0.85}
          >
            <Text style={styles.optionText}>Join the Survivors{"\n"}Support Network</Text>
          </TouchableOpacity>

          {/* A Meeting With A Therapy */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => router.push("/(drawer)/schedule-meeting")}
            activeOpacity={0.85}
          >
            <Text style={styles.optionText}>Book a meeting{"\n"}with a therapist</Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    paddingHorizontal: "7%",
  },

  // ── bulb ──
  topBulb: {
    position: "absolute",
    top: 18,
    left: 18,
    zIndex: 10,
  },

  bulb: {
    width: 28,
    height: 28,
    opacity: 0.35,
  },

  // ── title ──
  titleSection: {
  paddingTop: 60,
  marginBottom: "4%",
  },
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 36,
    color: C.burgundy,
    marginBottom: "5%",
  },
  rule: {
    height: 1.5,
    backgroundColor: C.burgundy,
    width: "100%",
    opacity: 0.4,
  },

  // ── buttons ──
  buttonsSection: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: "8%",
    gap: "5%",
  },
  optionBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 18,
    paddingVertical: "7%",
    paddingHorizontal: "6%",
    alignItems: "center",
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  optionText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.white,
    opacity: 0.85,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.3,
  },
});