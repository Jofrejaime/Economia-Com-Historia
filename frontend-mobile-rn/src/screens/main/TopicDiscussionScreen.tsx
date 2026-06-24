import React, { useEffect, useState } from "react";
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
  Switch,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { useCommunity } from "../../hooks/useCommunity";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { MainStackParamList } from "../../types/navigation";

type TopicDiscussionRouteProp = RouteProp<MainStackParamList, "TopicDiscussion">;

export function TopicDiscussionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<TopicDiscussionRouteProp>();
  const { user } = useAuth();
  const { getTopicById, addComment, toggleCommentLike, addReply, updateTopic } = useCommunity();
  const isLoggedIn = user !== null;
  const topic = getTopicById(route.params.id);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [topicLiked, setTopicLiked] = useState(false);
  const [topicLikes, setTopicLikes] = useState(topic?.replies ?? 0);
  const [newCommentText, setNewCommentText] = useState("");
  const [newReplyText, setNewReplyText] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [comments, setComments] = useState(topic?.comments ?? []);
  const [isPrivate, setIsPrivate] = useState(topic?.isPrivate ?? false);
  const [isTerminated, setIsTerminated] = useState(topic?.isActive === false);
  const [showManagementMenu, setShowManagementMenu] = useState(false);
  const isAuthor = user?.id === topic?.author || user?.name === topic?.author;

  useEffect(() => {
    if (topic) {
      setComments(topic.comments);
      setTopicLikes(topic.replies);
      setIsPrivate(topic.isPrivate ?? false);
      setIsTerminated(topic.isActive === false);
    }
  }, [topic?.id, topic?.comments, topic?.replies, topic?.isPrivate, topic?.isActive]);

  if (!topic) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Discussão não encontrada</Text>
          <Text style={styles.notFoundText}>O tópico solicitado não existe ou foi removido.</Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backHomeButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleTopicLike = () => {
    if (isTerminated) return;
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    setTopicLiked(!topicLiked);
    setTopicLikes(topicLiked ? topicLikes - 1 : topicLikes + 1);
  };

  const handleLike = (commentId: string) => {
    if (isTerminated) return;
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    toggleCommentLike(route.params.id, commentId);
  };

  const handleReplyPress = (commentId: string) => {
    if (isTerminated) return;
    if (!isLoggedIn) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setNewReplyText("");
  };

  const handlePublishComment = () => {
    if (!newCommentText.trim() || !topic || isTerminated) return;
    const newComment: any = {
      id: String(Date.now()),
      author: user?.name || "Eu",
      authorAvatar: (user?.name || "Eu").substring(0, 2).toUpperCase(),
      time: "Agora mesmo",
      content: newCommentText,
      likes: 0,
      replies: 0,
    };
    addComment(topic.id, newComment);
    setNewCommentText("");
  };

  const handlePublishReply = (commentId: string) => {
    if (!newReplyText.trim() || !topic || isTerminated) return;
    addReply(topic.id, commentId);
    setNewReplyText("");
    setReplyingTo(null);
  };

  const handleTogglePrivacy = (value: boolean) => {
    if (!topic) return;
    setIsPrivate(value);
    updateTopic(topic.id, { isPrivate: value });
  };

  const handleTerminateDiscussion = () => {
    if (!topic) return;

    const title = "Terminar Discussão";
    const message = "Esta ação é irreversível. Ao terminar a discussão, a sala de chat passará a funcionar apenas em modo de leitura (não será possível enviar novos comentários ou respostas).\n\nDeseja continuar?";

    if (Platform.OS === "web") {
      const confirmClose = window.confirm(`${title}\n\n${message}`);
      if (confirmClose) {
        setIsTerminated(true);
        updateTopic(topic.id, { isActive: false });
        setShowManagementMenu(false);
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Confirmar",
            style: "destructive",
            onPress: () => {
              setIsTerminated(true);
              updateTopic(topic.id, { isActive: false });
              setShowManagementMenu(false);
            },
          },
        ]
      );
    }
  };

  const handleManageMembers = () => {
    if (!topic) return;
    setShowManagementMenu(false);
    navigation.navigate("ManageMembers", { topicId: topic.id });
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
        <HeaderBar title="Discussão do Fórum" />

        {/* Management Menu */}
        {isAuthor && showManagementMenu && (
          <View style={styles.managementMenu}>
            <View style={styles.menuItemSwitchRow}>
              <View style={styles.menuItemSwitchLabelContainer}>
                <Ionicons 
                  name={isPrivate ? "lock-closed" : "globe"} 
                  size={18} 
                  color={appTheme.colors.primary} 
                />
                <Text style={styles.menuItemText}>Privado ({isPrivate ? "Activo" : "Desactivado"})</Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={handleTogglePrivacy}
                trackColor={{ false: "#E5E7EB", true: "#D1D5DB" }}
                thumbColor={isPrivate ? appTheme.colors.primary : "#3B82F6"}
              />
            </View>
            
            {isPrivate && (
              <TouchableOpacity style={styles.menuItem} onPress={handleManageMembers}>
                <Ionicons name="people" size={18} color={appTheme.colors.primary} />
                <Text style={styles.menuItemText}>Gestão de Membros</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemDanger]} 
              onPress={handleTerminateDiscussion}
              disabled={isTerminated}
            >
              <Ionicons name="stop-circle" size={18} color={isTerminated ? "#9CA3AF" : "#DC2626"} />
              <Text style={[styles.menuItemText, { color: isTerminated ? "#9CA3AF" : "#DC2626" }]}>
                {isTerminated ? "Discussão Terminada" : "Terminar Discussão"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Discussion Terminated Banner */}
        {isTerminated && (
          <View style={styles.terminatedBanner}>
            <Ionicons name="lock-closed" size={18} color="white" />
            <Text style={styles.terminatedBannerText}>Esta discussão foi encerrada. Apenas leitura permitida.</Text>
          </View>
        )}

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Topic Detail Header */}
          <View style={styles.topicHeaderCard}>
            <Text style={styles.topicCategory}>{topic.category}</Text>
            <Text style={styles.topicTitle}>{topic.title}</Text>

            {/* Featured Image */}
            <View style={styles.imageWrap}>
              <Image
                source={{
                  uri:
                    topic.image ||
                    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=80",
                }}
                style={styles.featuredImage}
              />
              <View style={styles.imageOverlay} />
              <Text style={styles.imageCaption}>IMAGEM POR FOTO: ALBERTO TEIXEIRA</Text>
            </View>

            {/* Author */}
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>{topic.author?.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{topic.author}</Text>
                <Text style={styles.authorMeta}>Publicado {topic.time || "há pouco"}</Text>
              </View>
            </View>

            {/* Blockquote Quote */}
            <View style={styles.blockquote}>
              <Text style={styles.blockquoteText}>{topic.quote ?? topic.description}</Text>
            </View>

            {/* Stats and Like trigger */}
            <View style={styles.statsBar}>
              <View style={styles.statsLeft}>
                <Feather name="message-circle" size={18} color={appTheme.colors.primary} />
                <Text style={styles.commentCountText}>{topic.comments?.length || 0} COMENTÁRIOS</Text>
              </View>
              <TouchableOpacity 
                onPress={handleTopicLike} 
                style={styles.likeStatsRow}
                disabled={isTerminated}
              >
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
                style={[
                  styles.topicActionBtn, 
                  topicLiked && styles.topicActionBtnActive,
                  isTerminated && { opacity: 0.6 }
                ]}
                disabled={isTerminated}
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
                  <TouchableOpacity 
                    onPress={() => handleLike(comment.id)} 
                    style={[styles.actionLink, isTerminated && { opacity: 0.7 }]}
                    disabled={isTerminated}
                  >
                    <Feather
                      name="thumbs-up"
                      size={14}
                      color={comment.isLiked ? appTheme.colors.primary : appTheme.colors.textMuted}
                    />
                    <Text style={[styles.actionLinkText, comment.isLiked && styles.actionLinkTextActive]}>
                      {comment.likes}
                    </Text>
                  </TouchableOpacity>

                  {!isTerminated && (
                    <TouchableOpacity onPress={() => handleReplyPress(comment.id)} style={styles.actionLink}>
                      <Feather name="message-square" size={14} color={appTheme.colors.textMuted} />
                      <Text style={styles.actionLinkText}>Responder</Text>
                    </TouchableOpacity>
                  )}
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

        {!isTerminated && (
          <View style={[styles.composerWrapper, composerFocused && styles.composerWrapperFocused]}>
            <View style={styles.composerInner}>
              <View style={styles.composerAvatar}>
                <Text style={styles.composerAvatarText}>
                  {user?.name
                    ? user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                    : "EU"}
                </Text>
              </View>

              <TextInput
                placeholder="Escreva um comentário..."
                placeholderTextColor="#9CA3AF"
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
                style={[
                  styles.composerInput,
                  composerFocused && {
                    outlineStyle: "none",
                    outlineWidth: 0,
                  } as any,
                ]}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                underlineColorAndroid="transparent"
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.sendButton, !newCommentText.trim() && styles.sendButtonDisabled]}
                onPress={handlePublishComment}
                disabled={!newCommentText.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
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
  managementMenu: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
  },
  menuItemSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemSwitchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  terminatedBanner: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  terminatedBannerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
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
  composerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  composerWrapperFocused: {
    backgroundColor: "transparent",
  },
  composerInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  composerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EFF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  composerAvatarText: {
    color: "#8B1E2D",
    fontSize: 14,
    fontWeight: "700",
  },
  composerInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 112,
    paddingVertical: 10,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B1E2D",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  backHomeButton: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backHomeButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});