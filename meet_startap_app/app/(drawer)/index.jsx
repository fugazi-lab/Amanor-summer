/*
    the discussion board. a safe space for thoughts and connection.
    pull down to refresh. tap to share.
*/

import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Image,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Client, Databases, ID } from "react-native-appwrite";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

// Appwrite config
const APPWRITE_CONFIG = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "69af49d80022d666076a",
  dbId: "69b0806500366fecf954",
  postsColId: "posts",
  commentsColId: "comments",
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setPlatform("com.meetstartap.app");

const databases = new Databases(client);

// AmanOr Palette
const C = {
  bg: "#F5F0E4",
  burgundy: "#7a2035",
  text: "#2C1810",
  muted: "#6B5B4E",
  divider: "#C4B8A8",
  white: "#ffffff",
  brown: "#6B4F3A",
};

export default function HomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.postsColId
      );
      setPosts(response.documents.reverse());
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert("Wait!", "Please provide at least a title and a message.");
      return;
    }

    try {
      setIsSubmitting(true);
      await databases.createDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.postsColId,
        ID.unique(),
        {
          title: newTitle,
          content: newContent,
          author: newAuthor.trim() ? newAuthor : "Anonymous",
        }
      );

      setNewTitle("");
      setNewContent("");
      setNewAuthor("");
      setModalVisible(false);
      fetchPosts();
      Alert.alert("Success", "Your post is live!");
    } catch (error) {
      console.error("Create Post Error:", error);
      Alert.alert("Post Failed", error.message || "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={C.burgundy} style={{ flex: 1, backgroundColor: C.bg }} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.burgundy} />}
      >
        <View style={styles.header}>
          <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} />
          <Text style={styles.title}>Discussion</Text>
          <Text style={styles.subtitle}>A safe space to share thoughts and connect with others.</Text>
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+ Open a Conversation</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={C.burgundy} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.emptyText}>Be the first to start a conversation.</Text>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.$id}
              style={styles.postCard}
              onPress={() => router.push({
                pathname: "/(drawer)/explore",
                params: { id: post.$id },
              })}
            >
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postUser}>by {post.author}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.postLink}>Join Conversation →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>New Conversation</Text>

              <TextInput
                style={styles.input}
                placeholder="Name (Optional)"
                placeholderTextColor={C.divider}
                value={newAuthor}
                onChangeText={setNewAuthor}
              />

              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor={C.divider}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What would you like to discuss?"
                placeholderTextColor={C.divider}
                multiline
                numberOfLines={4}
                value={newContent}
                onChangeText={setNewContent}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonTextMuted}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCreatePost}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={C.white} />
                  ) : (
                    <Text style={styles.buttonText}>Share</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  bulb: { width: 40, height: 40, marginBottom: 12, opacity: 0.8 },
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 36,
    color: C.burgundy,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
    marginBottom: 10,
  },
  fab: {
    backgroundColor: C.burgundy,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 24,
    shadowColor: C.burgundy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  fabText: {
    color: C.white,
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
  },
  emptyText: {
    fontFamily: "Ledger_400Regular",
    color: C.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
  postCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  postTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 18,
    color: C.text,
    fontWeight: "bold",
    marginBottom: 4,
  },
  postUser: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    marginBottom: 10,
    fontStyle: "italic",
  },
  postContent: {
    fontFamily: "Ledger_400Regular",
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },
  postFooter: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.bg,
    paddingTop: 12,
  },
  postLink: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.burgundy,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44, 24, 16, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 24,
    color: C.burgundy,
    marginBottom: 20,
  },
  input: {
    fontFamily: "Ledger_400Regular",
    borderWidth: 1,
    borderColor: C.divider,
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    color: C.text,
    fontSize: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: C.divider,
  },
  submitButton: {
    backgroundColor: C.burgundy,
  },
  buttonText: {
    fontFamily: "Ledger_400Regular",
    color: C.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonTextMuted: {
    fontFamily: "Ledger_400Regular",
    color: C.text,
    fontSize: 15,
  },
});