import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

export function TopicDiscussionScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isLoggedIn = user !== null;

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [topicLiked, setTopicLiked] = useState(false);
  const [topicLikes, setTopicLikes] = useState(448);
  const [newCommentText, setNewCommentText] = useState("");
  const [newReplyText, setNewReplyText] = useState("");

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Dr. Ricardo Marto",
      authorAvatar: "RM",
      time: "há 2 horas",
      content:
        "Excelente análise! A ferrovia de Benguela foi e ainda é peça-chave da infraestrutura logística de Angola. As obras de reabilitação podem transformar significativamente a região.",
      likes: 12,
      replies: 3,
      isLiked: true,
    },
    {
      id: "2",
      author: "Ana Paula Santos",
      authorAvatar: "AS",
      time: "há 5 horas",
      content:
        "Concordo plenamente. É importante também analisar o impacto social desta obra. A ferrovia não traz apenas benefícios económicos, mas pode transformar comunidades inteiras ao longo do trajeto. A economia local, o acesso a mercados e a integração regional são fatores-chave para avaliarmos o verdadeiro impacto social.",
      likes: 8,
      replies: 1,
    },
  ]);

  const handleTopicLike = () => {
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    setTopicLiked(!topicLiked);
    setTopicLikes(topicLiked ? topicLikes - 1 : topicLikes + 1);
  };

  const handleLike = (commentId: string) => {
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      }),
    );
  };

  const handleReplyPress = (commentId: string) => {
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setNewReplyText("");
  };

  const handlePublishComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      id: String(comments.length + 1),
      author: user?.name || "Eu",
      authorAvatar: (user?.name || "Eu").substring(0, 2).toUpperCase(),
      time: "Agora mesmo",
      content: newCommentText,
      likes: 0,
      replies: 0,
    };
    setComments([...comments, newComment]);
    setNewCommentText("");
    setShowCommentBox(false);
  };

  const handlePublishReply = (commentId: string) => {
    if (!newReplyText.trim()) return;
    // Simulate updating replies count
    setComments(
      comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, replies: c.replies + 1 };
        }
        return c;
      }),
    );
    setNewReplyText("");
    setReplyingTo(null);
  };

  const handleFloatingAction = () => {
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
    } else {
      setShowCommentBox(!showCommentBox);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScreenContainer style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={appTheme.colors.primary} />
            <Text style={styles.headerTitle}>Discussão do Fórum</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-vertical" size={20} color={appTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Topic Detail Header */}
          <View style={styles.topicHeaderCard}>
            <Text style={styles.topicCategory}>COMUNIDADE E CULTURA</Text>
            <Text style={styles.topicTitle}>O Impacto da Ferrovia de Benguela</Text>

            {/* Featured Image */}
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80" }}
                style={styles.featuredImage}
              />
              <View style={styles.imageOverlay} />
              <Text style={styles.imageCaption}>IMAGEM POR FOTO: ALBERTO TEIXEIRA</Text>
            </View>

            {/* Author */}
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>JD</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>João Diogo</Text>
                <Text style={styles.authorMeta}>Publicado há 3 dias</Text>
              </View>
            </View>

            {/* Blockquote Quote */}
            <View style={styles.blockquote}>
              <Text style={styles.blockquoteText}>
                "A ferrovia não foi apenas um trilho de aço, foi a espinha dorsal de uma economia nascente. Conectou mercados, uniu povos e alimentou esperanças. Agora, a questão é: podemos revitalizar não apenas os trilhos, mas também o impacto social?"
              </Text>
            </View>

            {/* Stats and Like trigger */}
            <View style={styles.statsBar}>
              <View style={styles.statsLeft}>
                <Feather name="message-circle" size={18} color={appTheme.colors.primary} />
                <Text style={styles.commentCountText}>24 COMENTÁRIOS</Text>
              </View>
              <TouchableOpacity onPress={handleTopicLike} style={styles.likeStatsRow}>
                <Feather
                  name="thumbs-up"
                  size={18}
                  color={topicLiked ? appTheme.colors.primary : appTheme.colors.textMuted}
                />
                <Text style={[styles.likeCountText, topicLiked && styles.likeCountActive]}>
                  {topicLikes}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick action buttons */}
            <View style={styles.topicActionsRow}>
              <TouchableOpacity
                onPress={handleTopicLike}
                style={[styles.topicActionBtn, topicLiked && styles.topicActionBtnActive]}
              >
                <Feather name="thumbs-up" size={14} color={topicLiked ? "white" : appTheme.colors.textSecondary} />
                <Text style={[styles.topicActionBtnText, topicLiked && styles.topicActionBtnTextActive]}>
                  {topicLiked ? "Gostei" : "Gostar"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.topicActionBtn}>
                <Feather name="share-2" size={14} color={appTheme.colors.textSecondary} />
                <Text style={styles.topicActionBtnText}>Partilhar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsContainer}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentRow}>
                  {/* Avatar */}
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{comment.authorAvatar}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeaderRow}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>

                {/* Comment Actions */}
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => handleLike(comment.id)} style={styles.actionLink}>
                    <Feather
                      name="thumbs-up"
                      size={14}
                      color={comment.isLiked ? appTheme.colors.primary : appTheme.colors.textMuted}
                    />
                    <Text style={[styles.actionLinkText, comment.isLiked && styles.actionLinkTextActive]}>
                      {comment.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleReplyPress(comment.id)} style={styles.actionLink}>
                    <Feather name="message-square" size={14} color={appTheme.colors.textMuted} />
                    <Text style={styles.actionLinkText}>Responder</Text>
                  </TouchableOpacity>
                </View>

                {/* Reply Input Box */}
                {replyingTo === comment.id && (
                  <View style={styles.replyBox}>
                    <View style={styles.replyBoxHeader}>
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>EU</Text>
                      </View>
                      <TextInput
                        placeholder={`Responder a ${comment.author}...`}
                        placeholderTextColor={appTheme.colors.textMuted}
                        style={styles.replyInput}
                        value={newReplyText}
                        onChangeText={setNewReplyText}
                        multiline
                      />
                    </View>
                    <View style={styles.replyActionsRow}>
                      <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handlePublishReply(comment.id)} style={styles.publishBtn}>
                        <Text style={styles.publishBtnText}>Responder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={handleFloatingAction}
          style={styles.floatingActionBtn}
        >
          <Feather name="message-circle" size={24} color="white" />
        </TouchableOpacity>

        {/* Comment Input drawer (visible when toggled) */}
        {showCommentBox && (
          <View style={styles.commentInputDrawer}>
            <View style={styles.drawerRow}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>EU</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Adicionar um comentário..."
                  placeholderTextColor={appTheme.colors.textMuted}
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                  multiline
                  style={styles.commentTextInput}
                />
                <View style={styles.drawerActions}>
                  <TouchableOpacity onPress={() => setShowCommentBox(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePublishComment} style={styles.publishBtn}>
                    <Text style={styles.publishBtnText}>Publicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: "#F8F9FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
    fontFamily: "IBM_Plex_Sans",
  },
  moreButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Drawer & FAB buffer
  },
  topicHeaderCard: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
  },
  topicCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  topicTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 32,
    marginBottom: 16,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  imageCaption: {
    position: "absolute",
    bottom: 12,
    left: 12,
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D9E3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  authorInfo: {
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  authorMeta: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  blockquote: {
    backgroundColor: "#F8F9FF",
    borderLeftWidth: 4,
    borderLeftColor: appTheme.colors.primary,
    padding: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  blockquoteText: {
    fontSize: 15,
    fontStyle: "italic",
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 16,
    marginBottom: 12,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  likeStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
  },
  likeCountActive: {
    color: appTheme.colors.primary,
  },
  topicActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  topicActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    borderRadius: 8,
  },
  topicActionBtnActive: {
    backgroundColor: appTheme.colors.primary,
  },
  topicActionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
  topicActionBtnTextActive: {
    color: "white",
  },
  commentsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingBottom: 20,
    marginBottom: 20,
  },
  commentRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D9E3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  commentContent: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: 24,
    paddingLeft: 48,
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
  },
  actionLinkTextActive: {
    color: appTheme.colors.primary,
  },
  replyBox: {
    backgroundColor: "#F8F9FF",
    borderRadius: 8,
    padding: 12,
    marginLeft: 48,
    marginTop: 12,
    gap: 8,
  },
  replyBoxHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D9E3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: appTheme.colors.textPrimary,
    minHeight: 40,
  },
  replyActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  publishBtn: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  publishBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  floatingActionBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  commentInputDrawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 101,
  },
  drawerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  commentTextInput: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: appTheme.colors.textPrimary,
    minHeight: 72,
    marginBottom: 8,
  },
  drawerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});