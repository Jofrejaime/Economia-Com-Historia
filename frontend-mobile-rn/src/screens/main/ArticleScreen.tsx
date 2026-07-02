import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { documentService } from "../../services/api/documentService";
import type { Document, DocumentQuizPreview, DocumentTopicPreview } from "../../types/api";


function documentTypeLabel(type: string): string {
  if (type === "article") return "Artigo";
  if (type === "thesis") return "Tese";
  if (type === "report") return "Relatório";
  if (type === "manuscript") return "Manuscrito";
  if (type === "archive") return "Arquivo";
  return type;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-AO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function difficultyColor(d: string): string {
  if (d === "Básico") return appTheme.colors.success;
  if (d === "Intermédio") return appTheme.colors.warning;
  if (d === "Avançado") return appTheme.colors.danger;
  return appTheme.colors.textSecondary;
}

export function ArticleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { user } = useAuth();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Dados embebidos no documento — sem chamadas extra
  const relatedQuizzes: DocumentQuizPreview[] = document?.quizzes ?? [];
  const relatedTopics: DocumentTopicPreview[] = document?.topics_preview ?? [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const doc = await documentService.detail(id);
        setDocument(doc);
        setIsLiked(doc.is_liked ?? false);
        setLikesCount(doc.likes_count);
      } catch {
        // document not found handled in render
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleToggleLike = async () => {
    if (!user) {
      navigation.navigate("LoginPrompt", { type: "comment" });
      return;
    }
    try {
      if (isLiked) {
        await documentService.unlike(id);
        setLikesCount((n) => n - 1);
      } else {
        await documentService.like(id);
        setLikesCount((n) => n + 1);
      }
      setIsLiked((v) => !v);
    } catch {
      // ignore
    }
  };

  const handleOpenForum = () => {
    if (user) {
      navigation.navigate("CreateTopic", { initialTitle: document?.title });
    } else {
      navigation.navigate("LoginPrompt", { type: "create-topic" });
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Documento" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!document) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Documento" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Documento não encontrado.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isJindungo = document.access_level_id === "jindungo";
  const isRestricted = document.access_level_id === "restricted";

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Documento" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type & Access Badges */}
        <View style={styles.badgeContainer}>
          <View style={styles.docTypeBadge}>
            <Text style={styles.docTypeBadgeText}>{documentTypeLabel(document.document_type).toUpperCase()}</Text>
          </View>
          {isJindungo && (
            <View style={styles.badgeJindungo}>
              <Ionicons name="flame" size={12} color="white" />
              <Text style={styles.badgeText}>JINDUNGO</Text>
            </View>
          )}
          {isRestricted && (
            <View style={styles.badgeRestricted}>
              <Ionicons name="lock-closed" size={12} color="white" />
              <Text style={styles.badgeText}>RESTRITO</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.articleTitle}>{document.title}</Text>

        {/* Author Info */}
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{document.author.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{document.author}</Text>
            <Text style={styles.authorMeta}>
              {document.institution ? `${document.institution} · ` : ""}
              {formatDate(document.publication_date ?? document.published_at)}
            </Text>
          </View>
        </View>

        {/* Category & Tags */}
        <View style={styles.metaRow}>
          {document.category && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{document.category.name}</Text>
            </View>
          )}
          {document.tags?.map((tag) => (
            <View key={tag.id} style={styles.metaChip}>
              <Text style={styles.metaChipText}>#{tag.name}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>RESUMO</Text>
          <Text style={styles.summaryText}>{document.summary}</Text>
        </View>

        {/* Article Content */}
        {document.content && (
          <View style={styles.articleBody}>
            {document.content.split("\n\n").map((paragraph, idx) =>
              paragraph.trim() ? (
                <Text key={idx} style={styles.paragraph}>{paragraph.trim()}</Text>
              ) : null
            )}
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity onPress={handleToggleLike} style={styles.statBtn}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? appTheme.colors.danger : appTheme.colors.textSecondary}
            />
            <Text style={styles.statText}>{likesCount}</Text>
          </TouchableOpacity>
          <View style={styles.statBtn}>
            <Ionicons name="eye-outline" size={20} color={appTheme.colors.textSecondary} />
            <Text style={styles.statText}>{document.views_count}</Text>
          </View>
        </View>

        {/* ── Quizzes relacionados ── */}
        {relatedQuizzes.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>QUIZZES RELACIONADOS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {relatedQuizzes.map((quiz) => (
                  <TouchableOpacity
                    key={quiz.id}
                    style={styles.quizCard}
                    onPress={() => {
                      if (!user) {
                        navigation.navigate("LoginPrompt", { type: "quiz" });
                      } else {
                        navigation.navigate("Quiz", { quizId: quiz.id });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.quizCardTop}>
                      <View style={[styles.diffDot, { backgroundColor: difficultyColor(quiz.difficulty) }]} />
                      <Text style={[styles.quizDiff, { color: difficultyColor(quiz.difficulty) }]}>
                        {quiz.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.quizCardTitle} numberOfLines={3}>{quiz.title}</Text>
                    <View style={styles.quizCardFooter}>
                      <Ionicons name="star-outline" size={12} color={appTheme.colors.textMuted} />
                      <Text style={styles.quizCardMeta}>{quiz.base_points} pts</Text>
                      <Feather name="arrow-right" size={14} color={appTheme.colors.primary} style={{ marginLeft: "auto" }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* ── Fóruns da mesma categoria ── */}
        {relatedTopics.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>DISCUSSÕES RELACIONADAS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {relatedTopics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicCard}
                    onPress={() => navigation.navigate("TopicDiscussion", { id: topic.id })}
                    activeOpacity={0.8}
                  >
                    {topic.category_color_bg && (
                      <View style={[styles.topicCatDot, { backgroundColor: topic.category_color_bg }]} />
                    )}
                    <Text style={styles.topicCardTitle} numberOfLines={3}>{topic.title}</Text>
                    <View style={styles.topicCardFooter}>
                      <Ionicons name="chatbubble-outline" size={12} color={appTheme.colors.textMuted} />
                      <Text style={styles.topicCardMeta}>{topic.replies_count} respostas</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* ── Acção: Debater no Fórum ── */}
        <View style={styles.sectionDivider} />
        <View style={styles.actionsBlock}>
          <Text style={styles.actionsLabel}>ACTIVIDADES</Text>
          <TouchableOpacity onPress={handleOpenForum} style={styles.forumBtn}>
            <Text style={styles.actionBtnLabel}>Debater no Fórum</Text>
            <Ionicons name="people-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Period info */}
        {(document.period_start || document.period_end) && (
          <>
            <View style={styles.sectionDivider} />
            <View style={styles.periodBlock}>
              <Text style={styles.periodLabel}>PERÍODO HISTÓRICO</Text>
              <Text style={styles.periodText}>
                {document.period_start && document.period_end
                  ? `${document.period_start} – ${document.period_end}`
                  : document.period_start
                  ? `A partir de ${document.period_start}`
                  : `Até ${document.period_end}`}
              </Text>
            </View>
          </>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: appTheme.colors.textMuted,
  },
  scrollView: {
    flex: 1,
    backgroundColor: appTheme.colors.surface,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 16,
  },
  docTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  docTypeBadgeText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badgeJindungo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeRestricted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.rankingCardGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: appTheme.colors.surface,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  articleTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appTheme.colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  authorMeta: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  metaChipText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  summaryBlock: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
  },
  articleBody: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    color: appTheme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  statBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
  },
  sectionDivider: {
    height: 8,
    backgroundColor: appTheme.colors.background,
    width: "100%",
  },
  // ── Sections (quiz + forum lists) ──────────────────────────────────────────
  sectionBlock: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  // Quiz card
  quizCard: {
    width: 180,
    backgroundColor: appTheme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 14,
    justifyContent: "space-between",
    minHeight: 130,
  },
  quizCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  diffDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  quizDiff: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
  },
  quizCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  quizCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  quizCardMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  // Topic card
  topicCard: {
    width: 200,
    backgroundColor: appTheme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 14,
    minHeight: 110,
    justifyContent: "space-between",
  },
  topicCatDot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  topicCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  topicCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  topicCardMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  // Actions
  actionsBlock: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  actionsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  forumBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appTheme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnLabel: {
    color: appTheme.colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
  periodBlock: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  periodText: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
});
