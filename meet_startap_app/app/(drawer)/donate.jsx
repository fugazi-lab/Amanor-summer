/*
    donate.jsx — styled to match the AmanOr design.
    fonts: Otomanopee One (title) + Ledger (body)
    run first: npx expo install @expo-google-fonts/otomanopee-one @expo-google-fonts/ledger expo-font
*/

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useFonts } from "expo-font";
import {
  OtomanopeeOne_400Regular,
} from "@expo-google-fonts/otomanopee-one";
import {
  Ledger_400Regular,
} from "@expo-google-fonts/ledger";

const C = {
  bg:       "#f5f0e0",   // warm cream — matches screenshot
  burgundy: "#7a2035",   // deep burgundy for title + button
  text:     "#3a2020",   // dark warm brown for body
  muted:    "#9a8070",   // muted for placeholders
  border:   "#9a8070",   // underline colour
  white:    "#ffffff",
};

export default function DonateScreen() {
  const [amount, setAmount]   = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  const handleDonate = () => {
    if (!amount.trim() || !payment.trim()) {
      Alert.alert("Missing info", "Please fill in both the amount and payment details.");
      return;
    }
    setLoading(true);
    // placeholder — wire up real payment here
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Thank you 💛", "Your donation means the world.");
      setAmount("");
      setPayment("");
    }, 1200);
  };

  // show nothing until fonts are ready
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── LOGO ── */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/bulblogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* ── TITLE ── */}
          <Text style={styles.title}>Donate</Text>

          {/* ── SUBTITLE ── */}
          <Text style={styles.subtitle}>
            Help Empower And Support Other Women
          </Text>

          {/* ── SPACER ── */}
          <View style={{ height: 48 }} />

          {/* ── AMOUNT INPUT ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Enter the donation amount:"
              placeholderTextColor={C.muted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* ── SPACER ── */}
          <View style={{ height: 40 }} />

          {/* ── PAYMENT INPUT ── */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Payment Details:"
              placeholderTextColor={C.muted}
              value={payment}
              onChangeText={setPayment}
            />
          </View>

          {/* ── SPACER pushes button to bottom ── */}
          <View style={{ flex: 1, minHeight: 80 }} />

          {/* ── DONATE BUTTON ── */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleDonate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.buttonText}>Donate</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // logo — top left, small
  logoWrap: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: {
    width: 48,
    height: 48,
  },

  // title
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 52,
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },

  // subtitle
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // underline inputs
  inputWrap: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  input: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
    color: C.text,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },

  // donate button
  button: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 16,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.white,
    letterSpacing: 1,
  },
});