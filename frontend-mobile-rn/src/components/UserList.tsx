import React, { useCallback } from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";
import { UserProfile } from "../types/room";

interface UserListProps {
  users: UserProfile[];
  selectedUserIds: string[];
  onAddUser: (user: UserProfile) => void;
  loading?: boolean;
}

export function UserList({
  users,
  selectedUserIds,
  onAddUser,
  loading = false,
}: UserListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<UserProfile>) => {
      const isAdded = selectedUserIds.includes(item.id);

      return (
        <View style={styles.card}>
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              {item.avatarUri ? (
                <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileUsername}>@{item.username}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isAdded && styles.addedButton]}
            onPress={() => onAddUser(item)}
            activeOpacity={0.75}
            disabled={isAdded}
          >
            <Ionicons
              name={isAdded ? "checkmark" : "add"}
              size={18}
              color={isAdded ? appTheme.colors.surface : appTheme.colors.primary}
            />
            <Text style={[styles.addButtonText, isAdded && styles.addedButtonText]}>
              {isAdded ? "Adicionado" : "Adicionar"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [onAddUser, selectedUserIds]
  );

  const emptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={40} color={appTheme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Nenhum utilizador encontrado</Text>
      <Text style={styles.emptySubtitle}>Tente outro nome, @username ou ajuste a pesquisa.</Text>
    </View>
  );

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={!loading ? emptyComponent : undefined}
      ListFooterComponent={<View style={{ height: 32 }} />}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 10,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...appTheme.shadow.sm,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.userAvatarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: appTheme.radius.lg,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  avatarFallbackText: {
    ...appTheme.typography.body,
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    ...appTheme.typography.body,
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileUsername: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: appTheme.radius.button,
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
    backgroundColor: "transparent",
  },
  addedButton: {
    borderColor: appTheme.colors.success,
    backgroundColor: appTheme.colors.successLight,
  },
  addButtonText: {
    ...appTheme.typography.labelBold,
    color: appTheme.colors.primary,
    marginLeft: 8,
  },
  addedButtonText: {
    color: appTheme.colors.success,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...appTheme.typography.titleSmall,
    marginTop: 14,
    color: appTheme.colors.textPrimary,
  },
  emptySubtitle: {
    ...appTheme.typography.caption,
    marginTop: 8,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
  },
});
