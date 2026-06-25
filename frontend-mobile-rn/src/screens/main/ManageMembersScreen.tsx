import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCommunity } from "../../hooks/useCommunity";
import { ScreenContainer } from "../../components/ScreenContainer";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { MainStackParamList } from "../../types/navigation";
import { UserProfile } from "../../types/room";

type ManageMembersNavigationProp = NativeStackNavigationProp<MainStackParamList, "ManageMembers">;
type ManageMembersRouteProp = RouteProp<MainStackParamList, "ManageMembers">;

const memberCatalog: UserProfile[] = [
  { id: "u1", name: "Ana Silva", username: "ana.silva", avatarUri: null },
  { id: "u2", name: "Artur Mendes", username: "artur.m", avatarUri: null },
  { id: "u3", name: "Benedito Neves", username: "bneves", avatarUri: null },
  { id: "u4", name: "Carla Domingos", username: "carla.dom", avatarUri: null },
  { id: "u5", name: "Catarina Neto", username: "catarina_n", avatarUri: null },
  { id: "u6", name: "Daniel Gonçalves", username: "dgoncalves", avatarUri: null },
  { id: "u7", name: "Eduardo Loureiro", username: "eduardo_l", avatarUri: null },
  { id: "u8", name: "Fernanda Costa", username: "fernanda.c", avatarUri: null },
  { id: "u9", name: "Gonçalo Silva", username: "goncalo.s", avatarUri: null },
  { id: "u10", name: "João Diogo", username: "joao.diogo", avatarUri: null },
];

export function ManageMembersScreen() {
  const navigation = useNavigation<ManageMembersNavigationProp>();
  const route = useRoute<ManageMembersRouteProp>();
  const { getTopicById } = useCommunity();

  const { topicId, initialMembers } = route.params;
  const topic = getTopicById(topicId);

  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [searchMemberText, setSearchMemberText] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (initialMembers?.length) {
      setSelectedMembers(initialMembers as UserProfile[]);
    }
  }, []);

  const suggestedMembers = useMemo(() => {
    const search = searchMemberText.trim().toLowerCase();
    return memberCatalog
      .filter((member) => {
        const alreadySelected = selectedMembers.some((item) => item.id === member.id);
        const matchesSearch = `${member.name} ${member.username}`.toLowerCase().includes(search);
        return !alreadySelected && matchesSearch;
      })
      .slice(0, 5);
  }, [searchMemberText, selectedMembers]);

  useEffect(() => {
    if (!searchMemberText) {
      setLoadingMembers(false);
      return;
    }

    setLoadingMembers(true);
    const timeout = setTimeout(() => {
      setLoadingMembers(false);
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchMemberText]);

  const handleAddMember = useCallback((member: UserProfile) => {
    setSelectedMembers((prev) => [...prev, member]);
    setSearchMemberText("");
  }, []);

  const handleRemoveMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveChanges = () => {
    const confirm = () => navigation.navigate("TopicDiscussion", { id: topicId });
    if (Platform.OS === "web") {
      window.alert("Círculo de diálogo atualizado com sucesso!");
      confirm();
    } else {
      Alert.alert("Sucesso", "Círculo de diálogo atualizado com sucesso!", [
        { text: "OK", onPress: confirm },
      ]);
    }
  };

  if (!topic) {
    return (
      <ScreenContainer style={styles.screen}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Discussão não encontrada</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

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
            Gerencie os membros da discussão "{topic.title}". Apenas os membros deste círculo poderão participar ativamente se o fórum for privado.
          </Text>
        </View>

        {/* 1. Membros Atuais (visíveis no topo para fácil remoção) */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionSubtitle}>Membros Atuais no Círculo ({selectedMembers.length})</Text>
          
          {selectedMembers.length === 0 ? (
            <View style={styles.emptyMembersContainer}>
              <Ionicons name="people-outline" size={36} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyMembersText}>Nenhum membro adicionado a esta sala privada.</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.currentMembersScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {selectedMembers.map((member) => (
                <View key={member.id} style={styles.selectedMemberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberUsername}>@{member.username}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleRemoveMember(member.id)} 
                    style={styles.removeMemberButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color={appTheme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 2. Adicionar Novos Membros */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionSubtitle}>Adicionar Novos Membros</Text>
          <UserSearchBar
            value={searchMemberText}
            onChangeText={setSearchMemberText}
            loading={loadingMembers}
            placeholder="Pesquisar por nome ou @username..."
          />

          {/* Suggestions list */}
          <View style={styles.userListWrapper}>
            <UserList
              users={suggestedMembers}
              selectedUserIds={selectedMembers.map((member) => member.id)}
              onAddUser={handleAddMember}
              loading={loadingMembers}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backHeaderText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D",
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
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
  },
  formGroup: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  memberUsername: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  removeMemberButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: "#8B1E2D",
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: appTheme.colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "700",
  },
  emptyMembersContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyMembersText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
  },
  currentMembersScroll: {
    maxHeight: 290, // fits exactly 5 items
  },
});
