import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { communityService } from "../../services/api/communityService";
import { reportService, REPORT_REASONS } from "../../services/api/reportService";
import type { ReportReason } from "../../services/api/reportService";
import type { DiscussionTopic, TopicReply } from "../../types/api";
import { MainStackParamList } from "../../types/navigation";

type TopicDiscussionRouteProp = RouteProp<MainStackParamList, "TopicDiscussion">;

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ontem" : `Há ${days} dias`;
}

export function TopicDiscussionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<TopicDiscussionRouteProp>();
  const { user } = useAuth();

  const [topic, setTopic] = useState<DiscussionTopic | null>(null);
  const [replies, setReplies] = useState<TopicReply[]>([]);
  const [loading, setLoading] = useState(true);

  const [topicLiked, setTopicLiked] = useState(false);
  const [topicLikes, setTopicLikes] = useState(0);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReplyText, setNewReplyText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "topic" | "reply"; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const topicId = route.params.id;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [topicData, repliesData] = await Promise.all([
        communityService.topicDetail(topicId),
        communityService.replies(topicId),
      ]);
      setTopic(topicData);
      setTopicLiked(topicData.is_liked ?? false);
      setTopicLikes(topicData.likes_count);
      setReplies(repliesData.data);
    } catch (error) {
      console.warn("Erro ao carregar discussão", error);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isTerminated = topic?.status === "closed";
  const isAuthor = !!user && !!topic && user.id === topic.author_id;
  const isPrivateTopic = topic?.visibility === "PRIVATE";

  const handleToggleStatus = async () => {
    if (!topic) return;
    setMenuVisible(false);
    const newStatus = isTerminated ? "open" : "closed";
    try {
      await communityService.updateTopic(topicId, { status: newStatus });
      setTopic((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (error) {
      console.warn("Erro ao atualizar estado da discussão", error);
    }
  };

  const handleLeaveTopic = () => {
    Alert.alert(
      "Abandonar fórum",
      "Tens a certeza que queres sair deste fórum? Perderás o acesso a esta discussão privada.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await communityService.leaveTopic(topicId);
              navigation.navigate("MainTabs", { screen: "Community" });
            } catch {
              Alert.alert("Erro", "Não foi possível sair do fórum. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  const handleToggleVisibility = async () => {
    if (!topic) return;
    setMenuVisible(false);
    const newVisibility = topic.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE";
    try {
      await communityService.updateTopic(topicId, { visibility: newVisibility });
      setTopic((prev) => prev ? { ...prev, visibility: newVisibility } : prev);
    } catch (error) {
      console.warn("Erro ao alterar visibilidade", error);
    }
  };

  const openReport = (type: "topic" | "reply", id: string) => {
    setReportReason(null);
    setReportDescription("");
    setReportTarget({ type, id });
  };

  const closeReport = () => {
    setReportTarget(null);
    setReportReason(null);
    setReportDescription("");
  };

  const handleSubmitReport = async () => {
    if (!reportTarget || !reportReason || reportDescription.trim().length < 5) return;
    setSubmittingReport(true);
    try {
      await reportService.submit({
        content_type: reportTarget.type,
        content_id: reportTarget.id,
        reason: reportReason,
        description: reportDescription.trim(),
      });
      closeReport();
      Alert.alert("Denúncia enviada", "A sua denúncia foi enviada e será analisada pelos administradores. Obrigado.");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a denúncia. Tente novamente.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleTopicLike = async () => {
    if (!user) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    if (!topic || isTerminated) return;
    try {
      if (topicLiked) {
        await communityService.unlikeTopic(topicId);
        setTopicLikes((n) => n - 1);
      } else {
        await communityService.likeTopic(topicId);
        setTopicLikes((n) => n + 1);
      }
      setTopicLiked((v) => !v);
    } catch (error) {
      console.warn("Erro ao like/unlike tópico", error);
    }
  };

  const handleLikeReply = async (reply: TopicReply) => {
    if (!user) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    if (isTerminated) return;
    try {
      if (reply.is_liked) {
        await communityService.unlikeReply(reply.id);
      } else {
        await communityService.likeReply(reply.id);
      }
      setReplies((prev) =>
        prev.map((r) =>
          r.id === reply.id
            ? { ...r, is_liked: !r.is_liked, likes_count: r.likes_count + (r.is_liked ? -1 : 1) }
            : r
        )
      );
    } catch (error) {
      console.warn("Erro ao like/unlike resposta", error);
    }
  };

  const handlePublishComment = async () => {
    if (!newCommentText.trim() || !user || isTerminated) return;
    setSubmitting(true);
    try {
      const newReply = await communityService.createReply(topicId, { content: newCommentText });
      setReplies((prev) => [...prev, newReply]);
      setNewCommentText("");
      if (topic) {
        setTopic({ ...topic, replies_count: topic.replies_count + 1 });
      }
    } catch (error) {
      console.warn("Erro ao publicar comentário", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishReply = async (parentId: string) => {
    if (!newReplyText.trim() || !user || isTerminated) return;
    setSubmitting(true);
    try {
      const newReply = await communityService.createReply(topicId, {
        content: newReplyText,
        parent_reply_id: parentId,
      });
      setReplies((prev) => [...prev, newReply]);
      setNewReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.warn("Erro ao publicar resposta", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Discussão do Fórum" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!topic) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Discussão do Fórum" />
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

  const authorName = topic.author?.display_name ?? "Autor";
  const authorInitials = authorName.slice(0, 2).toUpperCase();
  const userInitials = user?.display_name ? user.display_name.slice(0, 2).toUpperCase() : "EU";

  const topLevelReplies = replies.filter((r) => !r.parent_reply_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
        <HeaderBar
          title="Discussão do Fórum"
          onBackPress={() => navigation.navigate("MainTabs", { screen: "Community" })}
          rightElement={
            isAuthor ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="more-vertical" size={22} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>
            ) : isPrivateTopic && !!user ? (
              <TouchableOpacity
                onPress={handleLeaveTopic}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="log-out" size={20} color={appTheme.colors.textSecondary} />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {isTerminated && (
          <View style={styles.terminatedBanner}>
            <Ionicons name="lock-closed" size={18} color="white" />
            <Text style={styles.terminatedBannerText}>Esta discussão foi encerrada. Apenas leitura permitida.</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Topic Header */}
          <View style={styles.topicHeaderCard}>
            {topic.category && (
              <Text style={styles.topicCategory}>{topic.category.name.toUpperCase()}</Text>
            )}
            <Text style={styles.topicTitle}>{topic.title}</Text>

            {/* Author */}
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>{authorInitials}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.authorMeta}>Publicado {relativeTime(topic.created_at)}</Text>
              </View>
            </View>

            {/* Content blockquote */}
            <View style={styles.blockquote}>
              <Text style={styles.blockquoteText}>{topic.content}</Text>
            </View>

            {/* Stats and Like */}
            <View style={styles.statsBar}>
              <View style={styles.statsLeft}>
                <Feather name="message-circle" size={18} color={appTheme.colors.primary} />
                <Text style={styles.commentCountText}>{topic.replies_count} COMENTÁRIOS</Text>
              </View>
              <View style={styles.likeStatsRow}>
                <Feather
                  name="thumbs-up"
                  size={18}
                  color={topicLiked ? appTheme.colors.primary : appTheme.colors.textMuted}
                />
                <Text style={[styles.likeCountText, topicLiked && styles.likeCountActive]}>
                  {topicLikes}
                </Text>
              </View>
            </View>

            {/* Actions — hidden when terminated */}
            {!isTerminated && (
              <View style={styles.topicActionsRow}>
                <TouchableOpacity
                  onPress={() => void handleTopicLike()}
                  style={[styles.topicActionBtn, topicLiked && styles.topicActionBtnActive]}
                >
                  <Feather name="thumbs-up" size={14} color={topicLiked ? "white" : appTheme.colors.textSecondary} />
                  <Text style={[styles.topicActionBtnText, topicLiked && styles.topicActionBtnTextActive]}>
                    {topicLiked ? "Gostei" : "Gostar"}
                  </Text>
                </TouchableOpacity>

                {user && !isAuthor && (
                  <TouchableOpacity
                    onPress={() => openReport("topic", topic.id)}
                    style={styles.topicActionBtn}
                  >
                    <Feather name="flag" size={14} color={appTheme.colors.textSecondary} />
                    <Text style={styles.topicActionBtnText}>Denunciar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Comments */}
          <View style={styles.commentsContainer}>
            {topLevelReplies.map((reply) => {
              const replyAuthor = reply.author?.display_name ?? "Utilizador";
              const replyInitials = replyAuthor.slice(0, 2).toUpperCase();
              const nestedReplies = replies.filter((r) => r.parent_reply_id === reply.id);

              return (
                <View key={reply.id} style={styles.commentItem}>
                  <View style={styles.commentRow}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>{replyInitials}</Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeaderRow}>
                        <Text style={styles.commentAuthor}>{replyAuthor}</Text>
                        <Text style={styles.commentTime}>{relativeTime(reply.created_at)}</Text>
                      </View>
                      <Text style={styles.commentText}>{reply.content}</Text>
                    </View>
                  </View>

                  {/* Comment Actions */}
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => void handleLikeReply(reply)}
                      style={styles.actionLink}
                      disabled={isTerminated}
                    >
                      <Feather
                        name="thumbs-up"
                        size={14}
                        color={reply.is_liked ? appTheme.colors.primary : appTheme.colors.textMuted}
                      />
                      <Text style={[styles.actionLinkText, reply.is_liked && styles.actionLinkTextActive]}>
                        {reply.likes_count}
                      </Text>
                    </TouchableOpacity>

                    {!isTerminated && (
                      <TouchableOpacity
                        onPress={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                        style={styles.actionLink}
                      >
                        <Feather name="message-square" size={14} color={appTheme.colors.textMuted} />
                        <Text style={styles.actionLinkText}>Responder</Text>
                      </TouchableOpacity>
                    )}

                    {user && reply.author_id !== user.id && (
                      <TouchableOpacity
                        onPress={() => openReport("reply", reply.id)}
                        style={styles.actionLink}
                      >
                        <Feather name="flag" size={14} color={appTheme.colors.textMuted} />
                        <Text style={styles.actionLinkText}>Denunciar</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Nested replies */}
                  {nestedReplies.map((nested) => {
                    const nestedAuthor = nested.author?.display_name ?? "Utilizador";
                    return (
                      <View key={nested.id} style={styles.nestedReply}>
                        <View style={styles.commentRow}>
                          <View style={[styles.commentAvatar, styles.commentAvatarSmall]}>
                            <Text style={[styles.commentAvatarText, { fontSize: 11 }]}>
                              {nestedAuthor.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.commentContent}>
                            <View style={styles.commentHeaderRow}>
                              <Text style={styles.commentAuthor}>{nestedAuthor}</Text>
                              <Text style={styles.commentTime}>{relativeTime(nested.created_at)}</Text>
                            </View>
                            <Text style={styles.commentText}>{nested.content}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {/* Reply Input */}
                  {replyingTo === reply.id && (
                    <View style={styles.replyBox}>
                      <View style={styles.replyBoxHeader}>
                        <View style={styles.smallAvatar}>
                          <Text style={styles.smallAvatarText}>{userInitials}</Text>
                        </View>
                        <TextInput
                          placeholder={`Responder a ${replyAuthor}...`}
                          placeholderTextColor={appTheme.colors.textMuted}
                          style={styles.replyInput}
                          value={newReplyText}
                          onChangeText={setNewReplyText}
                          multiline
                        />
                      </View>
                      <View style={styles.replyActionsRow}>
                        <TouchableOpacity onPress={() => { setReplyingTo(null); setNewReplyText(""); }} style={styles.cancelBtn}>
                          <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => void handlePublishReply(reply.id)}
                          style={[styles.publishBtn, (submitting || !newReplyText.trim()) && { opacity: 0.5 }]}
                          disabled={submitting || !newReplyText.trim()}
                        >
                          <Text style={styles.publishBtnText}>Responder</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Management menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <Pressable style={styles.menuSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHandle} />

              {isPrivateTopic && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setMenuVisible(false); navigation.navigate("ManageMembers", { topicId, topicTitle: topic.title }); }}
                >
                  <Feather name="users" size={20} color={appTheme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Gerir Membros</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => void handleToggleVisibility()}
              >
                <Feather
                  name={isPrivateTopic ? "unlock" : "lock"}
                  size={20}
                  color={appTheme.colors.textPrimary}
                />
                <Text style={styles.menuItemText}>
                  {isPrivateTopic ? "Tornar Público" : "Tornar Privado"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => void handleToggleStatus()}
              >
                <Feather
                  name={isTerminated ? "play-circle" : "x-circle"}
                  size={20}
                  color={isTerminated ? appTheme.colors.success : appTheme.colors.danger}
                />
                <Text style={[styles.menuItemText, { color: isTerminated ? appTheme.colors.success : appTheme.colors.danger }]}>
                  {isTerminated ? "Reabrir Discussão" : "Encerrar Discussão"}
                </Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuItemText, { color: appTheme.colors.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Report Modal */}
        <Modal
          visible={reportTarget !== null}
          transparent
          animationType="slide"
          onRequestClose={closeReport}
        >
          <Pressable style={styles.modalOverlay} onPress={closeReport}>
            <Pressable style={styles.reportSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHandle} />
              <Text style={styles.reportTitle}>
                Denunciar {reportTarget?.type === "topic" ? "Tópico" : "Comentário"}
              </Text>
              <Text style={styles.reportSubtitle}>Selecione a categoria e descreva o motivo</Text>

              {/* Reason chips */}
              <View style={styles.reasonGrid}>
                {REPORT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.reasonChip, reportReason === r.value && styles.reasonChipSelected]}
                    onPress={() => setReportReason(r.value)}
                  >
                    <Text style={[styles.reasonChipText, reportReason === r.value && styles.reasonChipTextSelected]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <TextInput
                style={styles.reportInput}
                placeholder="Descreva o motivo da denúncia... (obrigatório)"
                placeholderTextColor={appTheme.colors.textMuted}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.reportCharCount}>{reportDescription.length}/1000</Text>

              <TouchableOpacity
                style={[
                  styles.reportSubmitBtn,
                  (!reportReason || reportDescription.trim().length < 5 || submittingReport) && { opacity: 0.45 },
                ]}
                onPress={() => void handleSubmitReport()}
                disabled={!reportReason || reportDescription.trim().length < 5 || submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.reportSubmitBtnText}>Enviar Denúncia</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.reportCancelBtn} onPress={closeReport}>
                <Text style={styles.reportCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {!isTerminated && (
          <View style={[styles.composerWrapper, composerFocused && styles.composerWrapperFocused]}>
            <View style={styles.composerInner}>
              <View style={styles.composerAvatar}>
                <Text style={styles.composerAvatarText}>{userInitials}</Text>
              </View>

              <TextInput
                placeholder={user ? "Escreva um comentário..." : "Entre para comentar..."}
                placeholderTextColor="#9CA3AF"
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
                style={[styles.composerInput, composerFocused && { outlineStyle: "none" } as any]}
                onFocus={() => {
                  if (!user) {
                    navigation.navigate("LoginPrompt", { type: "comment" });
                    return;
                  }
                  setComposerFocused(true);
                }}
                onBlur={() => setComposerFocused(false)}
                underlineColorAndroid="transparent"
                textAlignVertical="top"
                editable={!!user}
              />

              <TouchableOpacity
                style={[styles.sendButton, (!newCommentText.trim() || submitting) && styles.sendButtonDisabled]}
                onPress={() => void handlePublishComment()}
                disabled={!newCommentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  terminatedBanner: {
    backgroundColor: appTheme.colors.danger,
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
  commentAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  nestedReply: {
    marginLeft: 48,
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: appTheme.colors.border,
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
  composerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "white",
  },
  composerWrapperFocused: {
    backgroundColor: "white",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  menuItemText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: appTheme.colors.border,
    marginVertical: 4,
  },
  reportSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  reportTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  reportSubtitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 16,
  },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    backgroundColor: "#F8F9FF",
  },
  reasonChipSelected: {
    borderColor: appTheme.colors.danger,
    backgroundColor: appTheme.colors.danger + "12",
  },
  reasonChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
  reasonChipTextSelected: {
    color: appTheme.colors.danger,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: appTheme.colors.textPrimary,
    minHeight: 100,
    fontFamily: "Source_Sans_3",
    backgroundColor: "#FAFAFA",
  },
  reportCharCount: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 16,
  },
  reportSubmitBtn: {
    backgroundColor: appTheme.colors.danger,
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  reportSubmitBtnText: {
    color: "white",
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    fontWeight: "700",
  },
  reportCancelBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  reportCancelBtnText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
  },
});
