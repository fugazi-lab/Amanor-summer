/*
    legal.jsx — your rights. styled to match AmanOr design.
    fonts: Otomanopee One + Ledger
*/

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";
import { useEffect, useRef, useState } from "react";
import { askLegalAssistant } from "../../services/legal-ai";

const C = {
  bg:       "#F5F0E4",
  burgundy: "#7a2035",
  text:     "#2C1810",
  muted:    "#6B5B4E",
  divider:  "#C4B8A8",
  white:    "#ffffff",
};

const BULLETS = [
 "Submit a workplace complaint, either orally or in writing. You may also have another person submit it on your behalf.",
"Have your complaint investigated promptly and as privately as possible.",
"Be protected from retaliation or workplace harm, such as dismissal, demotion, reduced hours, or unfair treatment.",
"Be separated from the person you complained about, when appropriate and possible.",
"Receive a reasoned written decision and review the investigation summary and recommendations.",
"File a police complaint, a civil lawsuit, or both, in addition to your workplace complaint.",
"Not be required to prove that you clearly rejected repeated sexual advances or comments when a manager or supervisor abused their authority.",
"Apply for recognition as a work-injury victim if the harassment caused you physical or psychological harm. This may entitle you to medical treatment, injury benefits, or disability benefits.",
"Apply for unemployment benefits without the usual waiting period if you resigned because of workplace sexual harassment, subject to the applicable eligibility requirements."
];

export default function LegalScreen() {
  const router = useRouter();
  const { openChat } = useLocalSearchParams();
  const [rightsOpen, setRightsOpen] = useState(false);
  const [right, setRight] = useState(0);
  const [chatOpen, setChatOpen] = useState(openChat === "true");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I’m Amanor’s legal information assistant. Ask me about workplace rights, reporting options, or legal procedures.",
    },
  ]);
  const swipeX = useRef(0);
  const chatScrollRef = useRef(null);
  const previous = (right - 1 + BULLETS.length) % BULLETS.length;
  const next = (right + 1) % BULLETS.length;
  const sideColor = right % 2 ? "#D98FA3" : "#C49378";

  useEffect(() => {
    if (openChat === "true") {
      setChatOpen(true);
    }
  }, [openChat]);

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

  const sendMessage = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;

    const userMessage = { id: `user-${Date.now()}`, role: "user", text: question };
    setMessages((current) => [...current, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await askLegalAssistant(question);
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", text: response.text },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "error",
          text: error.message || "The assistant could not respond. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    if (openChat === "true") {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.root}>

      {/* ── BULB TOP LEFT ── */}
      <View style={styles.topBulb}>
        <Image
          source={require("../../assets/bulblogo.png")}
          style={styles.bulb}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── TITLE ── */}
        <Text style={styles.title}>Your Rights</Text>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.rightsCard, rightsOpen && styles.rightsCardOpen]}
          activeOpacity={1}
          onPress={() => setRightsOpen(!rightsOpen)}
        >
          {rightsOpen ? (
            <>
              <View style={styles.peel} />
              <Text style={styles.overviewText}>
                Sexual harassment is illegal under Israel&apos;s Prevention of Sexual Harassment Law. The law protects people in workplaces, schools, the military, and public places.
              </Text>
            </>
          ) : (
            <Text style={styles.rightsCardTitle}>What Are Your Rights?</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.holdHint}>Tap to switch</Text>

        <Text style={styles.subheading}>Your Rights</Text>

        <View
          style={styles.carousel}
          onTouchStart={({ nativeEvent }) => { swipeX.current = nativeEvent.pageX; }}
          onTouchEnd={({ nativeEvent }) => {
            const distance = nativeEvent.pageX - swipeX.current;
            if (distance > 40) setRight(previous);
            if (distance < -40) setRight(next);
          }}
        >
          <TouchableOpacity style={[styles.sideCard, { backgroundColor: sideColor }]} onPress={() => setRight(previous)}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <View style={[styles.rightCard, { backgroundColor: right % 2 ? "#C49378" : "#D98FA3" }]}>
            <Text style={styles.rightText}>{BULLETS[right]}</Text>
          </View>
          <TouchableOpacity style={[styles.sideCard, { backgroundColor: sideColor }]} onPress={() => setRight(next)}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dots}>
          {BULLETS.map((_, index) => <View key={index} style={[styles.dot, index === right && styles.dotActive]} />)}
        </View>

      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(drawer)/legal-intro")}>
        <Text style={styles.backBtnText}>{"< Back"}</Text>
      </TouchableOpacity>

      <Modal
        visible={chatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChat}
      >
        <SafeAreaView style={styles.chatRoot}>
          <KeyboardAvoidingView
            style={styles.chatKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderIcon}>
                <Ionicons name="sparkles" size={19} color={C.burgundy} />
              </View>
              <View style={styles.chatHeaderCopy}>
                <Text style={styles.chatTitle}>Legal AI Assistant</Text>
                <Text style={styles.chatStatus}>Powered by Groq · General legal information</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeChat}
                accessibilityRole="button"
                accessibilityLabel="Close chat"
              >
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={17} color={C.burgundy} />
              <Text style={styles.disclaimerText}>
                AI can make mistakes. This is legal information, not legal advice. Avoid sharing names or sensitive details.
              </Text>
            </View>

            <ScrollView
              ref={chatScrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              onContentSizeChange={() =>
                chatScrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === "user"
                      ? styles.userBubble
                      : message.role === "error"
                        ? styles.errorBubble
                        : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === "user" && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
              {chatLoading && (
                <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={C.burgundy} />
                  <Text style={styles.loadingText}>Finding an answer…</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask about your legal rights…"
                placeholderTextColor={C.muted}
                value={chatInput}
                onChangeText={setChatInput}
                multiline
                maxLength={2000}
                editable={!chatLoading}
                onFocus={() =>
                  setTimeout(
                    () => chatScrollRef.current?.scrollToEnd({ animated: true }),
                    150
                  )
                }
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!chatInput.trim() || chatLoading) && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!chatInput.trim() || chatLoading}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Ionicons name="arrow-up" size={21} color={C.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  topBulb: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "flex-start",
  },
  bulb: {
    width: 36,
    height: 36,
    opacity: 0.6,
  },

  scroll: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // title
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 40,
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  rightsCard: {
    minHeight: 140,
    backgroundColor: "#D98FA3",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rightsCardOpen: { backgroundColor: "#C49378" },
  rightsCardTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 22,
    color: C.burgundy,
    textAlign: "center",
  },
  peel: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 54,
    height: 54,
    backgroundColor: "#D98FA3",
    borderBottomLeftRadius: 54,
  },
  overviewText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
    textAlign: "center",
    lineHeight: 22,
  },
  holdHint: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
  },

  // divider
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 20,
  },

  // "Your Rights" subheading
  subheading: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    textAlign: "center",
    marginBottom: 16,
  },

  carousel: { flexDirection: "row", alignItems: "center", gap: 8 },
  sideCard: { width: 48, height: 150, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rightCard: { flex: 1, minHeight: 190, borderRadius: 24, padding: 22, alignItems: "center", justifyContent: "center" },
  rightText: { fontFamily: "Ledger_400Regular", fontSize: 17, color: "#6D4D40", lineHeight: 25, textAlign: "center" },
  arrow: { fontSize: 36, color: C.white, lineHeight: 38 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.divider },
  dotActive: { width: 16, backgroundColor: C.burgundy },

  // back button
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

  chatRoot: { flex: 1, backgroundColor: C.bg },
  chatKeyboard: { flex: 1 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  chatHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8BAC5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  chatHeaderCopy: { flex: 1 },
  chatTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 16,
    color: C.text,
  },
  chatStatus: {
    fontFamily: "Ledger_400Regular",
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#E8D8C8",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: "Ledger_400Regular",
    fontSize: 10.5,
    lineHeight: 15,
    color: C.text,
  },
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  messageBubble: {
    maxWidth: "84%",
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E8D8C8",
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: C.burgundy,
    borderBottomRightRadius: 5,
  },
  errorBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F4D5D5",
    borderWidth: 1,
    borderColor: "#D59A9A",
  },
  messageText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: C.text,
  },
  userMessageText: { color: C.white },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  loadingText: {
    fontFamily: "Ledger_400Regular",
    fontSize: 12,
    color: C.muted,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 14,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.bg,
  },
  chatInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 46,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: 23,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.text,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.burgundy,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.4 },
});
