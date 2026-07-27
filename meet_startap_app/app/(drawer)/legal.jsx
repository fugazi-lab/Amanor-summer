/*
    legal.jsx — your rights. styled to match AmanOr design.
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
import { useRef, useState } from "react";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const BULLETS = [
  "Submit a workplace complaint, orally or in writing. Another person may also submit it on your behalf.",
  "Have your complaint investigated promptly and as privately as possible.",
  "Be protected from retaliation or workplace harm, such as dismissal, demotion, reduced hours or unfair treatment.",
  "Be separated from the person complained about, when appropriate and possible.",
  "Receive a reasoned written decision and review the investigation summary and recommendations.",
  "File a police complaint, a civil lawsuit or both, in addition to the workplace complaint.",
  "Not prove that she clearly rejected repeated sexual advances or comments when a manager or supervisor abused their authority.",
  "Apply for recognition as a work-injury victim if the harassment caused physical or psychological harm. This may provide medical treatment, injury benefits or disability benefits.",
  "Apply for unemployment benefits without the usual waiting period if you resigned because of workplace sexual harassment, subject to the eligibility requirements.",
  // "The Employer Must",
  // "Appoint someone responsible for handling sexual-harassment complaints.",
  // "Provide a clear way to submit complaints.",
  // "Investigate complaints without unnecessary delay.",
  // "Protect the complainant and take steps to stop further harassment.",
  // "Publish a sexual-harassment policy when the workplace has more than 25 employees.",
  // "These rights apply to harassment connected to work, including some cases that happen outside the physical workplace.",
];



export default function LegalScreen() {
  const router = useRouter();
  const [rightsOpen, setRightsOpen] = useState(false);
  const [right, setRight] = useState(0);
  const swipeX = useRef(0);
  const previous = (right - 1 + BULLETS.length) % BULLETS.length;
  const next = (right + 1) % BULLETS.length;

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
        <Text style={styles.title}>Your Rights</Text>

        <TouchableOpacity
          style={[styles.rightsCard, rightsOpen && styles.rightsCardOpen]}
          activeOpacity={1}
          onPress={() => setRightsOpen(!rightsOpen)}
        >
          {rightsOpen ? (
            <>
              <View style={styles.peel} />
              <Text style={styles.overviewText}>
                Sexual harassment is illegal under Israel&apos;s Prevention of Sexual Harassment Law. The law protects people in workplaces, schools, the military, and public places.
              </Text>
            </>
          ) : (
            <Text style={styles.rightsCardTitle}>What Are Your Rights?</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.holdHint}>Tap to switch</Text>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        <Text style={styles.subheading}>Your Rights</Text>

        <View
          style={styles.carousel}
          onStartShouldSetResponder={() => true}
          onResponderGrant={({ nativeEvent }) => { swipeX.current = nativeEvent.pageX; }}
          onResponderRelease={({ nativeEvent }) => {
            const distance = nativeEvent.pageX - swipeX.current;
            if (distance > 40) setRight(previous);
            if (distance < -40) setRight(next);
          }}
        >
          <TouchableOpacity style={[styles.sideCard, { backgroundColor: right % 2 ? "#D98FA3" : "#C49378" }]} onPress={() => setRight(previous)}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <View style={[styles.rightCard, { backgroundColor: right % 2 ? "#C49378" : "#D98FA3" }]}>
            <Text style={styles.rightText}>{BULLETS[right]}</Text>
          </View>
          <TouchableOpacity style={[styles.sideCard, { backgroundColor: right % 2 ? "#D98FA3" : "#C49378" }]} onPress={() => setRight(next)}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dots}>
          {BULLETS.map((_, index) => <View key={index} style={[styles.dot, index === right && styles.dotActive]} />)}
        </View>

      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(drawer)/legal-intro")}>
        <Text style={styles.backBtnText}>{"< Back"}</Text>
      </TouchableOpacity>
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

  scroll: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // title
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 40,
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  rightsCard: {
    minHeight: 140,
    backgroundColor: "#D98FA3",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rightsCardOpen: { backgroundColor: "#C49378" },
  rightsCardTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.burgundy,
    textAlign: "center",
  },
  peel: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 54,
    height: 54,
    backgroundColor: "#D98FA3",
    borderBottomLeftRadius: 54,
  },
  overviewText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    textAlign: "center",
    lineHeight: 22,
  },
  holdHint: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
  },

  // divider
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 20,
  },

  // "Your Rights" subheading
  subheading: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    textAlign: "center",
    marginBottom: 16,
  },

  carousel: { flexDirection: "row", alignItems: "center", gap: 8 },
  sideCard: { width: 48, height: 150, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rightCard: { flex: 1, minHeight: 190, borderRadius: 24, padding: 22, alignItems: "center", justifyContent: "center" },
  rightText: { fontFamily: "Ledger_400Regular", fontSize: 17, color: C.burgundy, lineHeight: 25, textAlign: "center" },
  arrow: { fontSize: 36, color: C.white, lineHeight: 38 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.divider },
  dotActive: { width: 16, backgroundColor: C.burgundy },

  // back button
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
