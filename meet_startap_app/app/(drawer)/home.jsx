/*
    home.jsx — AmanOr feature hub.
    Redesigned to match the new brand mockup:
    top bar (menu / brand / profile) → headline → two hero cards
    → "More Resources" divider → resource cards → bottom nav.
    Scrolls vertically so every text element remains fully visible.

    Only wired to routes that are currently active in the app:
      Recording2 (Set Up Recording), emotional-help (Support),
      legal-intro (Legal Rights / Resources), report (Report Incident),
      files (Saved Evidence).
    flagged.jsx and donate.jsx are intentionally NOT linked here since
    they're not in use right now — easy to wire back in later if needed.
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg:          "#F5F0E4",
  text:        "#2C1810",
  muted:       "#6B5B4E",
  rose:        "#7A2035",
  roseSoft:    "#D98FA3",
  roseCircle:  "#E8BAC5",
  tan:         "#C49378",
  tanCircle:   "#D9B49F",
  brown:       "#6B4F3A",
  cardTan:     "#E8D8C8",
  white:       "#ffffff",
  navBg:       "#EDE8DC",
  divider:     "#C4B8A8",
};

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { username } = useLocalSearchParams();
  const user = username || "anon";

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.rose} />
      </SafeAreaView>
    );
  }

  // opens the drawer (swipeEnabled is off in the drawer layout, so this
  // hamburger button is the way in now)
  const openMenu = () => {
    try {
      navigation.toggleDrawer();
    } catch (e) {
      // drawer not available in this navigation context — ignore
    }
  };

  const handleProfilePress = () => {
    Alert.alert(user, "Account options", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  };

  const go = (pathname, params = {}) => router.push({ pathname, params });

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >

        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <Text style={styles.brandName}>Amanor</Text>
            <Text style={styles.tagline}>Empower women, change worlds.</Text>
          </View>

          <TouchableOpacity onPress={() => go("/(drawer)/Profile")} style={styles.profileCircle}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* ── HEADLINE ── */}
        <Text style={styles.headline}>
          You&apos;re not alone. We&apos;re here to support you.
        </Text>

        {/* ── HERO CARDS ── */}
        <View style={styles.heroRow}>

          {/* Record & Protect → Recording2.jsx */}
          <View style={[styles.heroCard, { backgroundColor: C.roseSoft }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: C.roseCircle }]}>
              <Text style={styles.heroIcon}>🎙️</Text>
            </View>
            <Text style={styles.heroTitle}>Record & Protect</Text>
            <Text style={styles.heroDesc}>Set a trigger word and record incidents securely.</Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: C.rose }]}
              onPress={() => go("/(drawer)/Recording2")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Set Up Recording</Text>
            </TouchableOpacity>
          </View>

          {/* Emotional Support → emotional-help.jsx */}
          <View style={[styles.heroCard, { backgroundColor: C.tan }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: C.tanCircle }]}>
              <Text style={styles.heroIcon}>🫂</Text>
            </View>
            <Text style={styles.heroTitle}>Emotional Support</Text>
            <Text style={styles.heroDesc}>Talk to others who understand. You&apos;re not alone.</Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: C.brown }]}
              onPress={() => go("/(drawer)/emotional-help")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Join Support Network</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* ── MORE RESOURCES DIVIDER ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>More Resources</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── RESOURCE CARDS ── */}
        <View style={styles.resourceRow}>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => go("/(drawer)/legal-intro")}
            activeOpacity={0.85}
          >
            <Text style={styles.resourceIcon}>⚖️</Text>
            <Text style={styles.resourceTitle}>Legal Rights</Text>
            <Text style={styles.resourceDesc}>Learn your rights at work</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => go("/(drawer)/report")}
            activeOpacity={0.85}
          >
            <Text style={styles.resourceIcon}>🏢</Text>
            <Text style={styles.resourceTitle}>Report To Company</Text>
            <Text style={styles.resourceDesc}>File a complaint safely</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => go("/(drawer)/files", { username: user })}
            activeOpacity={0.85}
          >
            <Text style={styles.resourceIcon}>🗂️</Text>
            <Text style={styles.resourceTitle}>Saved Evidence</Text>
            <Text style={styles.resourceDesc}>Access all your evidence</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7}>
          <Text style={[styles.navIcon, { color: C.rose }]}>🏠</Text>
          <Text style={[styles.navLabel, { color: C.rose }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => go("/(drawer)/emotional-help")} activeOpacity={0.7}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navLabel}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navReportTab} onPress={() => go("/(drawer)/report")} activeOpacity={0.85}>
          <View style={styles.navReportCircle}>
            <Text style={styles.navReportIcon}>＋</Text>
          </View>
          <Text style={[styles.navLabel, { color: C.rose, marginTop: 6 }]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => go("/(drawer)/legal-intro")} activeOpacity={0.7}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navLabel}>Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => go("/(drawer)/Profile")} activeOpacity={0.7}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },
  body: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 110,
  },

  // ── top bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconBtn: { paddingTop: 4 },
  menuIcon: { fontSize: 20, color: C.text },
  brandWrap: { flex: 1, alignItems: "center" },
  brandName: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 26,
    color: C.text,
  },
  tagline: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11.5,
    color: C.rose,
    marginTop: 1,
  },
  profileCircle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.rose,
    alignItems: "center", justifyContent: "center",
  },
  profileIcon: { fontSize: 14 },

  // ── headline ──
  headline: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 19,
    lineHeight: 25,
    color: C.text,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  // ── hero cards ──
  heroRow: {
  flexDirection: "row",
  gap: 10,
  marginBottom: 14,
  },

  heroCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  heroIcon: { fontSize: 30 },
  heroTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 17,
    color: C.text,
    textAlign: "center",
    marginBottom: 6,
  },
  heroDesc: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 14,
  },
  heroBtn: {
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: "center",
    width: "100%",
  },
  heroBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.white,
    textAlign: "center",
  },

  // ── divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.divider },
  dividerText: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 13,
    color: C.text,
  },

  // ── resource cards ──
  resourceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: C.cardTan,
    borderRadius: 14,
    padding: 12,
    justifyContent: "center",
  },
  resourceIcon: { fontSize: 18, marginBottom: 6 },
  resourceTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 12,
    lineHeight: 15,
    color: C.text,
    marginBottom: 5,
  },
  resourceDesc: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    lineHeight: 14,
    color: C.muted,
  },
  resourceArrow: {
    fontSize: 13,
    color: C.brown,
    alignSelf: "flex-end",
    marginTop: 10,
  },

  // ── bottom nav ──
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 6,
    zIndex: 10,
  },
  navTab: { flex: 1, alignItems: "center", gap: 4 },
  navIcon: { fontSize: 20, color: C.muted },
  navLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11,
    color: C.muted,
  },
  navReportTab: { flex: 1, alignItems: "center", marginTop: -26 },
  navReportCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.rose,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  navReportIcon: { fontSize: 24, color: C.white, fontWeight: "700" },
});
