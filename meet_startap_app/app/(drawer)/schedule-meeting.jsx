/*
    schedule-meeting.jsx — pick a date to meet a therapist.
    shows current month only as a calendar grid.
    6-8 random sessions per month, each with therapist name, start/end time.
    days with sessions are visually marked. tapping opens a session card modal.
    fonts: Otomanopee One + Ledger
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const C = {
  bg:         "#f5f0e0",
  burgundy:   "#7a2035",
  calendarBg: "#c07a8a",
  cellBorder: "#b06878",
  text:       "#3a2020",
  muted:      "#9a8070",
  white:      "#ffffff",
  todayBg:    "#7a2035",
  sessionDot: "#f5d0d8",
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// ── generate session data once per month ─────────────────────
const SESSION_HOURS = [9, 10, 11, 13, 14, 15, 16];

const generateSessions = (year, month, daysInMonth) => {
  // pick 6-8 unique random days
  const count = 6 + Math.floor(Math.random() * 3); // 6,7,8
  const days = new Set();
  while (days.size < count) {
    days.add(1 + Math.floor(Math.random() * daysInMonth));
  }

  const sessions = {};
  days.forEach((day) => {
    const hour = SESSION_HOURS[Math.floor(Math.random() * SESSION_HOURS.length)];
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end   = `${String(hour + 1).padStart(2, "0")}:00`;
    sessions[day] = { name: "Jane", start, end };
  });
  return sessions;
};

const getMonthData = () => {
  const now        = new Date();
  const year       = now.getFullYear();
  const month      = now.getMonth();
  const monthName  = now.toLocaleString("default", { month: "long" });
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today      = now.getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return { monthName, year, month, cells, today, daysInMonth };
};

export default function ScheduleMeetingScreen() {
  const router = useRouter();
  const { monthName, year, month, cells, today, daysInMonth } = getMonthData();

  // generate sessions once, stable for this render
  const sessions = useMemo(
    () => generateSessions(year, month, daysInMonth),
    [year, month, daysInMonth]
  );

  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleDayPress = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setModalVisible(true);
  };

  const session = selectedDay ? sessions[selectedDay] : null;

  // chunk into rows of 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>

        

        {/* ── TITLE ── */}
        <Text style={styles.title}>Schedule A Meeting</Text>
        <Text style={styles.subtitle}>Choose A Date:</Text>
        <Text style={styles.monthLabel}>{monthName} {year}</Text>

        {/* ── CALENDAR ── */}
        <View style={styles.calendar}>

          {/* day headers */}
          <View style={styles.calRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.calCell}>
                <Text style={styles.dayHeader}>{d}</Text>
              </View>
            ))}
          </View>

          {/* date rows */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.calRow}>
              {row.map((day, di) => {
                const isToday   = day === today;
                const hasSession = day && !!sessions[day];
                return (
                  <TouchableOpacity
                    key={di}
                    style={[
                      styles.calCell,
                      styles.dateCell,
                      isToday && styles.todayCell,
                    ]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={day ? 0.7 : 1}
                  >
                    {day ? (
                      <>
                        <Text style={[styles.dateText, isToday && styles.todayText]}>
                          {day}
                        </Text>
                        {hasSession && (
                          <View style={styles.sessionDot} />
                        )}
                      </>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

        </View>

        {/* ── LEGEND ── */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>session available</Text>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/(drawer)/emotional-help")}>
          <Text style={styles.backLinkText}>{"< Back"}</Text>
        </TouchableOpacity>

      </View>

      {/* ── MODAL ── */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* date heading */}
            <Text style={styles.modalDate}>
              {selectedDay} {monthName} {year}
            </Text>

            {session ? (
              <>
                {/* session card */}
                <View style={styles.sessionCard}>

                  {/* avatar + name */}
                  <View style={styles.sessionHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <View>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <Text style={styles.sessionRole}>Therapist</Text>
                    </View>
                  </View>

                  {/* divider */}
                  <View style={styles.sessionDivider} />

                  {/* time */}
                  <View style={styles.sessionTimeRow}>
                    <Text style={styles.sessionTimeLabel}>🕐  Time</Text>
                    <Text style={styles.sessionTime}>
                      {session.start} – {session.end}
                    </Text>
                  </View>

                  {/* duration */}
                  <View style={styles.sessionTimeRow}>
                    <Text style={styles.sessionTimeLabel}>⏱  Duration</Text>
                    <Text style={styles.sessionTime}>1 hour</Text>
                  </View>

                  {/* join button */}
                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() =>
                      Alert.alert(
                        "Joining Meeting",
                        `Meeting with ${session.name} at ${session.start} — link coming soon.`
                      )
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.joinBtnText}>🎥  Join Meeting</Text>
                  </TouchableOpacity>

                </View>
              </>
            ) : (
              <View style={styles.noSession}>
                <Text style={styles.noSessionEmoji}>📭</Text>
                <Text style={styles.noSessionText}>No session on this day.</Text>
              </View>
            )}

            {/* close */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: "7%" },

  topBulb: { paddingTop: "4%", alignItems: "flex-start" },
  bulb: { width: "8%", aspectRatio: 1, opacity: 0.5 },

  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 30, color: C.burgundy,
    marginTop: "4%", marginBottom: "1%",
  },
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15, color: C.burgundy, opacity: 0.8, marginBottom: "3%",
  },
  monthLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13, color: C.muted,
    textAlign: "center", marginBottom: "2%", fontStyle: "italic",
  },

  // ── calendar ──
  calendar: {
    backgroundColor: C.calendarBg,
    borderRadius: 18, overflow: "hidden", paddingBottom: "2%",
  },
  calRow: { flexDirection: "row" },
  calCell: {
    flex: 1, aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: C.cellBorder,
  },
  dateCell: {},
  todayCell: { backgroundColor: C.todayBg },
  dayHeader: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13, color: C.white, fontWeight: "700", opacity: 0.9,
  },
  dateText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, color: C.white, opacity: 0.9,
  },
  todayText: { color: C.white, fontWeight: "700", opacity: 1 },
  sessionDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: C.sessionDot,
    marginTop: 2,
  },

  // ── legend ──
  legend: {
    flexDirection: "row", alignItems: "center",
    marginTop: "4%", gap: 8,
  },
  legendDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.calendarBg,
    borderWidth: 1.5, borderColor: C.burgundy,
  },
  legendText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12, color: C.muted, fontStyle: "italic",
  },

  // ── modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58,32,32,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8%",
  },
  modalContent: {
    width: "100%",
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: "7%",
    borderTopWidth: 4,
    borderTopColor: C.burgundy,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalDate: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 20, color: C.burgundy,
    textAlign: "center", marginBottom: "5%",
  },

  // ── session card ──
  sessionCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: "5%",
    marginBottom: "5%",
    shadowColor: C.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: "4%",
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#f5ede6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: C.calendarBg,
  },
  avatarText: { fontSize: 22 },
  sessionName: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 18, color: C.text,
  },
  sessionRole: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12, color: C.muted, fontStyle: "italic",
  },
  sessionDivider: {
    height: 1, backgroundColor: "#f0e8df", marginBottom: "4%",
  },
  sessionTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3%",
  },
  sessionTimeLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13, color: C.muted,
  },
  sessionTime: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, color: C.text, fontWeight: "700",
  },
  joinBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 12,
    paddingVertical: "4%",
    alignItems: "center",
    marginTop: "3%",
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  joinBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16, color: C.white, letterSpacing: 0.3,
  },

  // ── no session ──
  noSession: {
    alignItems: "center", paddingVertical: "8%",
  },
  noSessionEmoji: { fontSize: 36, marginBottom: 10 },
  noSessionText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, color: C.muted, fontStyle: "italic",
  },

  // ── close button ──
  closeBtn: {
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: "4%",
    alignItems: "center",
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  closeBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 17, color: C.white, letterSpacing: 0.5,
  },
  backLink: { backgroundColor: C.burgundy, borderRadius: 40, paddingVertical: 18, alignItems: "center", shadowColor: C.burgundy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  backLinkText: { fontFamily: "Ledger_400Regular", fontSize: 20, color: C.white, letterSpacing: 0.5 },
});
