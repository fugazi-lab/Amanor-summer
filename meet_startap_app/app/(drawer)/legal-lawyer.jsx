/*
    legal-lawyer.jsx — Choose A Lawyer. demo page.
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
  Alert,
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

const LAWYERS = [
  { id: "1", name: "Lawyer Name 1" },
  { id: "2", name: "Lawyer Name 2" },
  { id: "3", name: "Lawyer Name 3" },
];

export default function LegalLawyerScreen() {
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
        <Text style={styles.title}>Choose A Lawyer</Text>

        <View style={{ height: 24 }} />

        {/* ── LAWYER CARDS ── */}
        {LAWYERS.map((lawyer) => (
          <View key={lawyer.id} style={styles.lawyerCard}>
            <View style={styles.lawyerLeft}>
              {/* person icon circle */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              <Text style={styles.lawyerName}>{lawyer.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => Alert.alert("Demo", `Payment for ${lawyer.name} not yet implemented.`)}
              activeOpacity={0.85}
            >
              <Text style={styles.payBtnText}>Pay To Start</Text>
            </TouchableOpacity>
          </View>
        ))}

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
    fontSize: 36,
    color: C.burgundy,
    lineHeight: 44,
  },

  // lawyer card
  lawyerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.divider,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  lawyerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: C.divider,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5ede6",
  },
  avatarIcon: { fontSize: 18 },
  lawyerName: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
    color: C.text,
  },

  // pay button — outlined style matching screenshot
  payBtn: {
    borderWidth: 1,
    borderColor: C.burgundy,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  payBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.burgundy,
    fontWeight: "600",
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