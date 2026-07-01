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
  const { attemptId, quizId } = route.params;

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);

  useEffect(() => {
    const load = async () => {
      const [attemptRes, quizRes, questionsRes, docsRes] = await Promise.allSettled([
        quizService.getAttempt(attemptId),
        quizService.detail(quizId),
        quizService.questions(quizId),
        quizService.relatedDocuments(quizId),
      ]);
      if (attemptRes.status === "fulfilled") setAttempt(attemptRes.value);
      if (quizRes.status === "fulfilled") setQuiz(quizRes.value);
      if (questionsRes.status === "fulfilled") setTotalQuestions(questionsRes.value.length);
      if (docsRes.status === "fulfilled") setRelatedDocs(docsRes.value);
      setLoading(false);
    };
    load();
  }, [attemptId, quizId]);

  const pct = attempt ? Math.round(attempt.score) : 0;
  const label = scoreLabel(pct);

  if (loading) {
    return (
      <ScreenContainer style={{ paddingHorizontal: 0 }}>
        <HeaderBar title="Resultado Final" onBackPress={() => navigation.navigate("MainTabs", { screen: "QuizList" })} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Resultado Final" onBackPress={() => navigation.navigate("MainTabs", { screen: "QuizList" })} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {attempt?.correct_answers ?? "—"}
              {totalQuestions > 0 ? ` / ${totalQuestions}` : ""}
            </Text>
            <Text style={styles.statDesc}>Respostas corretas</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statValue, styles.statValueLight]}>
              {formatTime(attempt?.time_spent_secs ?? null)}
            </Text>
            <Text style={styles.statDescLight}>Tempo total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{attempt?.points_earned ?? 0}</Text>
            <Text style={styles.statDesc}>Pontos ganhos</Text>
          </View>
        </View>

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
                onPress={() => navigation.navigate("Article", { id: doc.id })}
              >
                <View style={styles.docCardLeft}>
                  <Text style={styles.docType}>
                    {doc.category?.name ?? DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                  </Text>
                  <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                  <Text style={styles.docAuthor} numberOfLines={1}>{doc.author}</Text>
                </View>
                <View style={styles.docCardRight}>
                  <Feather name="chevron-right" size={18} color={appTheme.colors.textMuted} />
                </View>
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
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Hero
  heroCard: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: appTheme.colors.primary,
    padding: 24,
    marginBottom: 20,
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    marginBottom: 24,
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

  // Actions
  actionSection: {
    gap: 12,
    marginBottom: 32,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 24,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: appTheme.colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: "IBM_Plex_Sans",
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
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  docCardLeft: { flex: 1 },
  docCardRight: { marginLeft: 8 },
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
