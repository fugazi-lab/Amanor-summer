/*
    role-pick.jsx — who are you?
    sits between the welcome screen and auth.
    "A Therapist" → auth-therapist.jsx
    "A Woman" → existing auth.jsx
    "A Company" → auth-company.jsx (sign in only)
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const C = {
  bg:       "#f5f0e0",
  burgundy: "#7a2035",
  text:     "#3a2020",
  muted:    "#9a8070",
  white:    "#ffffff",
};

export default function RolePickScreen() {
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

      <View style={styles.container}>

        {/* ── TITLE ── */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Who are{"\n"}you?</Text>
          <View style={styles.rule} />
        </View>

        {/* ── BUTTONS ── */}
        <View style={styles.buttonsSection}>

          {/* A Therapist */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => router.replace("/auth-therapist")}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>A Therapist</Text>
            <Text style={styles.optionDesc}>Provide Professional Emotional Support To Women</Text>
          </TouchableOpacity>

          {/* A Woman */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => router.replace("/auth")}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>A Woman</Text>
            <Text style={styles.optionDesc}>Get Support And Document Evidence</Text>
          </TouchableOpacity>

          {/* A Company */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => router.replace("/auth-company")}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>A Company</Text>
            <Text style={styles.optionDesc}>Support Your Employees</Text>
          </TouchableOpacity>

        </View>

        {/* ── BOTTOM LOGO ── */}
        <View style={styles.bottomLogoWrap}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={styles.bottomLogo}
            resizeMode="contain"
          />
        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
  flex: 1,
  paddingHorizontal: "7%",
},

titleSection: {
  height: "20%",
  justifyContent: "center",
  alignItems: "center",
},

title: {
  fontFamily: "OtomanopeeOne_400Regular",
  fontSize: 40,
  color: C.burgundy,
  lineHeight: 50,
  textAlign: "center",
},

rule: {
  marginTop: "6%",
  height: 1.5,
  backgroundColor: C.burgundy,
  width: "100%",
  opacity: 0.4,
},

buttonsSection: {
  height: "62%",
  justifyContent: "center",
  alignItems: "center",
  gap: "5%",
},

optionBtn: {
  width: "92%",
  backgroundColor: C.burgundy,
  borderRadius: 20,
  paddingVertical: "5%",
  alignItems: "center",
},

optionTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 24,
    color: C.white,
    marginBottom: 6,
    opacity: 0.95,
},

optionDesc: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.white,
    opacity: 0.7,
    letterSpacing: 0.3,
    textAlign: "center",
    paddingHorizontal: 10,
},

bottomLogoWrap: {
  position: "absolute",
  right: "5%",
  bottom: "4%",
  width: "12%",
  aspectRatio: 1,
},

bottomLogo: {
  width: "100%",
  height: "100%",
  opacity: 0.35,
},
});