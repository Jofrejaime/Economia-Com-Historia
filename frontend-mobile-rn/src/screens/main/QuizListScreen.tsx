import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
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
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("quizzes");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    try {
      const response = await quizService.list({
        difficulty: difficultyFilter === "all" ? undefined : difficultyFilter,
        per_page: 30,
      });
      setQuizzes(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.warn("Erro ao carregar quizzes", error);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [difficultyFilter]);

  const fetchRanking = useCallback(async () => {
    if (leaderboard.length > 0) return;
    setLoadingRanking(true);
    try {
      const data = await leaderboardService.national({ per_page: 50 });
      setLeaderboard(data);
    } catch (error) {
      console.warn("Erro ao carregar ranking", error);
    } finally {
      setLoadingRanking(false);
    }
  }, [leaderboard.length]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    if (activeTab === "ranking") {
      fetchRanking();
    }
  }, [activeTab, fetchRanking]);

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
          {item.rank_position <= 3 ? (
            <Text style={styles.rankMedal}>
              {item.rank_position === 1 ? "🥇" : item.rank_position === 2 ? "🥈" : "🥉"}
            </Text>
          ) : (
            <Text style={[styles.rankNumber, isCurrentUser && { color: "white" }]}>
              #{item.rank_position}
            </Text>
          )}
        </View>
        <View style={styles.rankAvatar}>
          <Text style={[styles.rankAvatarText, isTop3 && { color: "#6B0119" }]}>
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
          {/* Difficulty filter */}
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
          </View>

          {loadingQuizzes ? (
            <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={quizzes}
              keyExtractor={(item) => item.id}
              renderItem={renderQuiz}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <Text style={styles.resultsCount}>{total} {total === 1 ? "quiz" : "quizzes"} disponíveis</Text>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="help-circle-outline" size={48} color={appTheme.colors.textMuted} />
                  <Text style={styles.emptyStateText}>Nenhum quiz encontrado</Text>
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
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
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
    color: "white",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: "white",
  },
  filterChipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "700",
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: "#FBBF24",
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
    paddingVertical: 12,
    borderRadius: appTheme.radius.button,
  },
  startBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: "white",
    fontWeight: "700",
    fontSize: 14,
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
    backgroundColor: "white",
  },
  rankItemGold: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FBBF24",
  },
  rankItemSilver: {
    backgroundColor: "#F5F5F5",
    borderColor: "#9CA3AF",
  },
  rankItemBronze: {
    backgroundColor: "#FEF3F2",
    borderColor: "#D1D5DB",
  },
  rankItemCurrentUser: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  rankPositionWrap: {
    width: 40,
    alignItems: "center",
  },
  rankMedal: {
    fontSize: 24,
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
    backgroundColor: "#DEE9FC",
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
});
