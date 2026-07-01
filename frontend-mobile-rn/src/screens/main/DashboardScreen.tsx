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
import { LinearGradient } from "expo-linear-gradient";
import { MediaFormatCards } from "../../components/MediaFormatCards";
import { SectionAccentLine } from "../../components/SectionAccentLine";

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
  const [searchFocused, setSearchFocused] = useState(false);

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
        communityService.topics({ sort: "recent", per_page: 2, status: "published" }),
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
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <TouchableOpacity onPress={handleSearchSubmit} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
            <Ionicons
              name="search"
              size={18}
              color={searchFocused ? appTheme.colors.primary : appTheme.colors.textMuted}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar conteúdo..."
            placeholderTextColor={appTheme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            selectionColor={appTheme.colors.primary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            >
              <Ionicons name="close-circle" size={18} color={appTheme.colors.textMuted} />
            </TouchableOpacity>
          )}
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
              style={styles.exploreButtonOuter}
              activeOpacity={0.85}
              onPress={() => (navigation as any).navigate("MainTabs", { screen: "Content", params: { access_level_id: "jindungo" } })}
            >
              <LinearGradient
                colors={[appTheme.colors.primary, appTheme.colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreButton}
              >
                <Ionicons name="flame" size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.exploreButtonText}>Explorar mais Jindungo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Documentos Recentes */}
        {recentDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.recentHeader}>
              <View>
                <Text style={styles.sectionTitle}>Documentos Recentes</Text>
                <SectionAccentLine marginBottom={0} />
              </View>
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
                duration={doc.author}
                documentType={doc.document_type}
                accessLevelId={doc.access_level_id}
                onPress={() => handleOpenDocument(doc.id)}
              />
            ))}
          </View>
        )}

        {/* Vídeos e Áudios */}
        <View style={styles.section}>
          <Text style={styles.mediaSectionTitle}>Vídeos e Áudios</Text>
          <SectionAccentLine />
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
            <SectionAccentLine />
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.user_id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const isFirst = item.rank_position === 1;
                const innerContent = (
                  <>
                    <View style={styles.rankContainer}>
                      <View
                        style={[
                          styles.rankBadge,
                          {
                            backgroundColor: isFirst
                              ? "rgba(255,255,255,0.2)"
                              : item.rank_position <= 3
                              ? appTheme.colors.rankingCardSecondary
                              : appTheme.colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankNumber,
                            { color: isFirst ? appTheme.colors.surface : item.rank_position <= 3 ? appTheme.colors.rankingCardGray : appTheme.colors.textMuted },
                          ]}
                        >
                          #{item.rank_position}
                        </Text>
                      </View>
                      <View style={isFirst ? styles.rankingUserAvatarFirst : styles.rankingUserAvatarDefault}>
                        <Text style={isFirst ? styles.rankingUserAvatarFirstText : styles.rankingUserAvatarDefaultText}>
                          {isFirst ? "👤" : (item.display_name?.slice(0, 2).toUpperCase() ?? "?")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userNameText, { color: isFirst ? "white" : appTheme.colors.textPrimary }]}>
                        {item.display_name}
                      </Text>
                      {item.province && (
                        <Text style={[styles.userRoleText, { color: isFirst ? "rgba(255,255,255,0.8)" : appTheme.colors.rankingCardGray }]}>
                          {item.province}
                        </Text>
                      )}
                    </View>
                    <View style={styles.pointsContainer}>
                      <Text style={[styles.pointsNumberText, { color: isFirst ? "white" : appTheme.colors.textPrimary }]}>
                        {item.total_points}
                      </Text>
                      <Text style={[styles.pointsLabelText, { color: isFirst ? "rgba(255,255,255,0.7)" : appTheme.colors.textMuted }]}>
                        pontos
                      </Text>
                    </View>
                  </>
                );
                if (isFirst) {
                  return (
                    <LinearGradient
                      colors={[appTheme.colors.primary, appTheme.colors.primaryGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.rankingItem, styles.rankingItemFirst]}
                    >
                      {innerContent}
                    </LinearGradient>
                  );
                }
                return (
                  <View style={[
                    styles.rankingItem,
                    item.rank_position === 2 && styles.rankingItemSecond,
                    item.rank_position === 3 && styles.rankingItemThird,
                    item.rank_position > 3 && styles.rankingItemDefault,
                  ]}>
                    {innerContent}
                  </View>
                );
              }}
            />
            <TouchableOpacity
              style={styles.rankingFullButton}
              onPress={() => (navigation as any).navigate("MainTabs", { screen: "QuizList" })}
            >
              <Text style={styles.rankingFullButtonText}>Ver ranking completo</Text>
              <Ionicons name="arrow-forward" size={18} color={appTheme.colors.textSecondary} />
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
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 22,
  },
  userName: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.4,
    marginVertical: 4,
  },
  date: {
    fontFamily: "Source_Sans_3",
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
    fontFamily: "Source_Sans_3",
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBarFocused: {
    borderColor: appTheme.colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    fontFamily: "Source_Sans_3",
    // @ts-ignore — remove focus outline on web/new arch
    outlineWidth: 0,
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
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.36,
    marginLeft: 8,
  },
  sectionSubTitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  mediaSectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.36,
    marginBottom: 4,
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
    fontFamily: "Source_Sans_3",
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
    fontFamily: "Source_Sans_3",
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  jindungoCategoryText: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 18,
  },
  jindungoCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    lineHeight: 20,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  jindungoCardDesc: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 12,
  },
  jindungoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jindungoMetaText: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  exploreButtonOuter: {
    marginTop: 8,
    borderRadius: appTheme.radius.button,
    overflow: "hidden",
  },
  exploreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  exploreButtonText: {
    fontFamily: "Source_Sans_3",
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  // Ranking
  rankingHeaderTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.48,
    lineHeight: 31,
    marginBottom: 4,
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
    borderColor: appTheme.colors.primary,
  },
  rankingItemSecond: {
    backgroundColor: appTheme.colors.background,
    borderLeftWidth: 4,
    borderLeftColor: appTheme.colors.textMuted,
  },
  rankingItemThird: {
    backgroundColor: appTheme.colors.background,
    borderLeftWidth: 4,
    borderLeftColor: appTheme.colors.border,
  },
  rankingItemDefault: {
    backgroundColor: appTheme.colors.surface,
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
    backgroundColor: appTheme.colors.userAvatarBg,
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
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
  },
  userRoleText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsNumberText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
  },
  pointsLabelText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
  },
  rankingFullButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
    paddingVertical: 14,
    borderRadius: appTheme.radius.sm,
    marginTop: 10,
    gap: 8,
  },
  rankingFullButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
});
