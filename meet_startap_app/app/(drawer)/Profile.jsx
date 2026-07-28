/*
    profile.jsx — simple profile / account page.
    Shows the logged-in username and a Log Out button.
    Styled to match the redesigned home.jsx (same palette, fonts,
    percentage-based sizing).
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── percentage-of-screen helpers (for the RN props that must be numbers) ──
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const wp = (percent) => (SCREEN_W * percent) / 100;
const hp = (percent) => (SCREEN_H * percent) / 100;

const C = {
  bg:          "#FBF3EA",
  text:        "#33201A",
  muted:       "#8A7566",
  rose:        "#C0455F",
  roseSoft:    "#F6DCE0",
  roseCircle:  "#F0C7CE",
  white:       "#ffffff",
  divider:     "#D9C7B8",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { username, returnTo } = useLocalSearchParams();
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

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  };

  const handleBack = () => {
    if (returnTo === "therapist-home") {
      router.replace({
        pathname: "/(drawer)/therapist-home",
        params: { username: user },
      });
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>

        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Profile</Text>
          <View style={styles.iconBtn} />
        </View>

        {/* ── PROFILE CARD ── */}
        <View style={styles.center}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>

          <Text style={styles.username} numberOfLines={1}>{user}</Text>
          <Text style={styles.subtitle}>You&apos;re signed in to Amanor</Text>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  body: {
    flex: 1,
    paddingHorizontal: "4.6%",
    paddingTop: "6.7%",
  },

  // ── top bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4%",
  },
  iconBtn: { width: "12%", paddingTop: "1%" },
  backArrow: { fontSize: hp(3.4), color: C.text },
  topTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: hp(2.4),
    color: C.text,
  },

  // ── profile ──
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: "28%",
    aspectRatio: 1,
    borderRadius: wp(20),
    backgroundColor: C.roseSoft,
    borderWidth: wp(0.5),
    borderColor: C.rose,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5%",
  },
  avatarIcon: { fontSize: hp(5.5) },
  username: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: hp(3.2),
    color: C.text,
    textAlign: "center",
    marginBottom: "1.5%",
  },
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: hp(1.6),
    color: C.muted,
    textAlign: "center",
    marginBottom: "9%",
  },
  logoutBtn: {
    backgroundColor: C.rose,
    borderRadius: wp(8),
    paddingVertical: "4.2%",
    paddingHorizontal: "14%",
    alignItems: "center",
    shadowColor: C.rose,
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.3,
    shadowRadius: wp(2),
    elevation: 4,
  },
  logoutBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: hp(2.0),
    color: C.white,
    letterSpacing: 0.5,
  },
});
