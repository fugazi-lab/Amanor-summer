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
import { useState } from "react";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const EXAMPLES = [
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
  const [example, setExample] = useState(0);

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

        <Text style={styles.title}>What Is Workplace{"\n"}Sexual Harassment?</Text>
        <View style={styles.divider} />

        <View style={styles.definitionCard}>
          <Text style={styles.definitionTitle}>What Is Sexual Harassment?</Text>
        </View>

        <Text style={styles.examplesTitle}>Examples Of Sexual Harassment:</Text>

        <View style={styles.carousel}>
          <TouchableOpacity style={styles.sideCard} onPress={() => setExample((example - 1 + EXAMPLES.length) % EXAMPLES.length)}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>{EXAMPLES[example]}</Text>
          </View>
          <TouchableOpacity style={styles.sideCard} onPress={() => setExample((example + 1) % EXAMPLES.length)}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(drawer)/legal-intro")}>
        <Text style={styles.backBtnText}>{"< Back"}</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 32,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: C.muted,
    marginBottom: 34,
  },
  definitionCard: {
    minHeight: 140,
    backgroundColor: "#D98FA3",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  definitionTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 8,
  },
  definition: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 22,
  },
  examplesTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.muted,
    textAlign: "center",
    marginTop: 38,
    marginBottom: 22,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  sideCard: {
    width: 48,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#C49378",
    alignItems: "center",
    justifyContent: "center",
  },
  exampleCard: {
    flex: 1,
    minHeight: 190,
    backgroundColor: "#D98FA3",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  exampleText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.burgundy,
    lineHeight: 28,
    textAlign: "center",
  },
  arrow: {
    fontSize: 34,
    color: C.white,
    lineHeight: 38,
  },

  backBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 28,
    marginBottom: 16,
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
