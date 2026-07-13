/*
    the pinboard. a place for thoughts, rants, and unsolicited opinions.
    pull down to refresh. tap to yap.
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
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Client, Databases, ID } from "react-native-appwrite";
import { useRouter } from "expo-router";

// mlemlemle database mlemlemle
const APPWRITE_CONFIG = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "69af49d80022d666076a",
  dbId: "69b0806500366fecf954",
  postsColId: "posts",       // where the thoughts live
  commentsColId: "comments", // where the arguments live
};

//idk
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setPlatform("com.meetstartap.app");

const databases = new Databases(client); // the data entrie thingy

// this is colors, i dont know why 
const C = {
  bg:        "#fffaeb", 
  brown:     "#b38e75", 
  dark:      "#6d4d40", 
  pink:      "#d395a2", 
  burgundy:  "#8b2c3a", 
};

export default function HomeScreen() {
  const router = useRouter(); // our little navigator

  // the data piple
  const [posts, setPosts] = useState([]);        // posts: a list of people's thoughts
  const [loading, setLoading] = useState(true);  // are we there yet?
  const [refreshing, setRefreshing] = useState(false); // the dramatic pull-to-refresh, idk if needed

  // thingy things
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // don't touch the button
  const [newTitle, setNewTitle] = useState("");    // what is this post called
  const [newContent, setNewContent] = useState(""); // what does it say
  const [newAuthor, setNewAuthor] = useState("");  // who dunnit innit?

  // politely (meet values) asks appwrite for all the posts
  const fetchPosts = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.postsColId
      );
      setPosts(response.documents.reverse()); // newest first — history is overrated
    } catch (error) {
      console.error("Fetch Error:", error.message); // something went sideways
    } finally {
      setLoading(false); // whether it worked or not, we're done spinning
    }
  };

  // pull down → refresh → feel accomplished
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  // submit a new convo thingy
  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) {
      Alert.alert("Wait!", "Please fill in your name, title, and message.");
      return; // horrey, working
    }

    try {
      setIsSubmitting(true);
      console.log("Summoning post into existence...");

      await databases.createDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.postsColId,
        ID.unique(), // every post gets a unique ID, because we're fancy like that
        {
          title: newTitle,
          content: newContent,
          author: newAuthor,
        }
      );

      // clean up and go home
      setNewTitle("");
      setNewContent("");
      setNewAuthor("");
      setModalVisible(false);
      fetchPosts(); // reload so we can see our stuff already
      Alert.alert("Success", "Your post is live!");
    } catch (error) {
      console.error("Create Post Error:", error);
      Alert.alert("Post Failed", error.message || "Unknown error occurred");
    } finally {
      setIsSubmitting(false); // button is free again
    }
  };

  // runs once on mount. quietly. without fanfare.
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <SafeAreaView style={styles.root}>

      {/* ── THE HEADER — title lives here, nothing fancy ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support group Board</Text>
        <Text style={styles.headerSub}>say something. anything. or just listen</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.brown} // the spinner matches the vibe
          />
        }
      >
        {/* ── THE BIG BUTTON. it does what it says. ── */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Create New Post</Text>
        </TouchableOpacity>

        {/* ── POSTS LIST ── */}
        <Text style={styles.sectionLabel}>Recent Posts</Text>

        {loading ? (
          // spinning spinning
          <ActivityIndicator size="large" color={C.brown} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          // the lonely empty state
          <Text style={styles.emptyText}>The board is empty. Be the first to post!</Text>
        ) : (
          posts.map((post) => (
            // each post gets its moment in the spotlight
            <View key={post.$id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postAuthor}>by {post.author}</Text>
              <Text style={styles.postContent}>{post.content}</Text>

              {/* portal to the conversation dimension */}
              <TouchableOpacity
                style={styles.commentLink}
                onPress={() => router.push({
                  pathname: "/(drawer)/explore",
                  params: { id: post.$id },
                })}
              >
                <Text style={styles.commentLinkText}>full post and comment</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── THE MODAL: a popup that demands your thoughts ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // android: back button is not the enemy
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create a Post</Text>

              {/* tell us who you are (or make something up) */}
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor={C.brown}
                value={newAuthor}
                onChangeText={setNewAuthor}
              />

              {/* give your post a name. something catchy. */}
              <TextInput
                style={styles.input}
                placeholder="Post Title"
                placeholderTextColor={C.brown}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* the yap zone */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's on your mind?"
                placeholderTextColor={C.brown}
                multiline
                numberOfLines={4}
                value={newContent}
                onChangeText={setNewContent}
              />

              <View style={styles.modalButtons}>
                {/* escape hatch — no shame in backing out */}
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                {/* the big moment. no going back after this. */}
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCreatePost}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" /> // hang tight, talking to the internet
                  ) : (
                    <Text style={[styles.buttonText, { fontWeight: "bold" }]}>Post</Text>
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
  root: {
    flex: 1,
    backgroundColor: C.bg, // parchment dreams
  },

  // header: the crown of the page
  header: {
    backgroundColor: C.dark,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: C.burgundy,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: C.bg,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: C.brown,
    marginTop: 2,
    fontStyle: "italic",
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  // the button that starts it all
  addButton: {
    backgroundColor: C.burgundy,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 22,
    shadowColor: C.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.dark,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },

  emptyText: {
    color: C.brown,
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },

  // the post card — home for each thought
  postCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.brown,
    shadowColor: C.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.dark,
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: C.brown,
    marginBottom: 8,
    fontStyle: "italic",
  },
  postContent: {
    fontSize: 14,
    color: "#4a3530",
    lineHeight: 21,
  },
  commentLink: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0e8df",
  },
  commentLinkText: {
    color: C.pink,
    fontWeight: "700",
    fontSize: 13,
  },

  // modal: the dramatic popup
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(109,77,64,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 22,
    shadowColor: C.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderTopWidth: 4,
    borderTopColor: C.pink,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.dark,
    marginBottom: 18,
  },

  // inputs: little text boxes waiting to be filled
  input: {
    borderWidth: 1.5,
    borderColor: C.brown,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 13,
    marginBottom: 14,
    color: C.dark,
    fontSize: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: C.dark, // back to the shadows
  },
  submitButton: {
    backgroundColor: C.pink, // pink = go!
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
  },
});