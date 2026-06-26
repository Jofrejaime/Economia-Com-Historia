import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { ContentCard } from "../../components/ContentCard";
import { DebateCard } from "../../components/DebateCard";
import { appTheme } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../types/navigation";
import { documentService } from "../../services/api/documentService";
import { leaderboardService } from "../../services/api/leaderboardService";
import { communityService } from "../../services/api/communityService";
import type { Document, DiscussionTopic, LeaderboardEntry } from "../../types/api";
import { useNotifications } from "../../context/NotificationContext";
import { MediaFormatCards } from "../../components/MediaFormatCards";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Agora mesmo";
  if (diffH < 24) return `Há ${diffH}h`;
  if (diffD === 1) return "Ontem";
  if (diffD < 7) return `Há ${diffD} dias`;
  return date.toLocaleDateString("pt-AO", { day: "numeric", month: "short" });
}

function academicLevelLabel(level: string): string {
  if (level === "intro") return "Introdução";
  if (level === "advanced") return "Avançado";
  if (level === "doctorate") return "Doutoramento";
  return level;
}

function getFormattedDate(): string {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const today = new Date();
  return `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;
}

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { unreadCount } = useNotifications();
  const [searchText, setSearchText] = useState("");

  const [jindungoDocuments, setJindungoDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [activeTopics, setActiveTopics] = useState<DiscussionTopic[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jindungoRes, recentRes, topicsRes, rankingRes] = await Promise.allSettled([
        documentService.list({ access_level_id: "jindungo", per_page: 3 }),
        documentService.list({ sort: "recent", per_page: 4 }),
        communityService.topics({ sort: "recent", per_page: 2 }),
        leaderboardService.national({ per_page: 5 }),
      ]);

      if (jindungoRes.status === "fulfilled") setJindungoDocuments(jindungoRes.value.data);
      if (recentRes.status === "fulfilled") setRecentDocuments(recentRes.value.data);
      if (topicsRes.status === "fulfilled") setActiveTopics(topicsRes.value.data);
      if (rankingRes.status === "fulfilled") setLeaderboard(rankingRes.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      (navigation as any).navigate("MainTabs", {
        screen: "Content",
        params: { searchQuery: searchText.trim() },
      });
      setSearchText("");
    }
  };

  const handleOpenDocument = (id: string) => {
    navigation.navigate("Article", { id });
  };

  const handleOpenDiscussion = (id: string) => {
    navigation.navigate("TopicDiscussion", { id });
  };

  if (loading) {
    return (
      <ScreenContainer style={{ paddingHorizontal: 0 }}>
        <HeaderBar title="Economia com História" showBackButton={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Economia com História" showBackButton={false} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.userName}>{user?.display_name || "Leitor"}</Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={appTheme.colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleSearchSubmit}>
            <Ionicons name="search" size={20} color={appTheme.colors.primary} style={styles.searchIcon} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar conteúdo..."
            placeholderTextColor={appTheme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Jindungo Section */}
        {jindungoDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={20} color={appTheme.colors.danger} />
              <Text style={styles.sectionTitle}>JINDUNGO</Text>
            </View>
            <Text style={styles.sectionSubTitle}>Conteúdo premium sobre economia angolana</Text>
            {jindungoDocuments.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.jindungoCard}
                onPress={() => handleOpenDocument(doc.id)}
              >
                <View style={styles.jindungoCardContent}>
                  <View style={styles.jindungoBadgeRow}>
                    <View style={styles.jindungoBadge}>
                      <Ionicons name="flame" size={12} color="white" />
                      <Text style={styles.jindungoBadgeText}>JINDUNGO</Text>
                    </View>
                    {doc.category && (
                      <Text style={styles.jindungoCategoryText}>{doc.category.name}</Text>
                    )}
                  </View>
                  <Text style={styles.jindungoCardTitle} numberOfLines={2}>{doc.title}</Text>
                  <Text style={styles.jindungoCardDesc} numberOfLines={2}>{doc.summary}</Text>
                  <View style={styles.jindungoMeta}>
                    <Text style={styles.jindungoMetaText}>{doc.author}</Text>
                    <Text style={styles.jindungoMetaText}>
                      <Ionicons name="heart-outline" size={12} /> {doc.likes_count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => (navigation as any).navigate("MainTabs", { screen: "Content", params: { access_level_id: "jindungo" } })}
            >
              <Ionicons name="flame" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.exploreButtonText}>Explorar mais Jindungo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Documentos Recentes */}
        {recentDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Documentos Recentes</Text>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate("MainTabs", { screen: "Content" })}
                style={styles.seeAllRow}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Ionicons name="arrow-forward" size={14} color={appTheme.colors.primary} />
              </TouchableOpacity>
            </View>
            {recentDocuments.map((doc) => (
              <ContentCard
                key={doc.id}
                title={doc.title}
                image={doc.cover_image_url ?? undefined}
                difficulty={academicLevelLabel(doc.academic_level)}
                duration={doc.author}
                onPress={() => handleOpenDocument(doc.id)}
              />
            ))}
          </View>
        )}

        {/* Vídeos e Áudios */}
        <View style={styles.section}>
          <Text style={styles.mediaSectionTitle}>Vídeos e Áudios</Text>
          <MediaFormatCards
            onPressVideo={() => (navigation as any).navigate("Content", { document_type: "video" })}
            onPressAudio={() => (navigation as any).navigate("Content", { document_type: "audio" })}
          />
        </View>

        {/* Debates Activos */}
        {activeTopics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color={appTheme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Debates Activos</Text>
            </View>
            {activeTopics.map((topic) => (
              <DebateCard
                key={topic.id}
                title={topic.title}
                replies={topic.replies_count}
                activeSince={formatRelativeDate(topic.last_reply_at ?? topic.created_at)}
                isHighlight={topic.is_featured || topic.is_pinned}
                onPress={() => handleOpenDiscussion(topic.id)}
              />
            ))}
          </View>
        )}

        {/* Ranking */}
        {leaderboard.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.rankingHeaderTitle}>Ranking</Text>
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.user_id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.rankingItem,
                    item.rank_position === 1 && styles.rankingItemFirst,
                    item.rank_position === 2 && styles.rankingItemSecond,
                    item.rank_position === 3 && styles.rankingItemThird,
                    item.rank_position > 3 && styles.rankingItemDefault,
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor:
                            item.rank_position === 1
                              ? "rgba(255,255,255,0.2)"
                              : item.rank_position <= 3
                              ? "#E5E7EB"
                              : "#F5F5F5",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankNumber,
                          { color: item.rank_position === 1 ? "white" : item.rank_position <= 3 ? "#6B7280" : "#9CA3AF" },
                        ]}
                      >
                        #{item.rank_position}
                      </Text>
                    </View>
                    <View style={item.rank_position === 1 ? styles.rankingUserAvatarFirst : styles.rankingUserAvatarDefault}>
                      <Text style={item.rank_position === 1 ? styles.rankingUserAvatarFirstText : styles.rankingUserAvatarDefaultText}>
                        {item.rank_position === 1 ? "👤" : (item.display_name?.slice(0, 2).toUpperCase() ?? "?")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userNameText, { color: item.rank_position === 1 ? "white" : appTheme.colors.textPrimary }]}>
                      {item.display_name}
                    </Text>
                    {item.province && (
                      <Text style={[styles.userRoleText, { color: item.rank_position === 1 ? "rgba(255,255,255,0.8)" : "#6B7280" }]}>
                        {item.province}
                      </Text>
                    )}
                  </View>
                  <View style={styles.pointsContainer}>
                    <Text style={[styles.pointsNumberText, { color: item.rank_position === 1 ? "white" : appTheme.colors.textPrimary }]}>
                      {item.total_points}
                    </Text>
                    <Text style={[styles.pointsLabelText, { color: item.rank_position === 1 ? "rgba(255,255,255,0.7)" : "#9CA3AF" }]}>
                      pontos
                    </Text>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.rankingFullButton}
              onPress={() => (navigation as any).navigate("MainTabs", { screen: "QuizList" })}
            >
              <Text style={styles.rankingFullButtonText}>Ver ranking completo</Text>
              <Ionicons name="arrow-forward" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  notificationBell: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: appTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 24,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: appTheme.colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginLeft: 8,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 16,
  },
  mediaSectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 12,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: appTheme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Jindungo cards
  jindungoCard: {
    borderRadius: 12,
    backgroundColor: "#1A0A0A",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
  },
  jindungoCardContent: {
    padding: 16,
  },
  jindungoBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  jindungoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jindungoBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  jindungoCategoryText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  jindungoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    lineHeight: 20,
    marginBottom: 6,
  },
  jindungoCardDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  jindungoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jindungoMetaText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  exploreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  exploreButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  // Ranking
  rankingHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  rankingItemFirst: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  rankingItemSecond: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#9CA3AF",
  },
  rankingItemThird: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#D1D5DB",
  },
  rankingItemDefault: {
    backgroundColor: "white",
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontWeight: "700",
    fontSize: 14,
  },
  rankingUserAvatarFirst: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  rankingUserAvatarFirstText: {
    fontSize: 20,
  },
  rankingUserAvatarDefault: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D9E3F6",
    justifyContent: "center",
    alignItems: "center",
  },
  rankingUserAvatarDefaultText: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userRoleText: {
    fontSize: 12,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsNumberText: {
    fontSize: 18,
    fontWeight: "700",
  },
  pointsLabelText: {
    fontSize: 10,
  },
  rankingFullButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  rankingFullButtonText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 14,
  },
});
