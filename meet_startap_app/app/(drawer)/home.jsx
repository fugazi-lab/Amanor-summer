/*
    home.jsx — AmanOr feature hub.
    uses real icon images for each feature card.
    place icons in: assets/icons/
      incident.png, rights.png, support.png, flaged.png, donate.png, recording.png
*/

import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
};

const FEATURES = [
  {
    id: "report",
    pathname: "/(drawer)/report",
    params: {},
    icon: require("../../assets/icons/incident.png"),
    title: "Report an Incident",
    desc: "Report anonymously or with your name",
  },
  {
    id: "legal",
    pathname: "/(drawer)/legal-intro",
    params: {},
    icon: require("../../assets/icons/rights.png"),
    title: "Know Your Legal Rights",
    desc: "Learn your rights against workplace harassment",
  },
  {
    id: "index",
    pathname: "/(drawer)/",
    params: {},
    icon: require("../../assets/icons/support.png"),
    title: "Get Emotional Support",
    desc: "Access the survivor support network",
  },
  {
    id: "flagged",
    pathname: "/(drawer)/flagged",
    params: {},
    icon: require("../../assets/icons/flaged.png"),
    title: "Check Out Flagged Workplaces",
    desc: "Check reports before choosing a workplace",
  },
  {
    id: "donate",
    pathname: "/(drawer)/donate",
    params: {},
    icon: require("../../assets/icons/donate.png"),
    title: "Donate to Keep Workplaces Safe",
    desc: "Help empower women and protect workplaces",
  },
  {
    id: "Recording2",
    pathname: "/(drawer)/Recording2",
    params: {},
    icon: require("../../assets/icons/recording.png"),
    title: "Set Up Recording",
    desc: "Choose a trigger word to set up voice-activated recording",
  },
  {
    id: "files",
    pathname: "/(drawer)/files",
    params: {},
    icon: require("../../assets/icons/files.png"),
    title: "My Evidence",
    desc: "View and manage your uploaded audio and video evidence",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const user = username || "anon";

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── BULB + BRAND NAME ── */}
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>AmanOr</Text>
        </View>

        {/* ── SECTION TITLE ── */}
        <Text style={styles.sectionTitle}>Explore our features</Text>
        <View style={styles.rule} />

        {/* ── FEATURE CARDS ── */}
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={styles.card}
            onPress={() => router.push({
              pathname: f.pathname,
              params: f.id === "files" ? { username: user } : f.params,
            })}
            activeOpacity={0.82}
          >
            <Image
              source={f.icon}
              style={styles.cardIcon}
              resizeMode="cover"
            />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ── BOTTOM BULB ── */}
        <View style={styles.bottomLogoWrap}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={styles.bottomLogo}
            resizeMode="contain"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 40,
  },

  // brand header
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  brandLogo: {
    width: 56,
    height: 56,
    marginRight: 8,
  },
  brandName: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 42,
    color: C.burgundy,
    letterSpacing: 0.5,
  },

  // section heading
  sectionTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.text,
    textAlign: "center",
    marginBottom: 12,
  },
  rule: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 20,
  },

  // feature card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 72,
    height: 72,
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 15,
    color: C.text,
    marginBottom: 3,
  },
  cardDesc: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
  },

  // bottom bulb
  bottomLogoWrap: {
    alignItems: "center",
    marginTop: 20,
  },
  bottomLogo: {
    width: 36,
    height: 36,
    opacity: 0.4,
  },
});