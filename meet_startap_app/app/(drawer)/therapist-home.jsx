/*
  therapist-home.jsx — the therapist workspace.
  Trimmed to a single primary action: Set Availability.
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const C = {
  bg: "#F5F0E4",
  text: "#2C1810",
  muted: "#6B5B4E",
  rose: "#7A2035",
  roseSoft: "#D98FA3",
  roseCircle: "#E8BAC5",
  white: "#FFFFFF",
  navBg: "#EDE8DC",
  divider: "#C4B8A8",
};

export default function TherapistHomeScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const therapistName = Array.isArray(username) ? username[0] : username;
  const { width, height } = useWindowDimensions();

  // clamp scaling width to a phone-like max so proportions stay consistent
  // on wide viewports (pc / tablet / web) instead of ballooning with them
  const layoutWidth = Math.min(width, 480);
  const wp = (p) => (layoutWidth * p) / 100;
  const hp = (p) => (height * p) / 100;

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={C.rose} />
      </SafeAreaView>
    );
  }

  const comingSoon = (title, message) => Alert.alert(title, message);
  const openProfile = () =>
    router.push({
      pathname: "/(drawer)/Profile",
      params: {
        username: therapistName || "therapist",
        returnTo: "therapist-home",
      },
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          width: "100%",
          maxWidth: 480,
          alignSelf: "center",
          paddingHorizontal: wp(4.5),
          paddingTop: hp(2.2),
          paddingBottom: hp(13.5),
          justifyContent: "flex-start",
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── WELCOME + PROFILE (now at the top) ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: wp(3) }}>
            <Text
              style={{
                fontFamily: "OtomanopeeOne_400Regular",
                fontSize: wp(5),
                lineHeight: wp(6.75),
                color: C.text,
              }}
            >
              {therapistName ? `Welcome, ${therapistName}` : "Welcome back"}
            </Text>
            <Text
              style={{
                fontFamily: "Ledger_400Regular",
                fontSize: wp(3.5),
                lineHeight: wp(5.25),
                color: C.muted,
                marginTop: hp(0.5),
              }}
            >
              What would you like to do today?
            </Text>
          </View>

          <TouchableOpacity
            style={{
              width: wp(8.5),
              height: wp(8.5),
              borderRadius: wp(4.25),
              borderWidth: 1.5,
              borderColor: C.rose,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={openProfile}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Therapist account"
          >
            <Ionicons name="person-outline" size={wp(4.25)} color={C.rose} />
          </TouchableOpacity>
        </View>

        {/* ── AMANOR BRAND ── */}
        <View style={{ alignItems: "center", marginTop: hp(2.5), marginBottom: hp(1.2) }}>
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(6.5), color: C.text }}>
            Amanor
          </Text>
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.9), color: C.rose, marginTop: hp(0.15) }}>
            Empower women, change worlds.
          </Text>
        </View>

        {/* ── SET AVAILABILITY (only remaining action) ── */}
        <View
          style={{
            backgroundColor: C.roseSoft,
            borderRadius: wp(5),
            padding: wp(5),
            alignItems: "center",
            justifyContent: "center",
            marginTop: hp(1.5),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 7,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: wp(16),
              height: wp(16),
              borderRadius: wp(8),
              backgroundColor: C.roseCircle,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: hp(1.5),
            }}
          >
            <Ionicons name="calendar-outline" size={wp(7.5)} color={C.rose} />
          </View>
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(4.5), color: C.text, textAlign: "center" }}>
            Set Availability
          </Text>
          <Text
            style={{
              fontFamily: "Ledger_400Regular",
              fontSize: wp(3.4),
              lineHeight: wp(4.5),
              color: C.muted,
              textAlign: "center",
              marginTop: hp(0.7),
              marginBottom: hp(2),
            }}
          >
            Choose when clients can book you.
          </Text>
          <TouchableOpacity
            style={{
              minHeight: hp(5.5),
              width: "100%",
              borderRadius: wp(6),
              paddingHorizontal: wp(4.5),
              backgroundColor: C.rose,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: wp(1.75),
            }}
            onPress={() => router.push("/(drawer)/schedule-availability")}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add Dates"
          >
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.white }}>
              Add Dates
            </Text>
            <Ionicons name="arrow-forward" size={wp(4.25)} color={C.white} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10 }}>
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            flexDirection: "row",
            backgroundColor: C.navBg,
            borderTopWidth: 1,
            borderTopColor: C.divider,
            paddingTop: hp(1.35),
            paddingBottom: hp(2.3),
            paddingHorizontal: wp(2),
          }}
        >
          <TouchableOpacity style={{ flex: 1, alignItems: "center", gap: hp(0.5) }} activeOpacity={0.7}>
            <Ionicons name="home" size={wp(5.25)} color={C.rose} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.6), color: C.rose }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center", gap: hp(0.5) }}
            onPress={() => router.push("/(drawer)/schedule-availability")}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={wp(5.25)} color={C.muted} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.6), color: C.muted }}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, alignItems: "center", gap: hp(0.5) }} onPress={openProfile} activeOpacity={0.7}>
            <Ionicons name="person-outline" size={wp(5.25)} color={C.muted} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.6), color: C.muted }}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}