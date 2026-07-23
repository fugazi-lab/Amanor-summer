/*
    home.jsx — AmanOr feature hub.
    Redesigned to match the new brand mockup:
    top bar (menu / brand / profile) → headline → two hero cards
    → "More Resources" divider → resource cards → bottom nav.
    Laid out with flex (no ScrollView) so it fills exactly one screen.

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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Dimensions } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const C = {
  bg:          "#FBF3EA",
  text:        "#33201A",
  muted:       "#8A7566",
  rose:        "#C0455F",
  roseSoft:    "#F6DCE0",
  roseCircle:  "#F0C7CE",
  tan:         "#F0E1D2",
  tanCircle:   "#DCC0A4",
  brown:       "#8B6F5C",
  cardTan:     "#F1E7DA",
  bannerBg:    "#F3D7DA",
  white:       "#ffffff",
  navBg:       "#F6EFE6",
  divider:     "#D9C7B8",
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
      <View style={styles.body}>

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
            <Text style={styles.tagline}>You report, we support.</Text>
          </View>

          <TouchableOpacity onPress={handleProfilePress} style={styles.profileCircle}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* ── HEADLINE ── */}
        <Text style={styles.headline} numberOfLines={2}>
          You&apos;re not alone. We&apos;re here to support you.
        </Text>

        {/* ── HERO CARDS ── */}
        <View style={styles.heroRow}>

          {/* Record & Protect → Recording2.jsx */}
          <View style={[styles.heroCard, { backgroundColor: C.roseSoft }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: C.roseCircle }]}>
              <Text style={styles.heroIcon}>🎙️</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>Record & Protect</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>Set a trigger word and record incidents securely.</Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: C.rose }]}
              onPress={() => go("/(drawer)/Recording2")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText} numberOfLines={1}>Set Up Recording</Text>
            </TouchableOpacity>
          </View>

          {/* Emotional Support → emotional-help.jsx */}
          <View style={[styles.heroCard, { backgroundColor: C.tan }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: C.tanCircle }]}>
              <Text style={styles.heroIcon}>🫂</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>Emotional Support</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>Talk to others who understand. You&apos;re not alone.</Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: C.brown }]}
              onPress={() => go("/(drawer)/emotional-help")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText} numberOfLines={1}>Join Support Network</Text>
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
            <Text style={styles.resourceTitle} numberOfLines={2}>Legal Rights</Text>
            <Text style={styles.resourceDesc} numberOfLines={2}>Learn your rights at work</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => go("/(drawer)/report")}
            activeOpacity={0.85}
          >
            <Text style={styles.resourceIcon}>🏢</Text>
            <Text style={styles.resourceTitle} numberOfLines={2}>Report To Company</Text>
            <Text style={styles.resourceDesc} numberOfLines={2}>File a complaint safely</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => go("/(drawer)/files", { username: user })}
            activeOpacity={0.85}
          >
            <Text style={styles.resourceIcon}>🗂️</Text>
            <Text style={styles.resourceTitle} numberOfLines={2}>Saved Evidence</Text>
            <Text style={styles.resourceDesc} numberOfLines={2}>Access all your evidence</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>

        </View>

        {/* ── BANNER ── */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => go("/(drawer)/legal-what")}
          activeOpacity={0.85}
        >
          <Text style={styles.bannerIcon}>🤲</Text>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle} numberOfLines={1}>Together, we create safer workplaces.</Text>
            <Text style={styles.bannerSub} numberOfLines={1}>Your voice can protect others.</Text>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </TouchableOpacity>

      </View>

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

        <TouchableOpacity style={styles.navTab} onPress={handleProfilePress} activeOpacity={0.7}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 26,
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
  maxHeight: SCREEN_HEIGHT * 0.90,
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
    maxHeight: 190,
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

  // ── banner ──
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bannerBg,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: "5%",
  },
  bannerIcon: { fontSize: 20 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 12,
    color: C.text,
  },
  bannerSub: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    color: C.muted,
    marginTop: 1,
  },
  bannerArrow: {
    fontSize: 14,
    color: C.rose,
  },

  // ── bottom nav ──
  navBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 6,
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