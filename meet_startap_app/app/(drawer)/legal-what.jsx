/*
    legal-what.jsx — Workplace Sexual Harassment Definition.
    fonts: Otomanopee One + Ledger
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
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const BULLETS = [
  "making sexual comments or jokes about a woman's body or appearance",
  "sending sexual messages or pictures",
  "touching someone without permission",
  "repeatedly asking for dates or sexual favors after the person said no",
  "threatening someone's job or promotion unless they agree to sexual behavior",
  "creating a sexual or uncomfortable environment at work",
  "even one serious incident can be considered sexual harassment.",
];

export default function LegalWhatScreen() {
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── TITLE ── */}
        <Text style={styles.title}>Workplace Sexual Harassment Definition</Text>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        {/* ── DEFINITION ── */}
        <Text style={styles.definition}>
          Sexual harassment is any unwanted behavior of a sexual nature that makes a person feel uncomfortable, unsafe, or humiliated it includes:
        </Text>

        {/* ── BULLET POINTS ── */}
        <View style={styles.bulletList}>
          {BULLETS.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 36 }} />

        {/* ── BACK BUTTON ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>{"< Back"}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topBulb: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "flex-start",
  },
  bulb: { width: 36, height: 36, opacity: 0.6 },

  scroll: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 34,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 20,
  },

  definition: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
  },

  bulletList: { gap: 14 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    lineHeight: 22,
    marginTop: 1,
  },
  bulletText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    lineHeight: 22,
    flex: 1,
  },

  backBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  backBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.white,
    letterSpacing: 0.5,
  },
});