/*
    legal-intro.jsx — your legal rights landing page.
    cards route to: what is harassment, your rights, what employers must do.
    fonts: Otomanopee One + Ledger
*/

import { Ionicons } from "@expo/vector-icons";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

const C = {
  bg:         "#F5F0E4",
  burgundy:   "#7a2035",
  text:       "#2C1810",
  muted:      "#6B5B4E",
  cardBg:     "#fbf3ee",
  cardBorder: "#e9d6ce",
  iconBg:     "#f2d9d9",
  chevron:    "#c9a9a9",
  backBg:     "#f6e2e5",
  white:      "#ffffff",
};

// card config — icon + copy + route in one place
const ITEMS = [
  {
    key: "what",
    route: "/(drawer)/legal-what",
    label: "What Is Workplace\nSexual Harassment?",
    icon: "help-circle-outline",
  },
  {
    key: "rights",
    route: "/(drawer)/legal",
    label: "Your Rights",
    icon: "shield-checkmark-outline",
  },
  {
    key: "employer",
    route: "/(drawer)/legal-employer",
    label: "What Employers Must Do",
    icon: "business-outline",
  },
];

export default function LegalIntroScreen() {
  const router = useRouter();
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
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", paddingHorizontal: wp(7), justifyContent: "center" }}>

        {/* ── LOGO LOCKUP ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={{ width: wp(20), height: wp(20), marginRight: wp(0) }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(6.5), color: C.burgundy }}>
            AmanOr
          </Text>
        </View>

        {/* ── TITLE + DIVIDER ── */}
        <View style={{ alignItems: "center", marginTop: hp(2), marginBottom: hp(3) }}>
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(8), color: C.burgundy }}>
            Legal Guidance
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(1) }}>
            <View style={{ width: wp(8), height: 1, backgroundColor: C.burgundy, opacity: 0.35 }} />
            <Ionicons name="heart" size={wp(3.2)} color={C.burgundy} style={{ marginHorizontal: wp(2), opacity: 0.7 }} />
            <View style={{ width: wp(8), height: 1, backgroundColor: C.burgundy, opacity: 0.35 }} />
          </View>
        </View>

        {/* ── CARDS ── */}
        <View style={{ gap: hp(2) }}>
          {ITEMS.map(({ key, route, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.cardBg,
                borderColor: C.cardBorder,
                borderWidth: 1,
                borderRadius: wp(5),
                paddingVertical: hp(1.8),
                paddingHorizontal: wp(4.5),
              }}
              onPress={() => router.push(route)}
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: wp(13),
                  height: wp(13),
                  borderRadius: wp(6.5),
                  backgroundColor: C.iconBg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: wp(4),
                }}
              >
                <Ionicons name={icon} size={wp(6.5)} color={C.burgundy} />
              </View>

              <Text
                style={{
                  flex: 1,
                  fontFamily: "Ledger_400Regular",
                  fontSize: wp(4.2),
                  color: C.burgundy,
                  lineHeight: wp(5.4),
                }}
              >
                {label}
              </Text>

              <Ionicons name="chevron-forward" size={wp(5)} color={C.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── BOTTOM ACTIONS: BACK + ASK AI ── */}
        <View style={{ flexDirection: "row", gap: wp(3), marginTop: hp(4) }}>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.backBg,
              borderRadius: wp(7),
              paddingVertical: hp(2),
              gap: wp(1.5),
            }}
            onPress={() => router.replace("/(drawer)/home")}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={wp(4.5)} color={C.burgundy} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(4.2), color: C.burgundy }}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.burgundy,
              borderRadius: wp(7),
              paddingVertical: hp(2),
              gap: wp(1.5),
            }}
            onPress={() =>
              router.push({
                pathname: "/(drawer)/legal",
                params: { openChat: "true" },
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={wp(4.5)} color={C.white} />
            <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(4.2), color: C.white }}>
              Ask AI
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
