import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { communityService } from "../../services/api/communityService";
import { userService } from "../../services/api/userService";
import { MainStackParamList } from "../../types/navigation";
import { UserProfile } from "../../types/room";

type ManageMembersNavigationProp = NativeStackNavigationProp<MainStackParamList, "ManageMembers">;
type ManageMembersRouteProp = RouteProp<MainStackParamList, "ManageMembers">;

export function ManageMembersScreen() {
  const navigation = useNavigation<ManageMembersNavigationProp>();
  const route = useRoute<ManageMembersRouteProp>();

  const { topicId, topicTitle } = route.params;

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tracks IDs that existed when the screen loaded (to compute removals on save)
  const originalIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoadingMembers(true);
      try {
        const data = await communityService.topicMembers(topicId);
        // Exclude owner — owner cannot be removed
        const nonOwners = data.filter((m) => m.role !== "owner");
        const mapped: UserProfile[] = nonOwners.map((m) => ({
          id: m.user_id,
          name: m.user?.display_name ?? "Membro",
          username: m.user?.full_name ?? m.user?.display_name ?? "membro",
          avatarUri: m.user?.avatar_url ?? null,
        }));
        setMembers(mapped);
        originalIdsRef.current = new Set(mapped.map((m) => m.id));
      } catch {
        Alert.alert("Erro", "Não foi possível carregar os membros.");
      } finally {
        setLoadingMembers(false);
      }
    };
    void load();
  }, [topicId]);

  const searchUsers = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const results = await userService.search(query.trim(), 8);
      const currentIds = new Set(members.map((m) => m.id));
      setSuggestions(
        results
          .filter((r) => !currentIds.has(r.id))
          .map((r) => ({ id: r.id, name: r.display_name, username: r.full_name ?? r.display_name, avatarUri: r.avatar_url }))
      );
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, [members]);

  useEffect(() => {
    const timer = setTimeout(() => { void searchUsers(searchText); }, 300);
    return () => clearTimeout(timer);
  }, [searchText, searchUsers]);

  const handleAdd = useCallback((member: UserProfile) => {
    setMembers((prev) => [...prev, member]);
    setSearchText("");
    setSuggestions([]);
  }, []);

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentIds = new Set(members.map((m) => m.id));

      const toAdd = members.filter((m) => !originalIdsRef.current.has(m.id));
      const toRemove = [...originalIdsRef.current].filter((id) => !currentIds.has(id));

      await Promise.all([
        ...toAdd.map((m) =>
          communityService.inviteMember(topicId, { user_id: m.id, role: "member" }).catch(() => null)
        ),
        ...toRemove.map((id) =>
          communityService.removeMember(topicId, id).catch(() => null)
        ),
      ]);

      // Update baseline so a second save doesn't re-invite/re-remove
      originalIdsRef.current = currentIds;

      const confirm = () => navigation.navigate("TopicDiscussion", { id: topicId });
      if (Platform.OS === "web") {
        window.alert("Círculo de diálogo atualizado com sucesso!");
        confirm();
      } else {
        Alert.alert("Sucesso", "Círculo de diálogo atualizado com sucesso!", [{ text: "OK", onPress: confirm }]);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível guardar as alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Gestão de Membros" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Círculo de Diálogo</Text>
          <Text style={styles.introDesc}>
            Gerencie os membros da discussão{topicTitle ? ` "${topicTitle}"` : ""}. Apenas os membros deste círculo poderão participar ativamente se o fórum for privado.
          </Text>
        </View>

        {/* Membros Actuais */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionSubtitle}>
            Membros Atuais no Círculo ({loadingMembers ? "…" : members.length})
          </Text>

          {loadingMembers ? (
            <ActivityIndicator size="small" color={appTheme.colors.primary} style={{ marginVertical: 16 }} />
          ) : members.length === 0 ? (
            <View style={styles.emptyMembersContainer}>
              <Ionicons name="people-outline" size={36} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyMembersText}>Nenhum membro adicionado a esta sala privada.</Text>
            </View>
          ) : (
            <ScrollView style={styles.currentMembersScroll} nestedScrollEnabled showsVerticalScrollIndicator>
              {members.map((member) => (
                <View key={member.id} style={styles.selectedMemberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberUsername}>@{member.username}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(member.id)} style={styles.removeMemberButton} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={20} color={appTheme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Adicionar Novos Membros */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionSubtitle}>Adicionar Novos Membros</Text>
          <UserSearchBar
            value={searchText}
            onChangeText={setSearchText}
            loading={searching}
            placeholder="Pesquisar por nome..."
          />
          <View style={styles.userListWrapper}>
            <UserList
              users={suggestions}
              selectedUserIds={members.map((m) => m.id)}
              onAddUser={handleAdd}
              loading={searching}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (saving || loadingMembers) && { opacity: 0.6 }]}
          onPress={() => void handleSave()}
          disabled={saving || loadingMembers}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  introHeader: {
    marginBottom: 24,
  },
  introTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  introDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
  },
  formGroup: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userListWrapper: {
    maxHeight: 250,
    marginTop: 10,
  },
  sectionSubtitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    marginBottom: 12,
  },
  selectedMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  memberUsername: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  removeMemberButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: appTheme.colors.primary,
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyMembersContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyMembersText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
  },
  currentMembersScroll: {
    maxHeight: 290,
  },
});
