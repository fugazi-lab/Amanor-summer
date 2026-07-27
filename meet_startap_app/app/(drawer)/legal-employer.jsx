import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#F5F0E4",
  burgundy: "#7a2035",
  text: "#2C1810",
  muted: "#6B5B4E",
  divider: "#C4B8A8",
  white: "#ffffff",
};

const DUTIES = [
  "Appoint someone responsible for handling sexual-harassment complaints.",
  "Provide a clear way to submit complaints.",
  "Investigate complaints without unnecessary delay.",
  "Protect the complainant and take steps to stop further harassment.",
  "Publish a sexual-harassment policy when the workplace has more than 25 employees.",
];

export default function LegalEmployerScreen() {
  const router = useRouter();
  const [duty, setDuty] = useState(0);
  const swipeX = useRef(0);
  const previous = (duty - 1 + DUTIES.length) % DUTIES.length;
  const next = (duty + 1) % DUTIES.length;

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
      <View style={styles.topBulb}>
        <Image
          source={require("../../assets/bulblogo.png")}
          style={styles.bulb}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>The Employer Must</Text>

        <View style={styles.divider} />
        <Text style={styles.subheading}>Employer Responsibilities</Text>

        <View
          style={styles.carousel}
          onStartShouldSetResponder={() => true}
          onResponderGrant={({ nativeEvent }) => { swipeX.current = nativeEvent.pageX; }}
          onResponderRelease={({ nativeEvent }) => {
            const distance = nativeEvent.pageX - swipeX.current;
            if (distance > 40) setDuty(previous);
            if (distance < -40) setDuty(next);
          }}
        >
          <TouchableOpacity
            style={[styles.sideCard, { backgroundColor: duty % 2 ? "#D98FA3" : "#C49378" }]}
            onPress={() => setDuty(previous)}
          >
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <View style={[styles.dutyCard, { backgroundColor: duty % 2 ? "#C49378" : "#D98FA3" }]}>
            <Text style={styles.dutyText}>{DUTIES[duty]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.sideCard, { backgroundColor: duty % 2 ? "#D98FA3" : "#C49378" }]}
            onPress={() => setDuty(next)}
          >
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dots}>
          {DUTIES.map((_, index) => (
            <View key={index} style={[styles.dot, index === duty && styles.dotActive]} />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.replace("/(drawer)/legal-intro")}
      >
        <Text style={styles.backBtnText}>{"< Back"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBulb: { paddingHorizontal: 24, paddingTop: 16, alignItems: "flex-start" },
  bulb: { width: 36, height: 36, opacity: 0.6 },
  scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 16 },
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 40,
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 20 },
  subheading: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    textAlign: "center",
    marginBottom: 16,
  },
  carousel: { flexDirection: "row", alignItems: "center", gap: 8 },
  sideCard: {
    width: 48,
    height: 150,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dutyCard: {
    flex: 1,
    minHeight: 190,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dutyText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 17,
    color: C.burgundy,
    lineHeight: 25,
    textAlign: "center",
  },
  arrow: { fontSize: 36, color: C.white, lineHeight: 38 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.divider },
  dotActive: { width: 16, backgroundColor: C.burgundy },
  backBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 28,
    marginBottom: 16,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  backBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.white,
    letterSpacing: 0.5,
  },
});
