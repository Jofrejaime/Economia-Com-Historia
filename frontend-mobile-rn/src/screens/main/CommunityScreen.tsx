import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { AppButton } from "../../components/AppButton";
import { HeaderBar } from "../../components/HeaderBar";
import { useCommunity } from "../../hooks/useCommunity";
import { communityService } from "../../services/api/communityService";
import type { DiscussionTopic, CommunityCategory } from "../../types/api";

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

export function CommunityScreen() {
  const navigation = useNavigation<any>();
  const { topics, loading, hasMore, fetchTopics, fetchNextPage } = useCommunity();

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    void fetchTopics(true);
    communityService.categories()
      .then(setCategories)
      .catch((e) => console.warn("Erro ao carregar categorias", e));
  }, []);

  const filteredTopics = selectedCategoryId
    ? topics.filter((t) => t.category_id === selectedCategoryId)
    : topics;

  const renderDiscussion = ({ item }: { item: DiscussionTopic }) => {
    const authorName = item.author?.display_name ?? "Autor";
    const initials = authorName.slice(0, 2).toUpperCase();
    const isOpen = item.status === "open";
    const isPrivate = isOpen && item.category?.access_level_id === "restricted";

    return (
      <Pressable
        style={[styles.card, !isOpen && styles.cardTerminated]}
        onPress={() => navigation?.navigate("TopicDiscussion", { id: item.id })}
      >
        <View style={styles.row}>
          <View style={[styles.avatar, item.is_pinned ? styles.avatarPinned : styles.avatarDefault]}>
            <Text style={[styles.avatarText, item.is_pinned ? styles.avatarTextPinned : styles.avatarTextDefault]}>
              {initials}
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              {item.is_pinned && (
                <View style={[styles.badge, styles.badgePinned]}>
                  <Text style={[styles.badgeText, styles.badgeTextPinned]}>DESTAQUE</Text>
                </View>
              )}
              {!isOpen ? (
                <View style={[styles.badge, styles.badgeTerminated]}>
                  <Feather name="x-circle" size={10} color="#6B7280" style={{ marginRight: 3 }} />
                  <Text style={[styles.badgeText, styles.badgeTextTerminated]}>TERMINADO</Text>
                </View>
              ) : isPrivate ? (
                <View style={[styles.badge, styles.badgePrivate]}>
                  <Feather name="lock" size={10} color="#92400E" style={{ marginRight: 3 }} />
                  <Text style={[styles.badgeText, styles.badgeTextPrivate]}>PRIVADO</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgePublic]}>
                  <Feather name="globe" size={10} color="#065F46" style={{ marginRight: 3 }} />
                  <Text style={[styles.badgeText, styles.badgeTextPublic]}>PÚBLICO</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>{item.content}</Text>

            <View style={styles.statsRow}>
              <Text style={styles.authorText}>
                <Text style={styles.authorName}>{authorName}</Text> • {relativeTime(item.created_at)}
              </Text>
              <View style={styles.statsRight}>
                <View style={styles.statItem}>
                  <Feather name="message-circle" size={14} color={appTheme.colors.textMuted} />
                  <Text style={styles.statText}>{item.replies_count}</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="eye" size={14} color={appTheme.colors.textMuted} />
                  <Text style={styles.statText}>{item.views_count}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Economia com História" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.editorial}>
          <Text style={styles.sectionLabel}>ARQUIVO DIGITAL DE IDEIAS</Text>
          <Text style={styles.title}>Comunidade</Text>
          <Text style={styles.description}>
            Um espaço académico dedicado ao debate sobre a evolução das estruturas económicas
            angolanas, do período pré-colonial às reformas contemporâneas.
          </Text>
          <View style={styles.createBtnWrap}>
            <AppButton label="Criar Tópico" onPress={() => navigation?.navigate("CreateTopic")} />
          </View>
        </View>

        {/* Category filters from DB */}
        {categories.length > 0 && (
          <View style={styles.filtersWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef}>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  key="all"
                  onPress={() => setSelectedCategoryId(null)}
                  style={[styles.filterChip, selectedCategoryId === null && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterLabel, selectedCategoryId === null && styles.filterLabelSelected]}>
                    Tudo
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    style={[styles.filterChip, selectedCategoryId === cat.id && styles.filterChipSelected]}
                  >
                    <Text style={[styles.filterLabel, selectedCategoryId === cat.id && styles.filterLabelSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {loading && filteredTopics.length === 0 ? (
          <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginVertical: 32 }} />
        ) : (
          <FlatList
            data={filteredTopics}
            keyExtractor={(i) => i.id}
            renderItem={renderDiscussion}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: appTheme.spacing.lg }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nenhum tópico disponível</Text>
              </View>
            )}
          />
        )}

        {hasMore && !loading && (
          <View style={styles.loadMoreWrap}>
            <Text style={styles.viewMoreLabel}>VER MAIS TÓPICOS</Text>
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => void fetchNextPage()}>
              <Feather name="chevrons-down" size={18} color={appTheme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xl,
  },
  editorial: {
    marginBottom: appTheme.spacing.lg,
  },
  sectionLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: appTheme.spacing.sm,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: appTheme.spacing.sm,
  },
  description: {
    fontFamily: "Source_Sans_3",
    fontSize: appTheme.typography.body.fontSize,
    color: appTheme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: appTheme.spacing.md,
  },
  createBtnWrap: {
    width: 160,
  },
  filtersWrap: {
    marginBottom: appTheme.spacing.lg,
  },
  chipsRow: {
    flexDirection: "row",
    gap: appTheme.spacing.sm,
  },
  filterChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: appTheme.radius.lg,
    backgroundColor: "#EFF4FF",
    marginRight: appTheme.spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: appTheme.colors.primary,
  },
  filterLabel: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontWeight: "700",
  },
  filterLabelSelected: {
    color: appTheme.colors.surface,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 16,
    padding: appTheme.spacing.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    gap: appTheme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarDefault: {
    backgroundColor: "#D9E3F6",
  },
  avatarPinned: {
    backgroundColor: appTheme.colors.primary,
  },
  avatarText: {
    fontFamily: "IBM_Plex_Sans",
    fontWeight: "700",
  },
  avatarTextPinned: {
    color: appTheme.colors.surface,
  },
  avatarTextDefault: {
    color: appTheme.colors.primary,
  },
  cardBody: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: appTheme.spacing.sm,
    marginBottom: appTheme.spacing.sm,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: appTheme.radius.sm,
  },
  badgePinned: {
    backgroundColor: "rgba(139,30,45,0.08)",
  },
  badgeTerminated: {
    backgroundColor: "rgba(107,114,128,0.10)",
    flexDirection: "row",
    alignItems: "center",
  },
  badgePrivate: {
    backgroundColor: "rgba(180,83,9,0.10)",
    flexDirection: "row",
    alignItems: "center",
  },
  badgePublic: {
    backgroundColor: "rgba(6,95,70,0.08)",
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontFamily: "Source_Sans_3",
    fontWeight: "700",
    fontSize: 11,
  },
  badgeTextPinned: {
    color: appTheme.colors.primary,
  },
  badgeTextTerminated: {
    color: "#6B7280",
  },
  badgeTextPrivate: {
    color: "#92400E",
  },
  badgeTextPublic: {
    color: "#065F46",
  },
  cardTerminated: {
    opacity: 0.6,
    backgroundColor: appTheme.colors.background,
  },
  cardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: appTheme.spacing.sm,
    lineHeight: 24,
  },
  cardDescription: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.sm,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: appTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.background,
    paddingTop: appTheme.spacing.sm,
  },
  authorText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: appTheme.typography.caption.fontSize,
    flex: 1,
  },
  authorName: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontWeight: "700",
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: appTheme.spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textMuted,
  },
  loadMoreWrap: {
    alignItems: "center",
    marginTop: appTheme.spacing.lg,
    marginBottom: appTheme.spacing.xl,
  },
  viewMoreLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: appTheme.spacing.sm,
  },
  loadMoreBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#EFF4FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
