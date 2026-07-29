/*
  therapist-home.jsx — the therapist workspace.
  Combines the visual language of the main user homepage with the three
  therapist actions from the original AmanOr mockup.
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#F5F0E4",
  text: "#2C1810",
  muted: "#6B5B4E",
  rose: "#7A2035",
  roseSoft: "#D98FA3",
  roseCircle: "#E8BAC5",
  tan: "#C49378",
  tanSoft: "#E8D8C8",
  brown: "#6B4F3A",
  white: "#FFFFFF",
  navBg: "#EDE8DC",
  divider: "#C4B8A8",
};

const ActionCard = ({ icon, title, description, buttonLabel, tone, onPress }) => (
  <View style={[styles.actionCard, { backgroundColor: tone.card }]}>
    <View style={[styles.iconCircle, { backgroundColor: tone.circle }]}>
      <Ionicons name={icon} size={30} color={tone.ink} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionDescription}>{description}</Text>
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: tone.ink }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
    >
      <Text style={styles.actionButtonText}>{buttonLabel}</Text>
      <Ionicons name="arrow-forward" size={17} color={C.white} />
    </TouchableOpacity>
  </View>
);

export default function TherapistHomeScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const therapistName = Array.isArray(username) ? username[0] : username;

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, styles.centered]}>
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
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <View style={styles.brandWrap}>
            <Text style={styles.brandName}>Amanor</Text>
            <Text style={styles.tagline}>Empower women, change worlds.</Text>
          </View>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={openProfile}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Therapist account"
          >
            <Ionicons name="person-outline" size={17} color={C.rose} />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.headline}>
            {therapistName ? `Welcome, ${therapistName}` : "Welcome back"}
          </Text>
          <Text style={styles.subhead}>
            What would you like to do today?
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionCard
            icon="calendar-outline"
            title="Set Availability"
            description="Choose when clients can book you."
            buttonLabel="Add Dates"
            tone={{ card: C.roseSoft, circle: C.roseCircle, ink: C.rose }}
            onPress={() =>
              comingSoon(
                "Set Availability",
                "Your availability calendar will open here."
              )
            }
          />
          <ActionCard
            icon="document-text-outline"
            title="Session Notes"
            description="Keep private notes from your sessions."
            buttonLabel="Write Notes"
            tone={{ card: C.tanSoft, circle: "#F0E3D8", ink: C.brown }}
            onPress={() =>
              comingSoon("Session Notes", "Your secure notes workspace will open here.")
            }
          />
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Next Session</Text>
          <View style={styles.sectionLine} />
        </View>

        <TouchableOpacity
          style={styles.sessionCard}
          onPress={() =>
            comingSoon(
              "No session right now",
              "Your Zoom link will appear here before the next appointment."
            )
          }
          activeOpacity={0.85}
        >
          <View style={styles.sessionIcon}>
            <Ionicons name="videocam-outline" size={24} color={C.rose} />
          </View>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionTitle}>Join Your Zoom Session</Text>
            <Text style={styles.sessionDescription}>Your next meeting will appear here</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={C.rose} />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7}>
          <Ionicons name="home" size={21} color={C.rose} />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() =>
            comingSoon("Availability", "Your availability calendar will open here.")
          }
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={21} color={C.muted} />
          <Text style={styles.navLabel}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => comingSoon("Notes", "Your secure notes workspace will open here.")}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={21} color={C.muted} />
          <Text style={styles.navLabel}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={openProfile} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={21} color={C.muted} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  scrollView: { flex: 1 },
  body: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 34,
    paddingBottom: 108,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  topBarSpacer: { width: 34, height: 34 },
  brandWrap: { flex: 1, alignItems: "center" },
  brandName: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 26,
    color: C.text,
  },
  tagline: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11.5,
    color: C.rose,
    marginTop: 1,
  },
  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: C.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  headline: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 20,
    lineHeight: 27,
    color: C.text,
    textAlign: "center",
  },
  subhead: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    textAlign: "center",
    marginTop: 4,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.divider },
  sectionTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 13,
    color: C.text,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minHeight: 235,
    borderRadius: 20,
    padding: 13,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },
  actionTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 16,
    color: C.text,
    textAlign: "center",
  },
  actionDescription: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    lineHeight: 17,
    color: C.muted,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 11,
  },
  actionButton: {
    minHeight: 43,
    width: "100%",
    borderRadius: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  actionButtonText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.white,
  },
  sessionCard: {
    backgroundColor: C.tanSoft,
    borderRadius: 16,
    minHeight: 84,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EACED3",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionCopy: { flex: 1 },
  sessionTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 14,
    color: C.text,
  },
  sessionDescription: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11.5,
    color: C.muted,
    marginTop: 4,
  },
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 11,
    paddingBottom: 19,
    paddingHorizontal: 8,
  },
  navTab: { flex: 1, alignItems: "center", gap: 4 },
  navLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    color: C.muted,
  },
  activeNavLabel: { color: C.rose },
});
