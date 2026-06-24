import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";
import { ScreenContainer } from "../../components/ScreenContainer";
import { CategorySelect } from "../../components/CategorySelect";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import { CategoryGroup, CategoryOption, RoomPayload, UserProfile } from "../../types/room";

const categoryGroups: CategoryGroup[] = [
  {
    title: "Temas Econômicos",
    categories: [
      { id: "c1", label: "Política Monetária", group: "Temas Econômicos", description: "Discussões sobre inflação, juros e câmbio." },
      { id: "c2", label: "Desenvolvimento Sustentável", group: "Temas Econômicos", description: "Conexões entre economia e impacto ambiental." },
    ],
  },
  {
    title: "História e Sociedade",
    categories: [
      { id: "c3", label: "Economia Colonial", group: "História e Sociedade", description: "Temas de comércio, escravidão e cidades portuárias." },
      { id: "c4", label: "Infraestrutura e Crescimento", group: "História e Sociedade", description: "Projetos e mudanças nas redes de transporte." },
    ],
  },
];

const mockUsers: UserProfile[] = [
  { id: "u1", name: "Mariana Fonseca", username: "mfonseca", avatarUri: null, role: "Moderadora" },
  { id: "u2", name: "Lucas Andrade", username: "lucas.andrade", avatarUri: null, role: "Professor" },
  { id: "u3", name: "Sofia Carvalho", username: "sofiacarv", avatarUri: null, role: "Investigadora" },
  { id: "u4", name: "Rafael Souza", username: "rafael_s", avatarUri: null, role: "Analista" },
  { id: "u5", name: "Beatriz Almeida", username: "beatriz_a", avatarUri: null, role: "Estudante" },
  { id: "u6", name: "Henrique Lopes", username: "hlopes", avatarUri: null, role: "Editor" },
];

export function CreateRoomScreen() {
  const [roomTitle, setRoomTitle] = useState("Sala de Debate Comunitário");
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(searchTerm.length > 0);
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (query.length === 0) {
      return mockUsers;
    }

    return mockUsers.filter((user) => {
      const content = `${user.name} ${user.username}`.toLowerCase();
      return content.includes(query);
    });
  }, [searchTerm]);

  const selectedIds = useMemo(
    () => selectedUsers.map((user) => user.id),
    [selectedUsers]
  );

  const handleAddUser = useCallback(
    (user: UserProfile) => {
      if (selectedIds.includes(user.id)) {
        return;
      }
      setSelectedUsers((prev) => [...prev, user]);
    },
    [selectedIds]
  );

  const handleSaveRoom = () => {
    if (!selectedCategory) {
      Alert.alert("Categoria necessária", "Escolha uma categoria para criar a sala virtual.");
      return;
    }

    const payload: RoomPayload = {
      title: roomTitle,
      category: selectedCategory,
      members: selectedUsers,
    };

    // Aqui você integraria com uma API REST.
    console.log("Payload de nova sala:", payload);
    Alert.alert("Sala criada", "A sala virtual foi preparada com sucesso.");
  };

  return (
    <ScreenContainer style={[styles.screen, { paddingHorizontal: 0 }]}>
      <HeaderBar title="Criar Sala" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { marginBottom: 24 }]}>
            Configure a sala com categorias, convide membros e comece a colaborar num ambiente moderno.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações da sala</Text>
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Nome da sala</Text>
              <Text style={styles.controlValue}>{roomTitle}</Text>
            </View>
            <CategorySelect
              groups={categoryGroups}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.membersHeader}>
              <Text style={styles.sectionTitle}>Convidar utilizadores</Text>
              <Text style={styles.sectionMeta}>{selectedUsers.length} convidados</Text>
            </View>

            <UserSearchBar
              value={searchTerm}
              onChangeText={setSearchTerm}
              loading={loading}
            />

            <UserList
              users={filteredUsers}
              selectedUserIds={selectedIds}
              onAddUser={handleAddUser}
              loading={loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !selectedCategory && styles.saveButtonDisabled]}
            onPress={handleSaveRoom}
            activeOpacity={0.85}
            disabled={!selectedCategory}
          >
            <Ionicons name="rocket-outline" size={20} color="#FFF" style={styles.saveButtonIcon} />
            <Text style={styles.saveButtonText}>Salvar sala virtual</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
  },
  keyboardWrapper: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
  },
  controlCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  controlLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  controlValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: appTheme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonDisabled: {
    backgroundColor: appTheme.colors.border,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
