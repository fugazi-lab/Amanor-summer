/*
    emotional-help.jsx — emotional support landing page.
    sits between home.jsx and the support/discussion screens.
    "Join The Survivors Support Network" → index.jsx (discussion board)
    "A Meeting With A Therapy" → schedule-meeting.jsx (future page)
    fonts: Otomanopee One + Ledger
*/

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  bg:         "#f5f0e0",
  burgundy:   "#7a2035",
  text:       "#3a2020",
  muted:      "#9a8070",
  cardBg:     "#fbf3ee",
  cardBorder: "#e9d6ce",
  iconBg:     "#f2d9d9",
  white:      "#ffffff",
};

// card config — icon + copy + route in one place
const ITEMS = [
  {
    key: "network",
    route: "/(drawer)/",
    label: "Join The Survivors\nSupport Network",
    Icon: Ionicons,
    iconName: "people-outline",
  },
  {
    key: "therapy",
    route: "/(drawer)/schedule-meeting",
    label: "A Therapy Sessions",
    Icon: MaterialCommunityIcons,
    iconName: "sofa-outline",
  },
];

export default function EmotionalHelpScreen() {
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
            style={{ width: wp(9), height: wp(9), marginRight: wp(2) }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(6.5), color: C.burgundy }}>
            AmanOr
          </Text>
        </View>

        {/* ── TITLE + DIVIDER ── */}
        <View style={{ alignItems: "center", marginTop: hp(2), marginBottom: hp(3) }}>
          <Text style={{ fontFamily: "OtomanopeeOne_400Regular", fontSize: wp(8), color: C.burgundy }}>
            Emotional Help
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(1) }}>
            <View style={{ width: wp(8), height: 1, backgroundColor: C.burgundy, opacity: 0.35 }} />
            <Ionicons name="heart" size={wp(3.2)} color={C.burgundy} style={{ marginHorizontal: wp(2), opacity: 0.7 }} />
            <View style={{ width: wp(8), height: 1, backgroundColor: C.burgundy, opacity: 0.35 }} />
          </View>
        </View>

        {/* ── CARDS ── */}
        <View style={{ gap: hp(2.5) }}>
          {ITEMS.map(({ key, route, label, Icon, iconName }) => (
            <TouchableOpacity
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.cardBg,
                borderColor: C.cardBorder,
                borderWidth: 1,
                borderRadius: wp(5.5),
                paddingVertical: hp(3),
                paddingHorizontal: wp(5.5),
              }}
              onPress={() => router.push(route)}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: "OtomanopeeOne_400Regular",
                  fontSize: wp(5),
                  color: C.burgundy,
                  lineHeight: wp(6.2),
                }}
              >
                {label}
              </Text>

              <View
                style={{
                  width: wp(17),
                  height: wp(17),
                  borderRadius: wp(8.5),
                  backgroundColor: C.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: wp(3),
                }}
              >
                <Icon name={iconName} size={wp(8.5)} color={C.burgundy} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── BACK ── */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: C.burgundy,
            borderRadius: wp(7),
            paddingVertical: hp(2),
            marginTop: hp(4),
            gap: wp(1.5),
            shadowColor: C.burgundy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          }}
          onPress={() => router.replace("/(drawer)/home")}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={wp(4.5)} color={C.white} />
          <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(4.2), color: C.white }}>
            Back
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}