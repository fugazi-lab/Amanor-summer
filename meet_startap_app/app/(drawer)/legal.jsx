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

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const BULLETS = [
  "Safe Workplace: Employers Must Prevent Harassment And Have Clear Reporting Procedures.",
  "Report The Incident: You Can Report To The Workplace Harassment Officer, HR, Or A Manager. The Complaint Must Be Investigated Confidentially.",
  "Protection: It Is Illegal For An Employer To Punish Or Fire You For Reporting Harassment.",
  "Police Report: Serious Cases Can Be Reported To The Police.",
  "Compensation: Victims May File A Claim In Labor Court And Receive Financial Compensation.",
  "Privacy & Support: Your Identity Can Be Protected, And You Can Receive Legal And Emotional Support.",
];

export default function LegalScreen() {
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
        <Text style={styles.title}>Your Rights</Text>

        {/* ── LAW OVERVIEW ── */}
        <Text style={styles.overviewText}>
          Sexual Harassment Law In Israel:{"\n"}
          Sexual Harassment Is Illegal Under The Prevention Of Sexual Harassment Law (Israel).
        </Text>

        <Text style={styles.overviewText}>
          The Law Protects People In Workplaces, Schools, The Military, And Public Places.{"\n"}
          Sexual Harassment Can Be Both A Criminal Offense (Police Can Punish The Offender) And A Civil Violation (The Victim Can Sue For Compensation).
        </Text>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        {/* ── YOUR RIGHTS SUBHEADING ── */}
        <Text style={styles.subheading}>Your Rights</Text>

        {/* ── BULLET POINTS ── */}
        <View style={styles.bulletList}>
          {BULLETS.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />

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

  // overview paragraphs
  overviewText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
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

  // bullet list
  bulletList: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
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

  // back button
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