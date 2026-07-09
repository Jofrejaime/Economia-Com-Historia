import React, { useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { useNotifications } from "../../context/NotificationContext";
import type { Notification } from "../../types/api";

function iconForType(type: string): { name: keyof typeof Feather.glyphMap; bg: string; color: string } {
  switch (type) {
    case "document_published":
    case "document_liked":
      return { name: "file-text", bg: appTheme.colors.badgeLightBg, color: appTheme.colors.videoColor };
    case "quiz_result":
    case "badge_earned":
    case "level_up":
      return { name: "award", bg: appTheme.colors.badgeYellowBg, color: appTheme.colors.warning };
    case "topic_reply":
    case "reply_liked":
      return { name: "message-circle", bg: appTheme.colors.debateHighlightBg, color: appTheme.colors.primary };
    case "access_request_approved":
    case "subscription_approved":
      return { name: "unlock", bg: appTheme.colors.successLight, color: appTheme.colors.success };
    case "access_request_rejected":
    case "subscription_rejected":
      return { name: "lock", bg: appTheme.colors.dangerLight, color: appTheme.colors.danger };
    case "subscription_cancelled":
      return { name: "lock", bg: appTheme.colors.dangerLight, color: appTheme.colors.danger };
    case "access_granted":
    case "access_requested":
      return { name: "shield", bg: appTheme.colors.successLight, color: appTheme.colors.success };
    case "topic_invitation":
      return { name: "user-plus", bg: appTheme.colors.debateHighlightBg, color: appTheme.colors.primary };
    case "topic_joined":
      return { name: "users", bg: appTheme.colors.debateHighlightBg, color: appTheme.colors.primary };
    case "topic_removed":
      return { name: "user-x", bg: appTheme.colors.dangerLight, color: appTheme.colors.danger };
    default:
      return { name: "bell", bg: appTheme.colors.background, color: appTheme.colors.rankingCardGray };
  }
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  const weeks = Math.floor(days / 7);
  return `Há ${weeks} sem`;
}

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      void fetchNotifications();
    }, [fetchNotifications])
  );

  const DOCUMENT_NOTIFICATION_TYPES = [
    "access_request_approved",
    "subscription_approved",
    "subscription_rejected",
    "subscription_cancelled",
  ];

  const handlePress = (item: Notification) => {
    if (!item.is_read) {
      void markAsRead(item.id);
    }
    if (DOCUMENT_NOTIFICATION_TYPES.includes(item.type) && item.data?.document_id) {
      const isMedia = item.data.media_type != null && item.data.media_type !== "TEXT";
      const screen = isMedia ? "MediaDetail" : "Article";
      navigation.navigate(screen, { id: item.data.document_id });
    } else if (item.type === "topic_invitation" && item.reference_id) {
      navigation.navigate("TopicDiscussion", { id: item.reference_id });
    } else if (item.type === "topic_joined" && item.reference_id) {
      navigation.navigate("TopicDiscussion", { id: item.reference_id });
    } else if (item.type === "topic_removed") {
      navigation.navigate("MainTabs", { screen: "Community" });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = iconForType(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, !item.is_read ? styles.cardUnread : styles.cardRead]}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconContainer, { backgroundColor: !item.is_read ? appTheme.colors.primary : icon.bg }]}>
            <Feather
              name={icon.name}
              size={20}
              color={!item.is_read ? "white" : icon.color}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.cardBody} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.cardTime}>{relativeTime(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Notificações" />

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.unreadLabel}>{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}</Text>
          <TouchableOpacity onPress={() => void markAllAsRead()} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done-outline" size={16} color={appTheme.colors.primary} />
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather name="bell-off" size={48} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Sem notificações</Text>
              <Text style={styles.emptyText}>Quando houver atividade, as notificações aparecerão aqui.</Text>
            </View>
          )}
          ListFooterComponent={() =>
            notifications.length > 0 ? (
              <Text style={styles.footerText}>Todas as notificações carregadas</Text>
            ) : null
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  unreadLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  markAllText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  listContent: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardUnread: {
    borderColor: appTheme.colors.primary,
    ...appTheme.shadow.sm,
  },
  cardRead: {
    borderColor: appTheme.colors.border,
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appTheme.colors.primary,
    marginLeft: 8,
    flexShrink: 0,
  },
  cardBody: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    color: appTheme.colors.rankingCardGray,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardTime: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  emptyText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    color: appTheme.colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  footerText: {
    fontFamily: appTheme.fontFamily.body,
    textAlign: "center",
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 16,
  },
});
