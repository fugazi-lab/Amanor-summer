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
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Client, Databases, ID, Query } from "react-native-appwrite";

// same family, different room
const APPWRITE_CONFIG = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "69af49d80022d666076a",
  dbId: "69b0806500366fecf954",
  postsColId: "posts",       // the original thought
  commentsColId: "comments", // the replies to the thought
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client); // the messenger

// our warm palette — like a cozy café but make it code
const C = {
  bg:       "#fffaeb", // off-white: calm, clean, a cup of tea
  brown:    "#b38e75", // light brown: everywhere, holding it together
  dark:     "#6d4d40", // dark brown: depth, shadow, gravitas
  pink:     "#d395a2", // pink: "hey look at this!!"
  burgundy: "#8b2c3a", // burgundy: pink's distinguished cousin
};

// converts timestamps into relatable human time
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

// takes a flat array and builds a beautiful nested tree. very satisfying.
function buildTree(comments) {
  const map = {};
  const roots = [];

  // first pass: index everyone
  comments.forEach(c => { map[c.$id] = { ...c, replies: [] }; });

  // second pass: find their parents. wholesome.
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.$id]); // "i know your father"
    } else {
      roots.push(map[c.$id]); // top-level loner, very cool
    }
  });

  return roots;
}

// thread line colors: fade as the rabbit hole gets deeper
const THREAD_COLORS = [C.pink, C.brown, "#c8a08c", "#b08878", C.dark];

// a single comment + its entire family tree, recursively rendered
function CommentNode({ comment, onReply, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false); // squish or unsquish
  const hasReplies = comment.replies && comment.replies.length > 0;
  const threadColor = THREAD_COLORS[Math.min(depth, THREAD_COLORS.length - 1)];

  return (
    <View style={{ marginLeft: depth * 14, marginTop: 8 }}>
      {/* the comment itself, hugging its thread line */}
      <View style={[styles.commentWrapper, { borderLeftColor: threadColor }]}>
        <View style={styles.commentMeta}>
          {/* who said this thing */}
          <Text style={styles.commentAuthor}>
            {comment.author && comment.author !== "anon" ? comment.author : "anon"}
          </Text>
          <Text style={styles.commentTime}> · {timeAgo(comment.$createdAt)}</Text>

          {/* collapse button: hide the chaos, reveal it on demand */}
          {hasReplies && (
            <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
              <Text style={styles.collapseBtnText}>
                {collapsed ? "[+" + comment.replies.length + "]" : "[−]"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* the actual thing they said */}
        <Text style={styles.commentText}>{comment.text}</Text>

        {/* tiny button. big consequences. (just a reply) */}
        <Pressable onPress={() => onReply(comment)} style={styles.replyBtn}>
          <Text style={styles.replyBtnText}>↩ Reply</Text>
        </Pressable>
      </View>

      {/* the children, if not hidden. recursive magic. */}
      {!collapsed && hasReplies && comment.replies.map(reply => (
        <CommentNode
          key={reply.$id}
          comment={reply}
          onReply={onReply}
          depth={depth + 1} // one level deeper into the void
        />
      ))}
    </View>
  );
}

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams(); // the post id, passed from home like a baton
  const router = useRouter();            // our way back to civilization

  const [post, setPost] = useState(null);           // the original post at the top
  const [commentTree, setCommentTree] = useState([]); // the whole conversation
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const [replyingTo, setReplyingTo] = useState(null); // which comment gets a reply
  const [commentText, setCommentText] = useState(""); // what you're about to say
  const [authorName, setAuthorName] = useState("");   // your name (optional, no pressure)
  const [submitting, setSubmitting] = useState(false); // currently yelling at the internet

  // fetches the original post so it can sit proudly at the top
  const fetchPost = async () => {
    try {
      const res = await databases.getDocument(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.postsColId,
        id
      );
      setPost(res); // found it!
    } catch (e) {
      console.error("Post fetch failed:", e.message); // it escaped
    } finally {
      setLoadingPost(false);
    }
  };

  // fetches all comments, sorts them by age, builds the tree
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.commentsColId,
        [Query.equal("post_id", id), Query.orderAsc("$createdAt"), Query.limit(200)]
      );
      setCommentTree(buildTree(res.documents)); // flat list → beautiful tree
    } catch (e) {
      console.error("Comments fetch failed:", e.message);
    } finally {
      setLoadingComments(false);
    }
  };

  // fetch both the moment we arrive
  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  // sends a new comment or reply into the world
  const handleSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert("Empty?", "Say something first."); // the void cannot receive void
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
          author: authorName.trim() || "anon", // anon is a valid identity
          parent_id: replyingTo ? replyingTo.$id : null, // null = top-level thought
        }
      );

      // reset and reload — fresh slate
      setCommentText("");
      setReplyingTo(null);
      fetchComments();
    } catch (e) {
      Alert.alert("Failed", e.message || "Could not post comment");
    } finally {
      setSubmitting(false); // button lives again
    }
  };

  return (
    <SafeAreaView style={styles.root}>

      {/* ── HEADER: back button + title ── */}
      <View style={styles.header}>
        {/* ← the escape route */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        {/* the post title, truncated to avoid chaos */}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {post ? post.title : "Discussion"}
        </Text>

        {/* invisible spacer so the title stays centered */}
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* ── THE POST: the thing that started it all ── */}
          {loadingPost ? (
            <ActivityIndicator color={C.pink} style={{ marginVertical: 30 }} />
          ) : post ? (
            <View style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postAuthor}>
                by {post.author || "anon"} · {timeAgo(post.$createdAt)}
              </Text>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ) : (
            <Text style={styles.errorText}>Post not found. It may have fled.</Text>
          )}

          {/* ── COMMENTS: the conversation begins ── */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsHeader}>
              Discussion {commentTree.length > 0 ? "(" + commentTree.length + " threads)" : ""}
            </Text>

            {loadingComments ? (
              <ActivityIndicator color={C.pink} style={{ marginTop: 20 }} />
            ) : commentTree.length === 0 ? (
              // sad empty state. won't last long.
              <Text style={styles.emptyComments}>No replies yet. Start the conversation!</Text>
            ) : (
              commentTree.map(comment => (
                <CommentNode
                  key={comment.$id}
                  comment={comment}
                  onReply={(c) => {
                    setReplyingTo(c);   // lock and load
                    setCommentText(""); // clear the field for new words
                  }}
                />
              ))
            )}
          </View>

          <View style={{ height: 160 }} /> {/* bottom padding so content isn't swallowed */}
        </ScrollView>

        {/* ── INPUT BAR: permanently attached to the bottom ── */}
        <View style={styles.inputBar}>

          {/* replying-to banner: shows who you're responding to */}
          {replyingTo && (
            <View style={styles.replyingToBanner}>
              <Text style={styles.replyingToText} numberOfLines={1}>
                ↩ Replying to {replyingTo.author || "anon"}: "{replyingTo.text}"
              </Text>
              {/* ✕ = changed my mind, replying to no one */}
              <Pressable onPress={() => setReplyingTo(null)}>
                <Text style={styles.cancelReply}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* your name, if you'd like one */}
          <TextInput
            style={styles.nameInput}
            placeholder="Your name (optional)"
            placeholderTextColor={C.brown}
            value={authorName}
            onChangeText={setAuthorName}
            maxLength={40}
          />

          <View style={styles.inputRow}>
            {/* the thought box */}
            <TextInput
              style={styles.textInput}
              placeholder={replyingTo ? "Write a reply..." : "Join the discussion..."}
              placeholderTextColor={C.brown}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={1000}
            />

            {/* the launch button */}
            <TouchableOpacity
              style={[styles.sendBtn, submitting && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" /> // sending...
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
  root: {
    flex: 1,
    backgroundColor: C.bg, // warm off-white, very inviting
  },

  // header: the navigation crown
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: C.dark,
    borderBottomWidth: 3,
    borderBottomColor: C.burgundy,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  backArrow: {
    fontSize: 22,
    color: C.bg,
    marginRight: 4,
  },
  backLabel: {
    fontSize: 15,
    color: C.bg,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: C.bg,
    paddingHorizontal: 8,
  },

  scroll: {
    padding: 14,
  },

  // the post card: the conversation starter
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: C.pink,
    shadowColor: C.dark,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.dark,
    marginBottom: 6,
  },
  postAuthor: {
    fontSize: 12,
    color: C.brown,
    marginBottom: 10,
    fontStyle: "italic",
  },
  postContent: {
    fontSize: 15,
    color: "#4a3530",
    lineHeight: 22,
  },
  errorText: {
    textAlign: "center",
    color: C.brown,
    marginTop: 40,
    fontStyle: "italic",
  },

  // comments section
  commentsSection: {
    flex: 1,
  },
  commentsHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: C.dark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emptyComments: {
    color: C.brown,
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },

  // individual comment node
  commentWrapper: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 5,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 3,
  },
  commentAuthor: {
    fontWeight: "700",
    fontSize: 13,
    color: C.burgundy,
  },
  commentTime: {
    fontSize: 11,
    color: C.brown,
  },
  collapseBtn: {
    marginLeft: 8,
  },
  collapseBtnText: {
    fontSize: 12,
    color: C.pink,
    fontWeight: "700",
  },
  commentText: {
    fontSize: 14,
    color: "#4a3530",
    lineHeight: 20,
    marginBottom: 4,
  },
  replyBtn: {
    alignSelf: "flex-start",
  },
  replyBtnText: {
    fontSize: 12,
    color: C.brown,
    fontWeight: "600",
  },

  // sticky bottom input bar
  inputBar: {
    backgroundColor: "#fff",
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 2,
    borderTopColor: C.brown,
    shadowColor: C.dark,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  replyingToBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef3e2",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },
  replyingToText: {
    flex: 1,
    fontSize: 12,
    color: C.dark,
    fontStyle: "italic",
  },
  cancelReply: {
    fontSize: 14,
    color: C.brown,
    paddingLeft: 8,
  },
  nameInput: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    color: C.dark,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: C.brown,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.dark,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: C.brown,
  },
  sendBtn: {
    backgroundColor: C.burgundy, // burgundy send button — fancy
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});