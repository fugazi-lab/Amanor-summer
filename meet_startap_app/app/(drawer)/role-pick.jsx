/*
    role-pick.jsx — who are you?
    sits between the welcome screen and auth.
    "A Therapist" → auth-therapist.jsx
    "A Woman" → existing auth.jsx
    "A Company" → auth-company.jsx (sign in only)
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
  white:      "#ffffff",
  cardBg:     "#fbf3ee",
  cardBorder: "#e9d6ce",
  iconBg:     "#f2d9d9",
};

// role config — icon + copy in one place so cards stay in sync
const ROLES = [
  {
    key: "therapist",
    route: "/auth-therapist",
    title: "A Therapist",
    desc: "Provide Professional Emotional Support To Women",
    Icon: MaterialCommunityIcons,
    iconName: "account-heart-outline",
  },
  {
    key: "woman",
    route: "/auth",
    title: "A Woman",
    desc: "Get Support And Document Evidence",
    Icon: Ionicons,
    iconName: "woman-outline",
  },
  {
    key: "company",
    route: "/auth-company",
    title: "A Company",
    desc: "Support Your Employees",
    Icon: Ionicons,
    iconName: "business-outline",
  },
];

export default function RolePickScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // clamp the width used for scaling to a phone-like max. without this,
  // on a wide viewport (pc / tablet / web) raw width is huge and every
  // element scales up out of proportion — this keeps the ratio consistent
  // across devices while the outer container below stays centered.
  const layoutWidth = Math.min(width, 480);

  // percentage-of-screen helpers — every size below derives from these
  // so the whole layout scales with the device instead of using fixed px
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

        {/* ── LOGO ── */}
        <View style={{ alignItems: "center", marginBottom: hp(2) }}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={{ width: wp(30), height: wp(30) }}
            resizeMode="contain"
          />
        </View>

        {/* ── TITLE ── */}
        <View style={{ alignItems: "center", marginBottom: hp(4) }}>
          <Text
            style={{
              fontFamily: "OtomanopeeOne_400Regular",
              fontSize: wp(10.5),
              color: C.burgundy,
              lineHeight: wp(12.5),
              textAlign: "center",
            }}
          >
            Who are you?
          </Text>
        </View>

        {/* ── BUTTONS ── */}
        <View style={{ gap: hp(2.5) }}>
          {ROLES.map(({ key, route, title, desc, Icon, iconName }) => (
            <TouchableOpacity
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                backgroundColor: C.cardBg,
                borderColor: C.cardBorder,
                borderWidth: 1,
                borderRadius: wp(6),
                paddingVertical: hp(2.2),
                paddingHorizontal: wp(5),
              }}
              onPress={() => router.replace(route)}
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: wp(15),
                  height: wp(15),
                  borderRadius: wp(7.5),
                  backgroundColor: C.iconBg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: wp(4.5),
                }}
              >
                <Icon name={iconName} size={wp(7.5)} color={C.burgundy} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "OtomanopeeOne_400Regular",
                    fontSize: wp(5),
                    color: C.burgundy,
                    marginBottom: hp(0.6),
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Ledger_400Regular",
                    fontSize: wp(3.4),
                    color: C.muted,
                    letterSpacing: 0.2,
                    lineHeight: wp(4.4),
                  }}
                >
                  {desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}