/*
    the discussion page. where posts go to become conversations.
    nested replies, collapsible threads, warm vibes only.
*/

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Client, Databases, ID, Query } from "react-native-appwrite";
import { useFonts } from "expo-font";
import { OtomanopeeOne_400Regular } from "@expo-google-fonts/otomanopee-one";
import { Ledger_400Regular } from "@expo-google-fonts/ledger";

const APPWRITE_CONFIG = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "69af49d80022d666076a",
  dbId: "69b0806500366fecf954",
  postsColId: "posts",
  commentsColId: "comments",
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

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
  replyBg: "#FCF9F2", // Light cream for replies
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function buildTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach(c => { map[c.$id] = { ...c, replies: [] }; });
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.$id]);
    } else {
      roots.push(map[c.$id]);
    }
  });
  return roots;
}

const THREAD_COLORS = [C.burgundy, C.brown, C.muted, C.divider];

function CommentNode({ comment, onReply, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const threadColor = THREAD_COLORS[Math.min(depth, THREAD_COLORS.length - 1)];
  const isReply = depth > 0;

  return (
    <View style={{ marginLeft: depth > 0 ? 16 : 0, marginTop: 12 }}>
      <View style={[styles.commentWrapper, { backgroundColor: isReply ? C.replyBg : C.white, borderLeftColor: threadColor }]}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>
            {comment.author && comment.author !== "anon" ? comment.author : "Anonymous"}
          </Text>
          <Text style={styles.commentTime}> · {timeAgo(comment.$createdAt)}</Text>
          {hasReplies && (
            <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
              <Text style={styles.collapseBtnText}>
                {collapsed ? "[open]" : "[collapse]"}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.commentText}>{comment.text}</Text>

        <Pressable onPress={() => onReply(comment)} style={styles.replyBtn}>
          <Text style={styles.replyBtnText}>Respond ↩</Text>
        </Pressable>
      </View>

      {!collapsed && hasReplies && comment.replies.map(reply => (
        <CommentNode key={reply.$id} comment={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </View>
  );
}

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ OtomanopeeOne_400Regular, Ledger_400Regular });

  const [post, setPost] = useState(null);
  const [commentTree, setCommentTree] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const [replyingTo, setReplyingTo] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // For input border color

  const fetchPost = async () => {
    try {
      const res = await databases.getDocument(APPWRITE_CONFIG.dbId, APPWRITE_CONFIG.postsColId, id);
      setPost(res);
    } catch (e) {
      console.error("Post fetch failed:", e.message);
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.commentsColId,
        [Query.equal("post_id", id), Query.orderAsc("$createdAt"), Query.limit(200)]
      );
      setCommentTree(buildTree(res.documents));
    } catch (e) {
      console.error("Comments fetch failed:", e.message);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert("Empty?", "Please type a message before sending.");
      return;
    }
    try {
      setSubmitting(true);
      await databases.createDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.commentsColId,
        ID.unique(),
        {
          post_id: id,
          text: commentText.trim(),
          author: authorName.trim() || "Anonymous",
          parent_id: replyingTo ? replyingTo.$id : null,
        }
      );
      setCommentText("");
      setReplyingTo(null);
      fetchComments();
    } catch (e) {
      Alert.alert("Failed", e.message || "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={C.burgundy} style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.header}>
            <Image source={require("../../assets/bulblogo.png")} style={styles.bulb} />
            <Text style={styles.title}>Conversation</Text>
            <Text style={styles.subtitle}>Join the discussion and share your perspective.</Text>
          </View>

          {loadingPost ? (
            <ActivityIndicator color={C.burgundy} style={{ marginVertical: 30 }} />
          ) : post ? (
            <View style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postAuthor}>by {post.author || "Anonymous"} · {timeAgo(post.$createdAt)}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ) : (
            <Text style={styles.errorText}>Post not found.</Text>
          )}

          <View style={styles.commentsSection}>
            {loadingComments ? (
              <ActivityIndicator color={C.burgundy} style={{ marginTop: 20 }} />
            ) : commentTree.length === 0 ? (
              <Text style={styles.emptyComments}>No replies yet. Start the conversation!</Text>
            ) : (
              commentTree.map(comment => (
                <CommentNode
                  key={comment.$id}
                  comment={comment}
                  onReply={(c) => {
                    setReplyingTo(c);
                    setCommentText("");
                  }}
                />
              ))
            )}
          </View>
          <View style={{ height: 160 }} />
        </ScrollView>

        <View style={styles.inputBar}>
          {replyingTo && (
            <View style={styles.replyingToBanner}>
              <Text style={styles.replyingToText} numberOfLines={1}>
                ↩ Replying to {replyingTo.author || "Anonymous"}: "{replyingTo.text}"
              </Text>
              <Pressable onPress={() => setReplyingTo(null)}>
                <Text style={styles.cancelReply}>✕</Text>
              </Pressable>
            </View>
          )}

          <TextInput
            style={styles.nameInput}
            placeholder="Your name (optional)"
            placeholderTextColor={C.muted}
            value={authorName}
            onChangeText={setAuthorName}
            maxLength={40}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, isFocused && { borderColor: C.burgundy, borderWidth: 2 }]}
              placeholder={replyingTo ? "Write a reply..." : "Join the discussion..."}
              placeholderTextColor={C.muted}
              value={commentText}
              onChangeText={setCommentText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[styles.sendBtn, submitting && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { fontSize: 24, color: C.burgundy, marginRight: 6, marginBottom: 2 },
  backLabel: { fontFamily: "Ledger_400Regular", fontSize: 16, color: C.burgundy },
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },
  header: { marginBottom: 24 },
  bulb: { width: 40, height: 40, marginBottom: 12, opacity: 0.8 },
  title: {
    fontFamily: "OtomanopeeOne_400Regular",
    fontSize: 32,
    color: C.burgundy,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
  },
  postCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  postTitle: {
    fontFamily: "Ledger_400Regular",
    fontSize: 20,
    color: C.text,
    fontWeight: "bold",
    marginBottom: 6,
  },
  postAuthor: {
    fontFamily: "Ledger_400Regular",
    fontSize: 13,
    color: C.muted,
    marginBottom: 12,
    fontStyle: "italic",
  },
  postContent: {
    fontFamily: "Ledger_400Regular",
    fontSize: 16,
    color: C.text,
    lineHeight: 24,
  },
  errorText: { textAlign: "center", color: C.muted, marginTop: 40, fontFamily: "Ledger_400Regular" },
  commentsSection: { flex: 1 },
  emptyComments: {
    fontFamily: "Ledger_400Regular",
    color: C.muted,
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  commentWrapper: {
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  commentMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 6 },
  commentAuthor: { fontFamily: "Ledger_400Regular", fontWeight: "bold", fontSize: 14, color: C.brown },
  commentTime: { fontFamily: "Ledger_400Regular", fontSize: 12, color: C.muted },
  collapseBtn: { marginLeft: 8 },
  collapseBtnText: { fontFamily: "Ledger_400Regular", fontSize: 12, color: C.burgundy },
  commentText: { fontFamily: "Ledger_400Regular", fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 8 },
  replyBtn: { alignSelf: "flex-start" },
  replyBtnText: { fontFamily: "Ledger_400Regular", fontSize: 13, color: C.burgundy, fontWeight: "600" },
  inputBar: {
    backgroundColor: C.bg,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  replyingToBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.replyBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.burgundy,
  },
  replyingToText: {
    fontFamily: "Ledger_400Regular",
    flex: 1,
    fontSize: 13,
    color: C.muted,
    fontStyle: "italic",
  },
  cancelReply: { fontSize: 16, color: C.muted, paddingLeft: 12 },
  nameInput: {
    fontFamily: "Ledger_400Regular",
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.divider,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  textInput: {
    fontFamily: "Ledger_400Regular",
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: C.divider,
  },
  sendBtn: {
    backgroundColor: C.burgundy,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnText: { color: C.white, fontSize: 20, fontWeight: "bold" },
});