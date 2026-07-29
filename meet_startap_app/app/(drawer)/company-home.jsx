/*
    company-home.jsx — the page a company account lands on right after
    signing in via auth-company.jsx. Shows a live overview of the reports
    submitted against their company (matched by the free-text "company"
    field on each report, compared case-insensitively to this account's
    login username — that's the only shared identifier the two schemas
    currently have in common).

    Data pulled from Appwrite:
      - Total / Anonymous / Named report counts        → real
      - Top 5 abusers by anonymous-report count         → real
      - 5 most recent named reports (reporter/date/type) → real
      - "Safety Score"                                   → NOT a real metric.
        There's no resolution/outcome field anywhere in the schema to base
        this on, so it's left as a static placeholder rather than a number
        that looks meaningful but isn't. Swap in a real formula once the
        data model supports it (e.g. resolved vs. open reports).
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── always use the appwrite WEB sdk on web, native sdk on native ──
import { Client as WebClient, Databases as WebDatabases, Query as WebQuery } from "appwrite";
import { Client as NativeClient, Databases as NativeDatabases, Query as NativeQuery } from "react-native-appwrite";

const CFG = {
  endpoint:     "https://cloud.appwrite.io/v1",
  projectId:    "69af49d80022d666076a",
  dbId:         "69b0806500366fecf954",
  reportsColId: "reports",
};

let db, Query;
if (Platform.OS === "web") {
  const wc = new WebClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId);
  db = new WebDatabases(wc);
  Query = WebQuery;
} else {
  const nc = new NativeClient()
    .setEndpoint(CFG.endpoint)
    .setProject(CFG.projectId)
    .setPlatform("com.meetstartap.app");
  db = new NativeDatabases(nc);
  Query = NativeQuery;
}

const C = {
  bg: "#F5F0E4",
  text: "#2C1810",
  muted: "#6B5B4E",
  rose: "#7A2035",
  roseSoft: "#F3DDE2",
  roseCircle: "#E8BAC5",
  tan: "#C49378",
  tanSoft: "#F0E3D8",
  brown: "#6B4F3A",
  white: "#FFFFFF",
  divider: "#C4B8A8",
  chipBg: "#FBF6ED",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export default function CompanyHomeScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const companyName = Array.isArray(username) ? username[0] : username;

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    setErrorMsg("");
    try {
      // Appwrite Query.equal is case-sensitive, so pull recent reports
      // and match the company name client-side, case-insensitively.
      const res = await db.listDocuments(
        CFG.dbId,
        CFG.reportsColId,
        [Query.orderDesc("$createdAt"), Query.limit(200)]
      );
      const mine = (res.documents || []).filter(
        (r) => (r.company || "").trim().toLowerCase() === (companyName || "").trim().toLowerCase()
      );
      setReports(mine);
    } catch (err) {
      console.error("Load reports FAILED:", JSON.stringify(err));
      setErrorMsg(err?.message || "Couldn't load your reports right now.");
    }
  }, [companyName]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadReports();
      setLoading(false);
    })();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.root, styles.centered]}>
        <ActivityIndicator color={C.rose} />
      </SafeAreaView>
    );
  }

  // ── derived stats ──────────────────────────────────────────
  const total = reports.length;
  const anonymousReports = reports.filter((r) => r.anonymous);
  const namedReports = reports.filter((r) => !r.anonymous);

  const abuserCounts = {};
  anonymousReports.forEach((r) => {
    const key = (r.abuserName || "Not specified").trim() || "Not specified";
    abuserCounts[key] = (abuserCounts[key] || 0) + 1;
  });
  const topAbusers = Object.entries(abuserCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentNamed = namedReports.slice(0, 5);

  const comingSoon = (title, message) => Alert.alert(title, message);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.rose} />
        }
      >
        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>
          <View style={styles.iconBtn}>
            <Ionicons name="menu" size={24} color={C.text} />
          </View>
          <View style={styles.brandWrap}>
            <View style={styles.brandRow}>
              <Ionicons name="bulb-outline" size={22} color={C.rose} style={{ marginRight: 6 }} />
              <Text style={styles.brandName}>Amanor</Text>
            </View>
            <Text style={styles.tagline}>For Companies</Text>
          </View>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => comingSoon("Company Profile", "Company account settings will open here.")}
            accessibilityLabel="Company profile"
          >
            <Ionicons name="business" size={18} color={C.rose} />
          </TouchableOpacity>
        </View>

        {/* ── HEADLINE ── */}
        <Text style={styles.headline}>Reports Overview</Text>
        <Text style={styles.subhead}>All reports submitted to your company</Text>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={C.rose} />
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
            <TouchableOpacity onPress={loadReports} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── STATS STRIP ── */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: C.roseCircle }]}>
                  <Ionicons name="document-text" size={20} color={C.rose} />
                </View>
                <Text style={styles.statNumber}>{total}</Text>
                <Text style={styles.statLabel}>Total{"\n"}Reports</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: C.roseSoft }]}>
                  <Ionicons name="help-circle" size={20} color={C.rose} />
                </View>
                <Text style={styles.statNumber}>{anonymousReports.length}</Text>
                <Text style={styles.statLabel}>Anonymous{"\n"}Reports</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: C.tanSoft }]}>
                  <Ionicons name="person" size={20} color={C.brown} />
                </View>
                <Text style={styles.statNumber}>{namedReports.length}</Text>
                <Text style={styles.statLabel}>Reports{"\n"}With Name</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: C.roseSoft }]}>
                  <Ionicons name="shield-checkmark" size={20} color={C.rose} />
                </View>
                <Text style={styles.statNumber}>—</Text>
                <Text style={styles.statLabel}>Safety{"\n"}Score</Text>
              </View>
            </View>

            {/* ── TWO COLUMNS ── */}
            <View style={styles.columns}>
              {/* anonymous reports, by abuser */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <View style={[styles.columnIcon, { backgroundColor: C.roseSoft }]}>
                    <Ionicons name="glasses-outline" size={18} color={C.rose} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.columnTitle}>Anonymous Reports</Text>
                    <Text style={styles.columnSubtitle}>
                      Separated by abuser's name{"\n"}ordered by number of incidents
                    </Text>
                  </View>
                </View>

                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderText}>Abuser's Name</Text>
                  <Text style={styles.tableHeaderText}>Incidents</Text>
                </View>

                {topAbusers.length === 0 ? (
                  <Text style={styles.emptyText}>No anonymous reports yet.</Text>
                ) : (
                  topAbusers.map(([name, count], i) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.abuserRow}
                      activeOpacity={0.7}
                      onPress={() => comingSoon(name, `${count} incident(s) reported anonymously.`)}
                    >
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.abuserName} numberOfLines={1}>{name}</Text>
                      <Text style={styles.abuserCount}>{count}</Text>
                      <Ionicons name="chevron-forward" size={16} color={C.muted} />
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => comingSoon("Anonymous Reports", "The full list will open here.")}
                >
                  <Ionicons name="list" size={15} color={C.rose} />
                  <Text style={styles.viewAllText}>View all anonymous reports</Text>
                </TouchableOpacity>
              </View>

              {/* named reports */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <View style={[styles.columnIcon, { backgroundColor: C.tanSoft }]}>
                    <Ionicons name="person-outline" size={18} color={C.brown} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.columnTitle}>Reports With Name</Text>
                    <Text style={styles.columnSubtitle}>
                      Reports submitted{"\n"}with the reporter's identity
                    </Text>
                  </View>
                </View>

                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderText}>Reporter</Text>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={styles.tableHeaderText}>Incident Type</Text>
                </View>

                {recentNamed.length === 0 ? (
                  <Text style={styles.emptyText}>No named reports yet.</Text>
                ) : (
                  recentNamed.map((r) => (
                    <TouchableOpacity
                      key={r.$id}
                      style={styles.namedRow}
                      activeOpacity={0.7}
                      onPress={() => comingSoon(r.name, `${r.incidentType || "Other"} · ${formatDate(r.$createdAt)}`)}
                    >
                      <Text style={styles.namedName} numberOfLines={1}>{r.name}</Text>
                      <Text style={styles.namedDate} numberOfLines={1}>{formatDate(r.$createdAt)}</Text>
                      <Text style={styles.namedType} numberOfLines={2}>{r.incidentType || "Other"}</Text>
                      <Ionicons name="chevron-forward" size={16} color={C.muted} />
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => comingSoon("Reports With Name", "The full list will open here.")}
                >
                  <Ionicons name="person" size={15} color={C.rose} />
                  <Text style={styles.viewAllText}>View all reports with name</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── BANNER ── */}
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <Ionicons name="shield-checkmark" size={22} color={C.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Your commitment to safety matters.</Text>
                <Text style={styles.bannerSubtitle}>Together, we create safer workplaces.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  brandWrap: { flex: 1, alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandName: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 22,
    color: C.text,
  },
  tagline: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.rose,
    marginTop: 1,
  },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.roseCircle,
    alignItems: "center",
    justifyContent: "center",
  },

  headline: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 24,
    color: C.text,
    marginTop: 22,
  },
  subhead: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13.5,
    color: C.muted,
    marginTop: 3,
  },

  errorBox: {
    backgroundColor: C.roseSoft,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13.5,
    color: C.rose,
    textAlign: "center",
  },
  retryBtn: { marginTop: 10 },
  retryText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13.5,
    color: C.rose,
    textDecorationLine: "underline",
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 18,
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 19,
    color: C.text,
  },
  statLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    color: C.muted,
    textAlign: "center",
    marginTop: 3,
    lineHeight: 13,
  },

  columns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  column: {
    flex: 1,
    backgroundColor: C.chipBg,
    borderRadius: 18,
    padding: 12,
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  columnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  columnTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 13,
    color: C.rose,
  },
  columnSubtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 9.5,
    color: C.muted,
    marginTop: 2,
    lineHeight: 12,
  },

  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10,
    color: C.rose,
  },

  emptyText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.muted,
    paddingVertical: 14,
    textAlign: "center",
  },

  abuserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE3D6",
    gap: 6,
  },
  rankBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: { color: C.white, fontSize: 10, fontFamily: "Ledger_400Regular" },
  abuserName: {
    flex: 1,
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.text,
  },
  abuserCount: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 14,
    color: C.rose,
    marginRight: 2,
  },

  namedRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE3D6",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  namedName: {
    flex: 1,
    fontFamily: "Ledger_400Regular",
    fontSize: 11.5,
    color: C.text,
  },
  namedDate: {
    flex: 1,
    fontFamily: "Ledger_400Regular",
    fontSize: 10,
    color: C.muted,
  },
  namedType: {
    flex: 1,
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    color: C.text,
  },

  viewAllBtn: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.rose,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  viewAllText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    color: C.rose,
    flexShrink: 1,
    textAlign: "center",
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.roseSoft,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 13.5,
    color: C.text,
  },
  bannerSubtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11.5,
    color: C.muted,
    marginTop: 2,
  },
});