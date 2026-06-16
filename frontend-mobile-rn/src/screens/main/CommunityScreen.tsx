import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { AppButton } from "../../components/AppButton";
import { CommunityTopic } from "../../types/navigation";
import { useCommunity } from "../../hooks/useCommunity";

type FilterType = "all" | "monetary" | "agribusiness" | "oil" | "infrastructure";

const sortDiscussionsByDate = (items: CommunityTopic[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function CommunityScreen() {
  const navigation = useNavigation<any>();
  const { topics } = useCommunity();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const discussions = sortDiscussionsByDate(topics);

  const renderFilter = (label: string, type: FilterType) => {
    const selected = selectedFilter === type;
    return (
      <TouchableOpacity
        key={type}
        onPress={() => setSelectedFilter(type)}
        style={[styles.filterChip, selected && styles.filterChipSelected]}
      >
        <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderDiscussion = ({ item }: { item: CommunityTopic }) => (
    <Pressable style={styles.card} onPress={() => navigation?.navigate("TopicDiscussion", { id: item.id })}>
      <View style={styles.row}>
        <View style={[styles.avatar, item.isPinned ? styles.avatarPinned : styles.avatarDefault]}>
          <Text style={[styles.avatarText, item.isPinned ? styles.avatarTextPinned : styles.avatarTextDefault]}>
            {item.authorInitials}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            {item.isPinned && (
              <View style={[styles.badge, styles.badgePinned]}>
                <Text style={[styles.badgeText, styles.badgeTextPinned]}>DESTAQUE</Text>
              </View>
            )}
            {item.isActive ? (
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={[styles.badgeText, styles.badgeTextActive]}>A DECORRER</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeTerminated]}>
                <Text style={[styles.badgeText, styles.badgeTextTerminated]}>TERMINADO</Text>
              </View>
            )}
            <View style={styles.privacyPill}>
              <Feather name={item.isPrivate ? "lock" : "globe"} size={12} color={appTheme.colors.textMuted} />
              <Text style={styles.privacyText}>{item.isPrivate ? "Privado" : "Público"}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.authorText}>
              <Text style={styles.authorName}>{item.author}</Text> • {item.time}
            </Text>
            <View style={styles.statsRight}>
              <View style={styles.statItem}>
                <Feather name="message-circle" size={14} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{item.replies}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="eye" size={14} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{item.views}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconBtn}>
            <Feather name="arrow-left" size={20} color={appTheme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appTitle}>Economia com História</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowSearch((s) => !s)} style={styles.iconBtn}>
            <Feather name="search" size={20} color={appTheme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="menu" size={20} color={appTheme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="more-vertical" size={20} color={appTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

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

        <View style={styles.filtersWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef}>
            <View style={styles.chipsRow}>
              {renderFilter("Tudo", "all")}
              {renderFilter("História Monetária", "monetary")}
              {renderFilter("Agronegócio", "agribusiness")}
              {renderFilter("Petróleo e Reforma", "oil")}
              {renderFilter("Infraestrutura", "infrastructure")}
            </View>
          </ScrollView>
        </View>

        <FlatList
          data={discussions}
          keyExtractor={(i) => i.id}
          renderItem={renderDiscussion}
          ItemSeparatorComponent={() => <View style={{ height: appTheme.spacing.lg }} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.loadMoreWrap}>
          <Text style={styles.viewMoreLabel}>VER MAIS ARQUIVOS</Text>
          <TouchableOpacity style={styles.loadMoreBtn}>
            <Feather name="chevrons-down" size={18} color={appTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: appTheme.spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 8,
  },
  appTitle: {
    marginLeft: appTheme.spacing.sm,
    fontSize: appTheme.typography.title.fontSize,
    fontWeight: appTheme.typography.title.fontWeight,
    color: appTheme.colors.primary,
  },
  container: {
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xl,
  },
  editorial: {
    marginBottom: appTheme.spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: appTheme.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: appTheme.spacing.sm,
  },
  description: {
    fontSize: appTheme.typography.body.fontSize,
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
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
  badgeActive: {
    backgroundColor: "rgba(4,120,87,0.08)",
  },
  badgeTerminated: {
    backgroundColor: "rgba(107,114,128,0.08)",
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  badgeTextPinned: {
    color: appTheme.colors.primary,
  },
  badgeTextActive: {
    color: "#047857",
  },
  badgeTextTerminated: {
    color: "#6B7280",
  },
  privacyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: appTheme.radius.sm,
  },
  privacyText: {
    marginLeft: 6,
    color: appTheme.colors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: appTheme.spacing.sm,
  },
  cardDescription: {
    color: appTheme.colors.textSecondary,
    marginBottom: appTheme.spacing.sm,
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
    color: appTheme.colors.textMuted,
    fontSize: appTheme.typography.caption.fontSize,
  },
  authorName: {
    color: appTheme.colors.textSecondary,
    fontWeight: "700",
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: appTheme.spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: appTheme.spacing.md,
  },
  statText: {
    marginLeft: 6,
    color: appTheme.colors.textSecondary,
    fontWeight: "700",
  },
  loadMoreWrap: {
    alignItems: "center",
    marginTop: appTheme.spacing.lg,
    marginBottom: appTheme.spacing.xl,
  },
  viewMoreLabel: {
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
