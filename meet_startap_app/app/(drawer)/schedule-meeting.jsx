/*
    schedule-meeting.jsx — pick a date to meet a therapist.
    shows current month only as a calendar grid.
    Styled accurately to match the provided layout.
    Features percentage-based scaling and vector icons replacing all emojis.
    Updated to center elements vertically and maintain top/bottom proportionality.
*/

import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = {
  bg:         "#FAF5EB",
  burgundy:   "#902A3C",
  text:       "#5E4B4B",
  muted:      "#9A8070",
  white:      "#FFFFFF",
  divider:    "#D9C7B6",
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const SESSION_HOURS = [9, 10, 11, 13, 14, 15, 16];

const generateSessions = (year, month, daysInMonth) => {
  const count = 6 + Math.floor(Math.random() * 3);
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

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>

        {/* ── TITLE & DIVIDER ── */}
        <Text style={styles.title}>Schedule A Meeting</Text>
        
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={20} color={C.burgundy} style={styles.dividerIcon} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.subtitle}>Choose A Date:</Text>

        {/* ── CALENDAR ── */}
        <View style={styles.calendarCard}>
          
          {/* header */}
          <View style={styles.calHeader}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="chevron-back" size={24} color={C.burgundy} />
            </TouchableOpacity>
            <Text style={styles.monthName}>{monthName}</Text>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="chevron-forward" size={24} color={C.burgundy} />
            </TouchableOpacity>
          </View>

          {/* day labels */}
          <View style={styles.calRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.calCellWrapper}>
                <Text style={styles.dayHeader}>{d}</Text>
              </View>
            ))}
          </View>

          {/* date grid */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.calRow}>
              {row.map((day, di) => {
                const isToday = day === today;
                return (
                  <TouchableOpacity
                    key={di}
                    style={styles.calCellWrapper}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={day ? 0.7 : 1}
                  >
                    <View style={[styles.dateCell, isToday && styles.todayCell]}>
                      {day ? (
                        <Text style={[styles.dateText, isToday && styles.todayText]}>
                          {day}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── BACK BUTTON ── */}
        <View style={styles.backBtnWrapper}>
            <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/(drawer)/emotional-help")}>
            <Text style={styles.backLinkText}>{"< Back"}</Text>
            </TouchableOpacity>
        </View>

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

            <Text style={styles.modalDate}>
              {selectedDay} {monthName} {year}
            </Text>

            {session ? (
              <View style={styles.sessionCard}>
                
                <View style={styles.sessionHeader}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color={C.burgundy} />
                  </View>
                  <View style={styles.sessionHeaderText}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionRole}>Therapist</Text>
                  </View>
                </View>

                <View style={styles.sessionDivider} />

                <View style={styles.sessionTimeRow}>
                  <View style={styles.sessionLabelIconGroup}>
                    <Ionicons name="time-outline" size={16} color={C.muted} />
                    <Text style={styles.sessionTimeLabel}>Time</Text>
                  </View>
                  <Text style={styles.sessionTime}>
                    {session.start} – {session.end}
                  </Text>
                </View>

                <View style={styles.sessionTimeRow}>
                  <View style={styles.sessionLabelIconGroup}>
                    <Ionicons name="hourglass-outline" size={16} color={C.muted} />
                    <Text style={styles.sessionTimeLabel}>Duration</Text>
                  </View>
                  <Text style={styles.sessionTime}>1 hour</Text>
                </View>

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
                  <Ionicons name="videocam-outline" size={20} color={C.white} />
                  <Text style={styles.joinBtnText}>Join Meeting</Text>
                </TouchableOpacity>

              </View>
            ) : (
              <View style={styles.noSession}>
                <Ionicons name="calendar-clear-outline" size={40} color={C.muted} style={styles.noSessionIcon} />
                <Text style={styles.noSessionText}>No session on this day.</Text>
              </View>
            )}

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
  root: { 
    flex: 1, 
    backgroundColor: C.bg 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: "8%",
    justifyContent: "center", // This centers the entire block vertically
    paddingVertical: "5%",
  },

  title: {
    fontFamily: "Ledger_400Regular",
    fontSize: 32, 
    color: C.burgundy,
    textAlign: "center",
  },
  
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: "4%",
    marginBottom: "4%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.divider,
  },
  dividerIcon: {
    paddingHorizontal: "3%",
  },

  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 18, 
    color: C.text, 
    marginBottom: "4%",
    fontWeight: "600",
  },

  // ── calendar ──
  calendarCard: {
    width: "100%",
    backgroundColor: C.bg,
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: C.burgundy,
    paddingVertical: "6%",
    paddingHorizontal: "4%",
  },
  calHeader: { 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: "4%",
    marginBottom: "6%",
  },
  monthName: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.burgundy,
  },

  calRow: { 
    flexDirection: "row",
    width: "100%",
    paddingVertical: "1.5%",
  },
  calCellWrapper: {
    width: "14.28%", 
    alignItems: "center", 
    justifyContent: "center",
  },
  dayHeader: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, 
    color: C.text, 
  },
  
  dateCell: {
    width: "75%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999, 
  },
  todayCell: { 
    backgroundColor: C.burgundy,
  },
  dateText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16, 
    color: C.text, 
  },
  todayText: { 
    color: C.white, 
  },

  // ── back button ──
  backBtnWrapper: {
    width: "100%",
    marginTop: "6%", // Converted from paddingTop to marginTop to flow with the layout properly
    alignItems: "center",
  },
  backLink: { 
    width: "100%",
    backgroundColor: C.burgundy, 
    borderRadius: 16, 
    paddingVertical: "4.5%", 
    alignItems: "center", 
    justifyContent: "center",
  },
  backLinkText: { 
    fontFamily: "Ledger_400Regular", 
    fontSize: 20, 
    color: C.white, 
    letterSpacing: 0.5 
  },

  // ── modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(94, 75, 75, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8%",
  },
  modalContent: {
    width: "100%",
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: "8%",
    borderTopWidth: 4,
    borderTopColor: C.burgundy,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalDate: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22, 
    color: C.burgundy,
    textAlign: "center", 
    marginBottom: "6%",
  },

  // ── session card ──
  sessionCard: {
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: "6%",
    marginBottom: "6%",
    shadowColor: C.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: "5%",
  },
  avatar: {
    width: 46, 
    height: 46, 
    borderRadius: 23,
    backgroundColor: "#F4EDE6",
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1, 
    borderColor: C.divider,
  },
  sessionHeaderText: {
    paddingLeft: "4%",
  },
  sessionName: {
    fontFamily: "Ledger_400Regular",
    fontSize: 18, 
    color: C.text,
  },
  sessionRole: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13, 
    color: C.muted, 
    fontStyle: "italic",
  },
  sessionDivider: {
    width: "100%",
    height: 1, 
    backgroundColor: "#F0E8DF", 
    marginBottom: "5%",
  },
  sessionTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4%",
  },
  sessionLabelIconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionTimeLabel: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14, 
    color: C.muted,
    paddingLeft: "2%",
  },
  sessionTime: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15, 
    color: C.text, 
    fontWeight: "700",
  },
  joinBtn: {
    width: "100%",
    backgroundColor: C.burgundy,
    borderRadius: 12,
    paddingVertical: "4.5%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "4%",
  },
  joinBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16, 
    color: C.white, 
    letterSpacing: 0.3,
    paddingLeft: "2%",
  },

  // ── no session ──
  noSession: {
    alignItems: "center", 
    paddingVertical: "10%",
  },
  noSessionIcon: { 
    marginBottom: "3%",
  },
  noSessionText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15, 
    color: C.muted, 
    fontStyle: "italic",
  },

  // ── close button ──
  closeBtn: {
    width: "100%",
    backgroundColor: C.burgundy,
    borderRadius: 40,
    paddingVertical: "4.5%",
    alignItems: "center",
  },
  closeBtnText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 17, 
    color: C.white, 
    letterSpacing: 0.5,
  },
});