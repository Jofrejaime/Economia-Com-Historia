import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { quizService } from "../../services/api/quizService";
import { leaderboardService } from "../../services/api/leaderboardService";
import type { Quiz, LeaderboardEntry } from "../../types/api";

type DifficultyFilter = "all" | "Básico" | "Intermédio" | "Avançado";
type ActiveTab = "quizzes" | "ranking";

function difficultyColor(d: string): string {
  if (d === "Básico") return appTheme.colors.success;
  if (d === "Intermédio") return appTheme.colors.warning;
  if (d === "Avançado") return appTheme.colors.danger;
  return appTheme.colors.textSecondary;
}

export function QuizListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    route.params?.initialTab === "ranking" ? "ranking" : "quizzes"
  );
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [rankingError, setRankingError] = useState(false);
  const [total, setTotal] = useState(0);

  const [firstLoadQuizzes, setFirstLoadQuizzes] = useState(false);
  const [firstLoadRanking, setFirstLoadRanking] = useState(false);

  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchQuizzes = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingQuizzes(true);
    setQuizError(false);
    try {
      const response = await quizService.list({
        difficulty: difficultyFilter === "all" ? undefined : difficultyFilter,
        per_page: 30,
      });
      setQuizzes(response.data);
      setTotal(response.meta.total);
    } catch {
      setQuizError(true);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [difficultyFilter]);

  const fetchCompletedIds = useCallback(async () => {
    if (!user) return;
    try {
      const res = await quizService.myAttempts({ status: "completed", per_page: 100 });
      setCompletedQuizIds(new Set(res.data.map((a) => a.quiz_id)));
    } catch {
      // non-critical
    }
  }, [user]);

  const fetchRanking = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingRanking(true);
    setRankingError(false);
    try {
      const data = await leaderboardService.national({ per_page: 200 });
      setLeaderboard(data);
    } catch {
      setRankingError(true);
    } finally {
      setLoadingRanking(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQuizzes(!firstLoadQuizzes);
      setFirstLoadQuizzes(true);
      void fetchCompletedIds();
      if (activeTab === "ranking") {
        fetchRanking(!firstLoadRanking);
        setFirstLoadRanking(true);
      }
    }, [activeTab, fetchQuizzes, fetchRanking, fetchCompletedIds, firstLoadQuizzes, firstLoadRanking])
  );

  const displayedQuizzes = showCompleted
    ? quizzes.filter((q) => completedQuizIds.has(q.id))
    : quizzes;

  const handleStartQuiz = (quiz: Quiz) => {
    if (!user) {
      navigation.navigate("LoginPrompt", { type: "quiz" });
      return;
    }
    navigation.navigate("Quiz", { quizId: quiz.id });
  };

  const renderQuiz = ({ item }: { item: Quiz }) => (
    <TouchableOpacity style={styles.quizCard} onPress={() => handleStartQuiz(item)}>
      <View style={styles.quizCardHeader}>
        {item.category && (
          <Text style={styles.quizCategory}>{item.category.name}</Text>
        )}
        <View style={[styles.diffBadge, { backgroundColor: difficultyColor(item.difficulty) + "20" }]}>
          <Text style={[styles.diffBadgeText, { color: difficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
        {item.is_featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={appTheme.colors.warning} />
            <Text style={styles.featuredText}>Destaque</Text>
          </View>
        )}
        {user && completedQuizIds.has(item.id) && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={10} color={appTheme.colors.success} />
            <Text style={styles.completedBadgeText}>Realizado</Text>
          </View>
        )}
      </View>

      <Text style={styles.quizTitle} numberOfLines={2}>{item.title}</Text>
      {item.module && (
        <Text style={styles.quizModule}>{item.module}</Text>
      )}
      {item.description && (
        <Text style={styles.quizDesc} numberOfLines={2}>{item.description}</Text>
      )}

      <View style={styles.quizFooter}>
        <View style={styles.quizStat}>
          <Ionicons name="people-outline" size={14} color={appTheme.colors.textMuted} />
          <Text style={styles.quizStatText}>{item.completions_count} completaram</Text>
        </View>
        <View style={styles.quizStat}>
          <Ionicons name="star-outline" size={14} color={appTheme.colors.textMuted} />
          <Text style={styles.quizStatText}>{item.base_points} pts</Text>
        </View>
        {item.time_limit_secs && (
          <View style={styles.quizStat}>
            <Ionicons name="time-outline" size={14} color={appTheme.colors.textMuted} />
            <Text style={styles.quizStatText}>{Math.round(item.time_limit_secs / 60)} min</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={() => handleStartQuiz(item)}>
        <Text style={styles.startBtnText}>Iniciar Quiz</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRankEntry = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = user?.id === item.user_id;
    const isTop3 = item.rank_position <= 3;
    return (
      <View
        style={[
          styles.rankItem,
          item.rank_position === 1 && styles.rankItemGold,
          item.rank_position === 2 && styles.rankItemSilver,
          item.rank_position === 3 && styles.rankItemBronze,
          isCurrentUser && styles.rankItemCurrentUser,
        ]}
      >
        <View style={styles.rankPositionWrap}>
          {item.rank_position === 1 ? (
            <Ionicons name="trophy" size={26} color={appTheme.colors.warning} />
          ) : item.rank_position === 2 ? (
            <Ionicons name="medal" size={26} color={appTheme.colors.textMuted} />
          ) : item.rank_position === 3 ? (
            <Ionicons name="medal" size={26} color={appTheme.colors.warning} />
          ) : (
            <Text style={[styles.rankNumber, isCurrentUser && { color: "white" }]}>
              #{item.rank_position}
            </Text>
          )}
        </View>
        <View style={styles.rankAvatar}>
          <Text style={[styles.rankAvatarText, isTop3 && { color: appTheme.colors.primaryDark }]}>
            {item.display_name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.rankInfo}>
          <Text style={[styles.rankName, isCurrentUser && { color: "white" }]}>
            {item.display_name}{isCurrentUser ? " (você)" : ""}
          </Text>
          {item.province && (
            <Text style={[styles.rankProvince, isCurrentUser && { color: "rgba(255,255,255,0.7)" }]}>
              {item.province}
            </Text>
          )}
        </View>
        <View style={styles.rankPoints}>
          <Text style={[styles.rankPointsValue, isCurrentUser && { color: "white" }]}>
            {item.total_points.toLocaleString()}
          </Text>
          <Text style={[styles.rankPointsLabel, isCurrentUser && { color: "rgba(255,255,255,0.7)" }]}>
            pontos
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Quizzes" showBackButton={false} />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "quizzes" && styles.tabActive]}
          onPress={() => setActiveTab("quizzes")}
        >
          <Ionicons name="help-circle-outline" size={18} color={activeTab === "quizzes" ? "white" : appTheme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "quizzes" && styles.tabTextActive]}>Quizzes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ranking" && styles.tabActive]}
          onPress={() => setActiveTab("ranking")}
        >
          <Ionicons name="trophy-outline" size={18} color={activeTab === "ranking" ? "white" : appTheme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "ranking" && styles.tabTextActive]}>Ranking</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "quizzes" && (
        <>
          {/* Filtros */}
          <View style={styles.filterRow}>
            {(["all", "Básico", "Intermédio", "Avançado"] as DifficultyFilter[]).map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficultyFilter(d)}
                style={[styles.filterChip, difficultyFilter === d && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, difficultyFilter === d && styles.filterChipTextActive]}>
                  {d === "all" ? "Todos" : d}
                </Text>
              </TouchableOpacity>
            ))}
            {user && (
              <TouchableOpacity
                onPress={() => setShowCompleted((v) => !v)}
                style={[styles.filterChip, styles.filterChipCompleted, showCompleted && styles.filterChipCompletedActive]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={13}
                  color={showCompleted ? "white" : appTheme.colors.success}
                />
                <Text style={[styles.filterChipText, showCompleted && styles.filterChipTextActive]}>
                  Realizados
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingQuizzes ? (
            <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginTop: 40 }} />
          ) : quizError ? (
            <View style={styles.errorState}>
              <Feather name="wifi-off" size={40} color={appTheme.colors.textMuted} />
              <Text style={styles.errorStateTitle}>Não foi possível carregar os quizzes</Text>
              <Text style={styles.errorStateSub}>Verifica a tua ligação à internet.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => void fetchQuizzes()}>
                <Feather name="refresh-cw" size={14} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.retryBtnText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={displayedQuizzes}
              keyExtractor={(item) => item.id}
              renderItem={renderQuiz}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <Text style={styles.resultsCount}>
                  {showCompleted
                    ? `${displayedQuizzes.length} ${displayedQuizzes.length === 1 ? "quiz" : "quizzes"} realizados`
                    : `${total} ${total === 1 ? "quiz" : "quizzes"} disponíveis`}
                </Text>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="help-circle-outline" size={48} color={appTheme.colors.textMuted} />
                  <Text style={styles.emptyStateText}>
                    {showCompleted ? "Ainda não realizaste nenhum quiz" : "Nenhum quiz encontrado"}
                  </Text>
                </View>
              )}
            />
          )}
        </>
      )}

      {activeTab === "ranking" && (
        <>
          {loadingRanking ? (
            <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginTop: 40 }} />
          ) : rankingError ? (
            <View style={styles.errorState}>
              <Feather name="wifi-off" size={40} color={appTheme.colors.textMuted} />
              <Text style={styles.errorStateTitle}>Não foi possível carregar o ranking</Text>
              <Text style={styles.errorStateSub}>Verifica a tua ligação à internet.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => void fetchRanking()}>
                <Feather name="refresh-cw" size={14} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.retryBtnText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.user_id}
              renderItem={renderRankEntry}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Ranking ainda não disponível</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: appTheme.radius.sm,
  },
  tabActive: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: appTheme.colors.surface,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: appTheme.radius.pill,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  filterChipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterChipCompleted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderColor: appTheme.colors.successLight,
  },
  filterChipCompletedActive: {
    backgroundColor: appTheme.colors.success,
    borderColor: appTheme.colors.success,
  },
  filterChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: appTheme.colors.surface,
    fontWeight: "700",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: appTheme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.success,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultsCount: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 8,
  },
  // Quiz cards
  quizCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: appTheme.spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.sm,
  },
  quizCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  quizCategory: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.primary,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: appTheme.colors.badgeYellowBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.warning,
    fontWeight: "600",
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
    fontFamily: "IBM_Plex_Sans",
  },
  quizModule: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  quizDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  quizFooter: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  quizStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quizStatText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: appTheme.radius.button,
  },
  startBtnText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  // Ranking
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  rankItemGold: {
    backgroundColor: appTheme.colors.badgeYellowBg,
    borderColor: appTheme.colors.warning,
  },
  rankItemSilver: {
    backgroundColor: appTheme.colors.background,
    borderColor: appTheme.colors.textMuted,
  },
  rankItemBronze: {
    backgroundColor: appTheme.colors.dangerLight,
    borderColor: appTheme.colors.border,
  },
  rankItemCurrentUser: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  rankPositionWrap: {
    width: 40,
    alignItems: "center",
  },
  rankNumber: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankAvatarText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  rankProvince: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 2,
  },
  rankPoints: {
    alignItems: "flex-end",
  },
  rankPointsValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  rankPointsLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    color: appTheme.colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textMuted,
  },
  errorState: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 8,
  },
  errorStateTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  errorStateSub: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: appTheme.radius.button,
    marginTop: 4,
  },
  retryBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
});
