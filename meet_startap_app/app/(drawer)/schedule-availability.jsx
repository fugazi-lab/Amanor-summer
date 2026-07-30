/*
    schedule-availability.jsx — therapist "Choose Available Dates" screen.
    Tapping a date opens an hour picker; every slot is a fixed 1-hour meeting.
    Selected dates show a soft pink circle; today shows a solid burgundy circle.
    fonts: Otomanopee One + Ledger
*/

import { Ionicons } from "@expo/vector-icons";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

const C = {
  bg:         "#f5f0e0",
  burgundy:   "#7a2035",
  text:       "#3a2020",
  muted:      "#9a8070",
  faint:      "#c9b8a8",
  selected:   "#f2d9d9",
  white:      "#ffffff",
  overlay:    "rgba(58, 32, 32, 0.35)",
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// 1-hour meeting start slots, 9am through 4pm (last slot ends at 5pm)
const HOUR_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

const dateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// builds a flat array of calendar cells (padding + real days) for the given month
function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // padding from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  // padding from next month to complete the last week
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, inMonth: false });
  }
  return cells;
}

export default function ScheduleAvailabilityScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // clamp scaling width to a phone-like max so proportions stay consistent
  // on wide viewports (pc / tablet / web) instead of ballooning with them
  const layoutWidth = Math.min(width, 480);
  const wp = (p) => (layoutWidth * p) / 100;
  const hp = (p) => (height * p) / 100;

  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [availability, setAvailability] = useState({}); // { "YYYY-MM-DD": "10:00 AM" }
  const [modalKey, setModalKey] = useState(null); // date key currently being edited, or null

  const [fontsLoaded] = useFonts({
    OtomanopeeOne_400Regular,
    Ledger_400Regular,
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isPastDate = (d) => {
    const cellDate = new Date(year, month, d);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < t;
  };

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const openDay = (d) => {
    if (isPastDate(d)) return;
    setModalKey(dateKey(year, month, d));
  };

  const pickHour = (hour) => {
    setAvailability((prev) => ({ ...prev, [modalKey]: hour }));
    setModalKey(null);
  };

  const removeDay = () => {
    setAvailability((prev) => {
      const next = { ...prev };
      delete next[modalKey];
      return next;
    });
    setModalKey(null);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={C.burgundy} />
      </SafeAreaView>
    );
  }

  const modalDay = modalKey ? Number(modalKey.split("-")[2]) : null;
  const modalMonthLabel = modalKey ? MONTH_NAMES[Number(modalKey.split("-")[1]) - 1] : "";
  const currentHourForModal = modalKey ? availability[modalKey] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── BACK ── */}
      <TouchableOpacity
        style={{ position: "absolute", top: hp(2), left: wp(5), zIndex: 10 }}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={wp(6)} color={C.burgundy} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          width: "100%",
          maxWidth: 480,
          alignSelf: "center",
          paddingHorizontal: wp(6),
          paddingTop: hp(2),
          paddingBottom: hp(4),
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── LOGO ── */}
        <View style={{ alignItems: "center", marginTop: hp(3) }}>
          <Image
            source={require("../../assets/bulblogo.png")}
            style={{ width: wp(14), height: wp(14) }}
            resizeMode="contain"
          />
        </View>

        {/* ── DIVIDER ── */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(2), marginBottom: hp(2.5) }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.burgundy, opacity: 0.3 }} />
          <View
            style={{
              width: wp(2),
              height: wp(2),
              backgroundColor: C.burgundy,
              opacity: 0.6,
              marginHorizontal: wp(2.5),
              transform: [{ rotate: "45deg" }],
            }}
          />
          <View style={{ flex: 1, height: 1, backgroundColor: C.burgundy, opacity: 0.3 }} />
        </View>

        {/* ── TITLE ── */}
        <Text
          style={{
            fontFamily: "OtomanopeeOne_400Regular",
            fontSize: wp(6.5),
            color: C.burgundy,
            textAlign: "center",
            marginBottom: hp(2.5),
          }}
        >
          Choose Available Dates
        </Text>

        {/* ── MONTH NAV ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: hp(2) }}>
          <TouchableOpacity onPress={goPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={wp(5.5)} color={C.burgundy} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "OtomanopeeOne_400Regular",
              fontSize: wp(5.5),
              color: C.text,
              marginHorizontal: wp(5),
              minWidth: wp(32),
              textAlign: "center",
            }}
          >
            {MONTH_NAMES[month]}
          </Text>
          <TouchableOpacity onPress={goNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={wp(5.5)} color={C.burgundy} />
          </TouchableOpacity>
        </View>

        {/* ── WEEKDAY HEADER ── */}
        <View style={{ flexDirection: "row" }}>
          {WEEKDAYS.map((w, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, alignItems: "center", marginBottom: hp(1.2) }}>
              <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted }}>{w}</Text>
            </View>
          ))}
        </View>

        {/* ── CALENDAR GRID ── */}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {grid.map((cell, i) => {
            const key = cell.inMonth ? dateKey(year, month, cell.day) : null;
            const selected = cell.inMonth && !!availability[key];
            const today_ = cell.inMonth && isToday(cell.day);
            const past = cell.inMonth && isPastDate(cell.day);

            let circleBg = "transparent";
            let textColor = cell.inMonth ? C.text : C.faint;
            if (past && cell.inMonth) textColor = C.faint;
            if (selected && !today_) circleBg = C.selected;
            if (today_) { circleBg = C.burgundy; textColor = C.white; }

            return (
              <TouchableOpacity
                key={i}
                disabled={!cell.inMonth || past}
                onPress={() => cell.inMonth && openDay(cell.day)}
                style={{
                  width: `${100 / 7}%`,
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: hp(0.6),
                }}
              >
                <View
                  style={{
                    width: wp(9.5),
                    height: wp(9.5),
                    borderRadius: wp(4.75),
                    backgroundColor: circleBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.8), color: textColor }}>
                    {cell.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ── HOUR PICKER MODAL ── */}
      <Modal visible={!!modalKey} transparent animationType="slide" onRequestClose={() => setModalKey(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: C.overlay, justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setModalKey(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={{
                width: "100%",
                maxWidth: 480,
                alignSelf: "center",
                backgroundColor: C.bg,
                borderTopLeftRadius: wp(6),
                borderTopRightRadius: wp(6),
                paddingHorizontal: wp(6),
                paddingTop: hp(2.5),
                paddingBottom: hp(4),
              }}
            >
              <Text
                style={{
                  fontFamily: "OtomanopeeOne_400Regular",
                  fontSize: wp(5),
                  color: C.burgundy,
                  textAlign: "center",
                  marginBottom: hp(0.5),
                }}
              >
                {modalMonthLabel} {modalDay}
              </Text>
              <Text
                style={{
                  fontFamily: "Ledger_400Regular",
                  fontSize: wp(3.4),
                  color: C.muted,
                  textAlign: "center",
                  marginBottom: hp(2.5),
                }}
              >
                Choose a 1-hour meeting slot
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {HOUR_SLOTS.map((hour) => {
                  const active = currentHourForModal === hour;
                  return (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => pickHour(hour)}
                      style={{
                        width: "48%",
                        borderRadius: wp(5),
                        paddingVertical: hp(1.6),
                        alignItems: "center",
                        marginBottom: hp(1.4),
                        backgroundColor: active ? C.burgundy : C.selected,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Ledger_400Regular",
                          fontSize: wp(3.8),
                          color: active ? C.white : C.burgundy,
                        }}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {currentHourForModal && (
                <TouchableOpacity
                  onPress={removeDay}
                  style={{ alignItems: "center", marginTop: hp(1) }}
                >
                  <Text style={{ fontFamily: "Ledger_400Regular", fontSize: wp(3.6), color: C.muted }}>
                    Remove availability for this day
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}