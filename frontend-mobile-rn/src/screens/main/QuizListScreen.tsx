import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

type LocationFilter = "all" | "luanda" | "benguela" | "huambo" | "lubango";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Fácil" | "Intermédio" | "Avançado";
  questions: number;
  duration: string;
  participants: number;
  location: string;
  author: string;
  authorAvatar: string;
}

interface RankingItem {
  id: string;
  name: string;
  avatar: string;
  score: number;
  quizzesCompleted: number;
  location: string;
}

export function QuizListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"quizzes" | "ranking">("quizzes");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");

  const quizzes: QuizItem[] = [
    {
      id: "1",
      title: "História Económica de Angola: 1975-1990",
      description: "Teste seus conhecimentos sobre o período pós-independência",
      category: "História Monetária",
      difficulty: "Intermédio",
      questions: 15,
      duration: "20 min",
      participants: 1247,
      location: "Luanda",
      author: "Prof. Ana Domingos",
      authorAvatar: "AD",
    },
    {
      id: "2",
      title: "O Kwanza e a Inflação",
      description: "Desafios monetários e políticas económicas",
      category: "Economia",
      difficulty: "Avançado",
      questions: 20,
      duration: "25 min",
      participants: 892,
      location: "Benguela",
      author: "Dr. Carlos Neto",
      authorAvatar: "CN",
    },
    {
      id: "3",
      title: "Petróleo em Angola",
      description: "Da descoberta à dependência económica",
      category: "Recursos Naturais",
      difficulty: "Fácil",
      questions: 10,
      duration: "15 min",
      participants: 2134,
      location: "Luanda",
      author: "Luís Ferreira",
      authorAvatar: "LF",
    },
  ];

  const ranking: RankingItem[] = [
    { id: "1", name: "Ana Domingos", avatar: "AD", score: 2840, quizzesCompleted: 28, location: "Luanda" },
    { id: "2", name: "Carlos Neto", avatar: "CN", score: 2650, quizzesCompleted: 25, location: "Benguela" },
    { id: "3", name: "Maria Santos", avatar: "MS", score: 2480, quizzesCompleted: 24, location: "Huambo" },
    { id: "4", name: "João Mendes", avatar: "JM", score: 2320, quizzesCompleted: 22, location: "Luanda" },
    { id: "5", name: "Pedro Silva", avatar: "PS", score: 2180, quizzesCompleted: 21, location: "Lubango" },
  ];

  const locations = [
    { value: "all", label: "Todas" },
    { value: "luanda", label: "Luanda" },
    { value: "benguela", label: "Benguela" },
    { value: "huambo", label: "Huambo" },
    { value: "lubango", label: "Lubango" },
  ];

  const filteredRanking =
    locationFilter === "all"
      ? ranking
      : ranking.filter((item) => item.location.toLowerCase() === locationFilter);

  const handleStartQuiz = () => {
    if (user) {
      navigation.navigate("Quiz");
    } else {
      navigation.navigate("LoginPrompt", { type: "quiz" });
    }
  };

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <HeaderBar title="Economia com História" showBackButton={false} />

      {/* Tab Buttons */}
      <View style={[styles.gradientHeader, { paddingTop: 12 }]}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab("quizzes")}
            style={[styles.tabButton, activeTab === "quizzes" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === "quizzes" && styles.tabTextActive]}>
              Quizzes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("ranking")}
            style={[styles.tabButton, activeTab === "ranking" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === "ranking" && styles.tabTextActive]}>
              Ranking
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "quizzes" ? (
          <View style={styles.quizzesList}>
            <FlatList
              data={quizzes}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={handleStartQuiz} style={styles.quizCard}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarWrap}>
                      <Text style={styles.avatarText}>{item.authorAvatar}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.authorName}>{item.author}</Text>
                      <Text style={styles.quizTitle}>{item.title}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.quizDesc}>{item.description}</Text>

                  {/* Badges */}
                  <View style={styles.badgesRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.difficultyBadge,
                        item.difficulty === "Fácil"
                          ? styles.difficultyEasy
                          : item.difficulty === "Intermédio"
                          ? styles.difficultyMed
                          : styles.difficultyHard,
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          item.difficulty === "Fácil"
                            ? styles.diffTextEasy
                            : item.difficulty === "Intermédio"
                            ? styles.diffTextMed
                            : styles.diffTextHard,
                        ]}
                      >
                        {item.difficulty}
                      </Text>
                    </View>
                    <View style={styles.locationBadge}>
                      <Feather name="map-pin" size={10} color="#4B5563" style={{ marginRight: 2 }} />
                      <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.cardStatsRow}>
                    <View style={styles.statItem}>
                      <Feather name="award" size={14} color="#9CA3AF" />
                      <Text style={styles.statLabel}>{item.questions} perguntas</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Feather name="clock" size={14} color="#9CA3AF" />
                      <Text style={styles.statLabel}>{item.duration}</Text>
                    </View>
                    <View style={[styles.statItem, { marginLeft: "auto" }]}>
                      <Feather name="users" size={14} color="#9CA3AF" />
                      <Text style={styles.participantCount}>
                        {item.participants.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.rankingSection}>
            {/* Location Filters */}
            <View style={styles.filtersContainer}>
              <View style={styles.filterLabelRow}>
                <Feather name="filter" size={14} color="#6B7280" />
                <Text style={styles.filterTitle}>Filtrar por localidade</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
                {locations.map((loc) => {
                  const active = locationFilter === loc.value;
                  return (
                    <TouchableOpacity
                      key={loc.value}
                      onPress={() => setLocationFilter(loc.value as LocationFilter)}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Ranking List */}
            <FlatList
              data={filteredRanking}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.rankItem,
                    index === 0
                      ? styles.rankItemGold
                      : index === 1
                      ? styles.rankItemSilver
                      : index === 2
                      ? styles.rankItemBronze
                      : styles.rankItemDefault,
                  ]}
                >
                  <View style={styles.rankRow}>
                    {/* Rank Badge */}
                    <View style={[styles.rankNumberBadge, index === 0 ? styles.rankNumberBadgeGold : styles.rankNumberBadgeDefault]}>
                      <Text style={[styles.rankNumberText, index === 0 ? styles.rankTextGold : styles.rankTextDefault]}>
                        #{index + 1}
                      </Text>
                    </View>

                    {/* Avatar */}
                    <View style={[styles.rankAvatar, index === 0 ? styles.rankAvatarGold : styles.rankAvatarDefault]}>
                      <Text style={styles.rankAvatarText}>{item.avatar}</Text>
                    </View>

                    {/* User Info */}
                    <View style={styles.rankInfo}>
                      <Text style={[styles.rankName, index === 0 ? styles.rankNameGold : styles.rankNameDefault]}>
                        {item.name}
                      </Text>
                      <View style={styles.rankInfoSubRow}>
                        <Text style={[styles.rankSubText, index === 0 ? styles.rankSubTextGold : styles.rankSubTextDefault]}>
                          {item.quizzesCompleted} quizzes
                        </Text>
                        <Text style={index === 0 ? styles.dotGold : styles.dotDefault}>•</Text>
                        <View style={styles.locationPill}>
                          <Feather name="map-pin" size={10} color={index === 0 ? "rgba(255,255,255,0.8)" : "#6B7280"} />
                          <Text style={[styles.rankSubText, index === 0 ? styles.rankSubTextGold : styles.rankSubTextDefault]}>
                            {item.location}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Score */}
                    <View style={styles.scoreWrap}>
                      <Text style={[styles.scoreValue, index === 0 ? styles.scoreGold : styles.scoreDefault]}>
                        {item.score}
                      </Text>
                      <Text style={[styles.scoreLabel, index === 0 ? styles.scoreLabelGold : styles.scoreLabelDefault]}>
                        pontos
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FF",
  },
  gradientHeader: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitleWrap: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "white",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: appTheme.colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Bottom bar buffer
  },
  quizzesList: {
    gap: 16,
  },
  quizCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#D9E3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  titleContainer: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 2,
  },
  quizTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 22,
  },
  quizDesc: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#FDF3F4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyEasy: {
    backgroundColor: "#ECFDF5",
  },
  difficultyMed: {
    backgroundColor: "#FFFBEB",
  },
  difficultyHard: {
    backgroundColor: "#FEF2F2",
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "700",
  },
  diffTextEasy: {
    color: "#059669",
  },
  diffTextMed: {
    color: "#D97706",
  },
  diffTextHard: {
    color: "#DC2626",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  cardStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  participantCount: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  rankingSection: {},
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  horizontalChips: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "white",
  },
  rankItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rankItemGold: {
    backgroundColor: appTheme.colors.primary, // Matches #8B1E2D
  },
  rankItemSilver: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#9CA3AF",
  },
  rankItemBronze: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#D1D5DB",
  },
  rankItemDefault: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumberBadgeGold: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  rankNumberBadgeDefault: {
    backgroundColor: "#E5E7EB",
  },
  rankNumberText: {
    fontSize: 16,
    fontWeight: "700",
  },
  rankTextGold: {
    color: "white",
  },
  rankTextDefault: {
    color: "#6B7280",
  },
  rankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rankAvatarGold: {
    backgroundColor: "white",
  },
  rankAvatarDefault: {
    backgroundColor: "#D9E3F6",
  },
  rankAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  rankNameGold: {
    color: "white",
  },
  rankNameDefault: {
    color: "#1F2937",
  },
  rankInfoSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rankSubText: {
    fontSize: 12,
  },
  rankSubTextGold: {
    color: "rgba(255,255,255,0.8)",
  },
  rankSubTextDefault: {
    color: "#6B7280",
  },
  dotGold: {
    color: "rgba(255,255,255,0.6)",
  },
  dotDefault: {
    color: "#D1D5DB",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  scoreGold: {
    color: "white",
  },
  scoreDefault: {
    color: "#4B5563",
  },
  scoreLabel: {
    fontSize: 10,
  },
  scoreLabelGold: {
    color: "rgba(255,255,255,0.7)",
  },
  scoreLabelDefault: {
    color: "#9CA3AF",
  },
});
