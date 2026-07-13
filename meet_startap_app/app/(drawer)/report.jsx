/*
    report.jsx — choose how to report, then pick recordings.
*/

import { useRouter } from "expo-router";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  brown:    "#6B4F3A",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const ArrowIcon = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={{ width: 18, height: 2, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 1 }} />
    <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 7, borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "rgba(255,255,255,0.7)", marginLeft: -1 }} />
  </View>
);

export default function ReportScreen() {
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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* bulb */}
      <View style={styles.topBulb}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} resizeMode="contain" />
      </View>

      <View style={styles.body}>

        <Text style={styles.title}>Report Incident</Text>
        <Text style={styles.subtitle}>Report Workplace Harassment Safely</Text>

        {/* Report Anonymously */}
        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: C.burgundy }]}
          onPress={() => router.push({ pathname: "/(drawer)/report-pick", params: { mode: "anonymous" } })}
          activeOpacity={0.85}
        >
          <Text style={styles.optionText}>Report Anonymously</Text>
          <ArrowIcon />
        </TouchableOpacity>

        <View style={styles.descBox}>
          <Text style={styles.descText}>* Report safely without revealing your identity</Text>
          <Text style={styles.descText}>* Can be revealed later</Text>
        </View>

        {/* Report With Name */}
        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: C.brown }]}
          onPress={() => router.push({ pathname: "/(drawer)/report-pick", params: { mode: "named" } })}
          activeOpacity={0.85}
        >
          <Text style={styles.optionText}>Report With Name</Text>
          <ArrowIcon />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBulb: { paddingHorizontal: 24, paddingTop: 16, alignItems: "flex-start" },
  bulb: { width: 36, height: 36, opacity: 0.6 },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 34, color: C.burgundy, marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 21,
  },
  optionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 16, paddingVertical: 20, paddingHorizontal: 22,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 6, elevation: 4,
  },
  optionText: {
    fontFamily: "Ledger_400Regular",
    color: C.white, fontSize: 17, letterSpacing: 0.2,
  },
  descBox: { marginVertical: 16, paddingHorizontal: 4, gap: 3 },
  descText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12.5, color: C.muted, lineHeight: 19,
  },
});