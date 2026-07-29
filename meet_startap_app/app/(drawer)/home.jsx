/*
    home.jsx — AmanOr feature hub.
    top bar (brand / profile) → headline → two hero cards
    → "More Resources" divider → resource cards → bottom nav.
    Scrolls vertically so every text element remains fully visible.

    Only wired to routes that are currently active in the app:
      Recording2 (Set Up Recording), emotional-help (Support),
      legal-intro (Legal Rights / Resources), report (Report Incident),
      files (Saved Evidence).
    flagged.jsx and donate.jsx are intentionally NOT linked here since
    they're not in use right now — easy to wire back in later if needed.
*/

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
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

// hero cards — icon + copy + route in one place
const HERO_CARDS = [
  {
    key: "record",
    bg: C.roseSoft,
    iconBg: C.roseCircle,
    Icon: Ionicons,
    iconName: "mic-outline",
    title: "Record & Protect",
    desc: "Set a trigger word and record incidents securely.",
    btnBg: C.rose,
    btnText: "Set Up Recording",
    route: "/(drawer)/Recording2",
  },
  {
    key: "support",
    bg: C.tan,
    iconBg: C.tanCircle,
    Icon: Ionicons,
    iconName: "heart-outline",
    title: "Emotional Support",
    desc: "Talk to others who understand. You're not alone.",
    btnBg: C.brown,
    btnText: "Join Support Network",
    route: "/(drawer)/emotional-help",
  },
];

// resource cards — icon + copy + route in one place
const RESOURCE_CARDS = [
  {
    key: "legal",
    Icon: MaterialCommunityIcons,
    iconName: "scale-balance",
    title: "Legal Rights",
    desc: "Learn your rights at work",
    route: "/(drawer)/legal-intro",
  },
  {
    key: "report",
    Icon: Ionicons,
    iconName: "business-outline",
    title: "Report To Company",
    desc: "File a complaint safely",
    route: "/(drawer)/report",
  },
  {
    key: "evidence",
    Icon: Ionicons,
    iconName: "folder-outline",
    title: "Saved Evidence",
    desc: "Access all your evidence",
    route: "/(drawer)/files",
    withUsername: true,
  },
];

// side nav tabs (excludes the raised center "Report" button, handled separately)
const NAV_TABS = [
  { key: "home", iconName: "home", label: "Home", color: "rose" },
  { key: "support", iconName: "people-outline", label: "Support", route: "/(drawer)/emotional-help", color: "muted" },
  { key: "resources", iconName: "book-outline", label: "Resources", route: "/(drawer)/legal-intro", color: "muted" },
  { key: "profile", iconName: "person-outline", label: "Profile", route: "/(drawer)/Profile", color: "muted" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const user = username || "anon";
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

  const handleProfilePress = () => {
    Alert.alert(user, "Account options", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  };

  const go = (pathname, params = {}) => router.push({ pathname, params });

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
          paddingTop: hp(3.2),
          paddingBottom: hp(13.5),
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── TOP BAR ── */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: hp(1.2) }}>
          <View style={{ width: wp(8), height: wp(8) }} />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(6.5), color: C.text }}>
              Amanor
            </Text>
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.9), color: C.rose, marginTop: hp(0.15) }}>
              Empower women, change worlds.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => go("/(drawer)/Profile")}
            style={{
              width: wp(8),
              height: wp(8),
              borderRadius: wp(4),
              borderWidth: 1.5,
              borderColor: C.rose,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={wp(4)} color={C.rose} />
          </TouchableOpacity>
        </View>

        {/* ── HEADLINE ── */}
        <Text
          style={{
            fontFamily: "OtomanopeeOne_400Regular",
            fontSize: wp(4.75),
            lineHeight: wp(6.25),
            color: C.text,
            textAlign: "center",
            marginTop: hp(1.2),
            marginBottom: hp(1.7),
          }}
        >
          You&apos;re not alone. We&apos;re here to support you.
        </Text>

        {/* ── HERO CARDS ── */}
        <View style={{ flexDirection: "row", gap: wp(2.5), marginBottom: hp(1.7) }}>
          {HERO_CARDS.map(({ key, bg, iconBg, Icon, iconName, title, desc, btnBg, btnText, route }) => (
            <View
              key={key}
              style={{
                flex: 1,
                backgroundColor: bg,
                borderRadius: wp(4.5),
                padding: wp(3.5),
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: wp(18),
                  height: wp(18),
                  borderRadius: wp(9),
                  backgroundColor: iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: hp(1.5),
                }}
              >
                <Icon name={iconName} size={wp(7.5)} color={C.text} />
              </View>
              <Text
                style={{
                  fontFamily: "OtomanopeeOne_400Regular",
                  fontSize: wp(4.25),
                  color: C.text,
                  textAlign: "center",
                  marginBottom: hp(0.75),
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontFamily: "Ledger_400Regular",
                  fontSize: wp(3.25),
                  color: C.muted,
                  textAlign: "center",
                  lineHeight: wp(4.25),
                  marginBottom: hp(1.7),
                }}
              >
                {desc}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: btnBg,
                  borderRadius: wp(7.5),
                  paddingVertical: hp(1.6),
                  paddingHorizontal: wp(3),
                  alignItems: "center",
                  width: "100%",
                }}
                onPress={() => go(route)}
                activeOpacity={0.85}
              >
                <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.5), color: C.white, textAlign: "center" }}>
                  {btnText}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── MORE RESOURCES DIVIDER ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: wp(2.5), marginBottom: hp(1.5) }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(3.25), color: C.text }}>
            More Resources
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
        </View>

        {/* ── RESOURCE CARDS ── */}
        <View style={{ flexDirection: "row", gap: wp(2.5), marginBottom: hp(1.5) }}>
          {RESOURCE_CARDS.map(({ key, Icon, iconName, title, desc, route, withUsername }) => (
            <TouchableOpacity
              key={key}
              style={{
                flex: 1,
                backgroundColor: C.cardTan,
                borderRadius: wp(3.5),
                padding: wp(3),
                justifyContent: "center",
              }}
              onPress={() => go(route, withUsername ? { username: user } : {})}
              activeOpacity={0.85}
            >
              <Icon name={iconName} size={wp(4.5)} color={C.brown} style={{ marginBottom: hp(0.75) }} />
              <Text
                style={{
                  fontFamily: "OtomanopeeOne_400Regular",
                  fontSize: wp(3),
                  lineHeight: wp(3.75),
                  color: C.text,
                  marginBottom: hp(0.6),
                }}
              >
                {title}
              </Text>
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.6), lineHeight: wp(3.5), color: C.muted }}>
                {desc}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={wp(3.25)}
                color={C.brown}
                style={{ alignSelf: "flex-end", marginTop: hp(1.2) }}
              />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      {/* outer: just anchors full-bleed to the bottom edge, no visual styling */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10 }}>
        {/* inner: the actual nav bar — this is what gets capped + centered */}
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: C.navBg,
            borderTopWidth: 1,
            borderTopColor: C.divider,
            paddingTop: hp(1.2),
            paddingBottom: hp(2.5),
            paddingHorizontal: wp(1.5),
          }}
        >
        {NAV_TABS.slice(0, 2).map(({ key, iconName, label, route, color }) => (
          <TouchableOpacity
            key={key}
            style={{ flex: 1, alignItems: "center", gap: hp(0.5) }}
            onPress={route ? () => go(route) : undefined}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={wp(5)} color={color === "rose" ? C.rose : C.muted} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.75), color: color === "rose" ? C.rose : C.muted }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Raised center Report button */}
        <TouchableOpacity
          style={{ flex: 1, alignItems: "center", marginTop: -hp(3.2) }}
          onPress={() => go("/(drawer)/report")}
          activeOpacity={0.85}
        >
          <View
            style={{
              width: wp(13),
              height: wp(13),
              borderRadius: wp(6.5),
              backgroundColor: C.rose,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: C.rose,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={wp(6.5)} color={C.white} />
          </View>
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.75), color: C.rose, marginTop: hp(0.75) }}>
            Report
          </Text>
        </TouchableOpacity>

        {NAV_TABS.slice(2).map(({ key, iconName, label, route, color }) => (
          <TouchableOpacity
            key={key}
            style={{ flex: 1, alignItems: "center", gap: hp(0.5) }}
            onPress={route ? () => go(route) : undefined}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={wp(5)} color={color === "rose" ? C.rose : C.muted} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(2.75), color: color === "rose" ? C.rose : C.muted }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        </View>
      </View>
    </SafeAreaView>
  );
}