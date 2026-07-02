import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { quizService } from "../../services/api/quizService";
import type { QuizAttempt, Quiz, Document } from "../../types/api";
import type { MainStackParamList } from "../../types/navigation";

type RouteProps = RouteProp<MainStackParamList, "QuizResult">;

function formatTime(secs: number | null): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function scoreLabel(pct: number): string {
  if (pct >= 90) return "Excelente";
  if (pct >= 75) return "Muito Bom";
  if (pct >= 60) return "Bom";
  if (pct >= 40) return "Suficiente";
  return "A Melhorar";
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  article: "Artigo", thesis: "Tese", report: "Relatório",
  manuscript: "Manuscrito", archive: "Arquivo", video: "Vídeo", audio: "Áudio",
};

export function QuizResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { attemptId, quizId, gamification } = route.params;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    const [attemptRes, quizRes, questionsRes, docsRes] = await Promise.allSettled([
      quizService.getAttempt(attemptId),
      quizService.detail(quizId),
      quizService.questions(quizId),
      quizService.relatedDocuments(quizId),
    ]);

    if (attemptRes.status === "fulfilled") {
      setAttempt(attemptRes.value);
    } else {
      setLoadError(true);
    }
    if (quizRes.status === "fulfilled") setQuiz(quizRes.value);
    if (questionsRes.status === "fulfilled") setTotalQuestions(questionsRes.value.length);
    if (docsRes.status === "fulfilled") setRelatedDocs(docsRes.value);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [attemptId, quizId]);

  if (loading) {
    return (
      <ScreenContainer style={{ paddingHorizontal: 0 }}>
        <HeaderBar title="Resultado Final" onBackPress={() => navigation.navigate("MainTabs", { screen: "QuizList" })} />
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (loadError || !attempt) {
    return (
      <ScreenContainer style={{ paddingHorizontal: 0 }}>
        <HeaderBar title="Resultado Final" onBackPress={() => navigation.navigate("MainTabs", { screen: "QuizList" })} />
        <View style={styles.centerWrap}>
          <Feather name="wifi-off" size={40} color={appTheme.colors.textMuted} />
          <Text style={styles.errorTitle}>Não foi possível carregar o resultado</Text>
          <Text style={styles.errorSub}>Verifica a tua ligação e tenta novamente.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void load()}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const pct = Math.round(attempt.score);
  const label = scoreLabel(pct);
  const totalPoints = (attempt.points_earned ?? 0) + (attempt.bonus_points ?? 0);
  const hasBonus = (attempt.bonus_points ?? 0) > 0;
  const leveledUp = gamification?.level_changed === true;
  const newBadges = gamification?.badges_earned ?? [];

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Resultado Final" onBackPress={() => navigation.navigate("MainTabs", { screen: "QuizList" })} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Level-up banner */}
        {leveledUp && (
          <View style={styles.levelUpBanner}>
            <View style={styles.levelUpIcon}>
              <Feather name="trending-up" size={22} color={appTheme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelUpTitle}>NÍVEL ALCANÇADO!</Text>
              <Text style={styles.levelUpDesc}>
                Subiste do Nível {gamification?.previous_level} para o Nível {gamification?.current_level}
              </Text>
            </View>
          </View>
        )}

        {/* New badges */}
        {newBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <View style={styles.badgesSectionHeader}>
              <Feather name="award" size={16} color={appTheme.colors.primary} />
              <Text style={styles.badgesSectionTitle}>
                {newBadges.length === 1 ? "Novo badge desbloqueado!" : `${newBadges.length} badges desbloqueados!`}
              </Text>
            </View>
            <View style={styles.badgesRow}>
              {newBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <View style={[styles.badgeIcon, badge.color_hex ? { backgroundColor: badge.color_hex + "22" } : {}]}>
                    <Feather name="award" size={20} color={badge.color_hex ?? appTheme.colors.primary} />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Score hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{label}</Text>
          {quiz && <Text style={styles.heroQuizTitle}>{quiz.title}</Text>}

          <View style={styles.circleContainer}>
            <View style={styles.scoreOuterCircle}>
              <View style={styles.scoreInnerCircle}>
                <Text style={styles.scoreValue}>{pct}%</Text>
                <Text style={styles.scoreLabel}>SCORE FINAL</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {attempt.correct_answers ?? "—"}
              {totalQuestions > 0 ? ` / ${totalQuestions}` : ""}
            </Text>
            <Text style={styles.statDesc}>Respostas correctas</Text>
          </View>

          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statValue, styles.statValueLight]}>
              {formatTime(attempt.time_spent_secs ?? null)}
            </Text>
            <Text style={styles.statDescLight}>Tempo total</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statDesc}>Pontos ganhos</Text>
            {hasBonus && (
              <Text style={styles.statBonus}>+{attempt.bonus_points} bónus</Text>
            )}
          </View>
        </View>

        {/* Pontos breakdown — só quando há bónus */}
        {hasBonus && (
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Pontos base</Text>
              <Text style={styles.breakdownValue}>{attempt.points_earned} pts</Text>
            </View>
            <View style={[styles.breakdownRow, { marginTop: 6 }]}>
              <Text style={styles.breakdownLabel}>Bónus de precisão / velocidade</Text>
              <Text style={[styles.breakdownValue, styles.breakdownValueBonus]}>+{attempt.bonus_points} pts</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("MainTabs", { screen: "QuizList", params: { initialTab: "ranking" } })}
          >
            <Feather name="trending-up" size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Ver Ranking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Quiz", { quizId })}
          >
            <Feather name="refresh-cw" size={16} color={appTheme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Refazer Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Related content */}
        {relatedDocs.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Feather name="book-open" size={18} color={appTheme.colors.primary} />
              <Text style={styles.relatedTitle}>Conteúdos Relacionados</Text>
            </View>
            <Text style={styles.relatedSub}>
              Aprofunda o teu conhecimento com estes conteúdos associados ao quiz.
            </Text>

            {relatedDocs.map((doc) => (
              <Pressable
                key={doc.id}
                style={styles.docCard}
                onPress={() => {
                  const isMedia = doc.document_type === "video" || doc.document_type === "audio";
                  navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: doc.id });
                }}
              >
                <View style={styles.docCardLeft}>
                  <Text style={styles.docType}>
                    {doc.category?.name ?? DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                  </Text>
                  <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                  <Text style={styles.docAuthor} numberOfLines={1}>{doc.author}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={appTheme.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: appTheme.colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 48 },

  // States
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  errorTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    marginTop: 8,
  },
  errorSub: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: appTheme.radius.button,
  },
  retryBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  // Level-up banner
  levelUpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: appTheme.colors.primary,
    padding: 16,
    marginBottom: 12,
  },
  levelUpIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
  },
  levelUpTitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  levelUpDesc: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
  },

  // Badges
  badgesSection: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 16,
    marginBottom: 12,
  },
  badgesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  badgesSectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgeCard: {
    alignItems: "center",
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 10,
    padding: 12,
    minWidth: 80,
    flex: 1,
    maxWidth: "48%",
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },

  // Hero
  heroCard: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: appTheme.colors.primary,
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 28,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 4,
  },
  heroQuizTitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 20,
  },
  circleContainer: { alignItems: "center" },
  scoreOuterCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 8,
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  scoreInnerCircle: { alignItems: "center" },
  scoreValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 34,
    fontWeight: "700",
    color: appTheme.colors.primary,
    lineHeight: 36,
  },
  scoreLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 9,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  statCardDark: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  statValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 4,
  },
  statValueLight: { color: appTheme.colors.surface },
  statDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    textAlign: "center",
  },
  statDescLight: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  statBonus: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.success,
    marginTop: 3,
  },

  // Bonus breakdown
  breakdownCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  breakdownValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  breakdownValueBonus: {
    color: appTheme.colors.success,
  },

  // Actions
  actionSection: {
    gap: 12,
    marginBottom: 32,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 24,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: appTheme.colors.primary,
    paddingVertical: 13,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  // Related content
  relatedSection: {
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 24,
  },
  relatedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  relatedTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  relatedSub: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    elevation: 1,
  },
  docCardLeft: { flex: 1 },
  docType: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  docTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  docAuthor: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
});
