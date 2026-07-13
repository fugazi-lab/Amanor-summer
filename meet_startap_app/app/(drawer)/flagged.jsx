/*
    flagged.jsx — companies with recordings or reports filed against them.
    reads from both `files` collection (media uploads) and `reports` collection.
*/

import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

import { Client as NativeClient, Databases as NativeDatabases, Query as NativeQuery } from "react-native-appwrite";
import { Client as WebClient, Databases as WebDatabases, Query as WebQuery } from "appwrite";

const CFG = {
  endpoint:     "https://cloud.appwrite.io/v1",
  projectId:    "69af49d80022d666076a",
  dbId:         "69b0806500366fecf954",
  filesColId:   "files",
  reportsColId: "reports",
};

let db, Query;
if (Platform.OS === "web") {
  const wc = new WebClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId);
  db = new WebDatabases(wc); Query = WebQuery;
} else {
  const nc = new NativeClient().setEndpoint(CFG.endpoint).setProject(CFG.projectId).setPlatform("com.meetstartap.app");
  db = new NativeDatabases(nc); Query = NativeQuery;
}

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const getErrMsg = (err) => err?.message || JSON.stringify(err) || "Unknown error.";

const fetchAll = async (colId) => {
  let all = [], offset = 0;
  while (true) {
    const res = await db.listDocuments(CFG.dbId, colId, [Query.limit(100), Query.offset(offset)]);
    all = all.concat(res.documents);
    if (all.length >= res.total || res.documents.length < 100) break;
    offset += 100;
  }
  return all;
};

export default function FlaggedScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalReports, setTotalReports] = useState(0);

  const [fontsLoaded] = useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });

  const fetchCompanies = async () => {
    try {
      // fetch from both collections in parallel
      const [fileDocs, reportDocs] = await Promise.all([
        fetchAll(CFG.filesColId).catch(() => []),
        fetchAll(CFG.reportsColId).catch(() => []),
      ]);

      const map = {};

      // count from files (media uploads with a company)
      for (const doc of fileDocs) {
        const c = doc.company?.trim();
        if (!c) continue;
        if (!map[c]) map[c] = { recordings: 0, reports: 0 };
        map[c].recordings += 1;
      }

      // count from reports
      for (const doc of reportDocs) {
        const c = doc.company?.trim();
        if (!c) continue;
        if (!map[c]) map[c] = { recordings: 0, reports: 0 };
        map[c].reports += 1;
      }

      const sorted = Object.entries(map)
        .map(([name, counts]) => ({
          name,
          recordings: counts.recordings,
          reports: counts.reports,
          total: counts.recordings + counts.reports,
        }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

      setCompanies(sorted);
      setTotalReports(reportDocs.length + fileDocs.filter(d => d.company?.trim()).length);
    } catch (err) {
      console.error("Flagged fetch error:", getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchCompanies(); }, []);

  if (!fontsLoaded) return <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={C.burgundy} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.root}>

      {/* ── BULB ── */}
      <View style={styles.topBulb}>
        <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.burgundy} />}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>Flagged Workplaces 🚩</Text>
        <Text style={styles.subtitle}>companies with recordings or reports filed against them.</Text>

        <View style={styles.divider} />

        {loading ? (
          <ActivityIndicator size="large" color={C.burgundy} style={{ marginTop: 32 }} />
        ) : companies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>no companies flagged yet.</Text>
          </View>
        ) : (
          <>
            {/* summary */}
            <View style={styles.summaryStrip}>
              <Text style={styles.summaryText}>
                {companies.length} {companies.length === 1 ? "company" : "companies"} flagged
                {"  ·  "}
                {totalReports} {totalReports === 1 ? "entry" : "entries"} total
              </Text>
            </View>

            {companies.map((item, index) => (
              <View key={item.name} style={styles.companyCard}>

                {/* rank badge */}
                <View style={[styles.rankBadge, index === 0 && styles.rankBadgeTop]}>
                  <Text style={[styles.rankText, index === 0 && styles.rankTextTop]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* info */}
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{item.name}</Text>
                  <Text style={styles.companyMeta}>
                    {item.reports > 0 && `${item.reports} report${item.reports > 1 ? "s" : ""}`}
                    {item.reports > 0 && item.recordings > 0 && "  ·  "}
                    {item.recordings > 0 && `${item.recordings} recording${item.recordings > 1 ? "s" : ""}`}
                  </Text>
                </View>

                {/* total pill */}
                <View style={[styles.countPill, item.total >= 3 && styles.countPillHigh]}>
                  <Text style={[styles.countPillText, item.total >= 3 && styles.countPillTextHigh]}>
                    {item.total}
                  </Text>
                </View>

              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBulb: { paddingHorizontal: 24, paddingTop: 16, alignItems: "flex-start" },
  bulb: { width: 36, height: 36, opacity: 0.6 },
  scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 48 },

  title: { fontFamily: "OtomanopeeOne_400Regular", fontSize: 30, color: C.burgundy, marginBottom: 8 },
  subtitle: { fontFamily: "Ledger_400Regular", fontSize: 13, color: C.muted, fontStyle: "italic", marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.divider, marginBottom: 20 },

  emptyState: { alignItems: "center", marginTop: 48 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: "Ledger_400Regular", fontSize: 14, color: C.muted, fontStyle: "italic" },

  summaryStrip: {
    backgroundColor: "#fff8f0", borderRadius: 10, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: "#f0e0d0",
  },
  summaryText: { fontFamily: "Ledger_400Regular", fontSize: 13, color: C.text, fontWeight: "600", textAlign: "center" },

  companyCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: C.burgundy,
    shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },

  rankBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#f5ede6", alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  rankBadgeTop: { backgroundColor: C.burgundy },
  rankText: { fontFamily: "Ledger_400Regular", fontSize: 12, fontWeight: "700", color: C.muted },
  rankTextTop: { color: C.white },

  companyInfo: { flex: 1 },
  companyName: { fontFamily: "OtomanopeeOne_400Regular", fontSize: 15, color: C.text, marginBottom: 3 },
  companyMeta: { fontFamily: "Ledger_400Regular", fontSize: 12, color: C.muted, fontStyle: "italic" },

  countPill: {
    minWidth: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f5ede6", alignItems: "center", justifyContent: "center", paddingHorizontal: 10, marginLeft: 8,
  },
  countPillHigh: { backgroundColor: C.burgundy },
  countPillText: { fontFamily: "Ledger_400Regular", fontSize: 14, fontWeight: "900", color: C.muted },
  countPillTextHigh: { color: C.white },
});