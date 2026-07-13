/*
    index.jsx — the welcome screen. AmanOr branded.
    fonts: Otomanopee One + Ledger
*/

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const C = {
  bg:       "#f5f0e0",
  burgundy: "#7a2035",
  text:     "#3a2020",
  muted:    "#9a8070",
  white:    "#ffffff",
};

export default function WelcomeScreen() {
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
        <Text style={styles.title}>Welcome To{"\n"}AmanOr</Text>

        {/* ── LOGO IMAGE ── */}
        <Image
          source={require("../assets/AmanOr_1.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* ── SUBTITLE ── */}
        <Text style={styles.subtitle}>
          We build safe workplaces and{"\n"}strengthen woman voices
        </Text>

        {/* ── GET STARTED BUTTON ── */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/auth")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 24,
  },

  // "Welcome To AmanOr"
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 38,
    color: C.burgundy,
    textAlign: "center",
    lineHeight: 50,
    letterSpacing: 0.5,
  },

  // logo image
  logo: {
    width: 200,
    height: 200,
  },

  // "We build safe workplaces..."
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    textAlign: "center",
    lineHeight: 26,
  },

  // pill button
  button: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    marginTop: 8,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.white,
    letterSpacing: 1,
  },
});