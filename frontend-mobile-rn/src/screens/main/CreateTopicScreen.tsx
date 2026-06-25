import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../hooks/useAuth";
import { useCommunity } from "../../hooks/useCommunity";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { communityService } from "../../services/api/communityService";
import type { CommunityCategory } from "../../types/api";
import { MainStackParamList } from "../../types/navigation";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import type { UserProfile } from "../../types/room";

const MEMBER_CATALOG: UserProfile[] = [
  { id: "u1", name: "Ana Silva", username: "ana.silva", avatarUri: null },
  { id: "u2", name: "Artur Mendes", username: "artur.m", avatarUri: null },
  { id: "u3", name: "Benedito Neves", username: "bneves", avatarUri: null },
  { id: "u4", name: "Carla Domingos", username: "carla.dom", avatarUri: null },
  { id: "u5", name: "Catarina Neto", username: "catarina_n", avatarUri: null },
  { id: "u6", name: "Daniel Gonçalves", username: "dgoncalves", avatarUri: null },
  { id: "u7", name: "Eduardo Loureiro", username: "eduardo_l", avatarUri: null },
  { id: "u8", name: "Fernanda Costa", username: "fernanda.c", avatarUri: null },
];

type CreateTopicNavigationProp = NativeStackNavigationProp<MainStackParamList, "CreateTopic">;
type CreateTopicRouteProp = RouteProp<MainStackParamList, "CreateTopic">;

export function CreateTopicScreen() {
  const navigation = useNavigation<CreateTopicNavigationProp>();
  const route = useRoute<CreateTopicRouteProp>();
  const { user } = useAuth();
  const { addTopicOptimistic } = useCommunity();

  const { initialTitle = "" } = route.params ?? {};

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState("");
  const [accessLevel, setAccessLevel] = useState<"public" | "restricted">("public");

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [searchMemberText, setSearchMemberText] = useState("");

  const suggestedMembers = useMemo(() => {
    const search = searchMemberText.trim().toLowerCase();
    return MEMBER_CATALOG.filter((m) => {
      const taken = selectedMembers.some((s) => s.id === m.id);
      const matches = `${m.name} ${m.username}`.toLowerCase().includes(search);
      return !taken && (search === "" || matches);
    }).slice(0, 5);
  }, [searchMemberText, selectedMembers]);

  useEffect(() => {
    communityService.categories()
      .then((data) => setCategories(data))
      .catch((e) => console.warn("Erro ao carregar categorias", e))
      .finally(() => setLoadingCategories(false));
  }, []);

  const resolvedCategoryId = categories.find(
    (c) => c.access_level_id === accessLevel
  )?.id ?? null;

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !loadingCategories;

  const handlePublish = async () => {
    if (!canSubmit || !user) return;
    if (!resolvedCategoryId) {
      console.warn("Categoria para o nível de acesso selecionado não encontrada. Corre a migração no backend.");
      return;
    }
    setSubmitting(true);
    try {
      const newTopic = await communityService.createTopic({
        title: title.trim(),
        content: content.trim(),
        category_id: resolvedCategoryId,
      });
      addTopicOptimistic(newTopic);
      if (accessLevel === "restricted") {
        navigation.navigate("ManageMembers", { topicId: newTopic.id, initialMembers: selectedMembers });
      } else {
        navigation.navigate("TopicDiscussion", { id: newTopic.id });
      }
    } catch (error) {
      console.warn("Erro ao criar tópico", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Nova Discussão" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Iniciar Discussão</Text>
          <Text style={styles.introDesc}>
            Crie uma sala de discussão para debater temas relevantes com a comunidade académica.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Identidade do Tema</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Título do tópico</Text>
            <TextInput
              style={[styles.input, focusedInput === "title" && styles.inputFocused]}
              placeholder="Ex: A desvalorização do Kwanza e seu impacto..."
              placeholderTextColor={appTheme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedInput("title")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Acesso</Text>
            <View style={styles.accessToggle}>
              <TouchableOpacity
                style={[styles.accessCard, accessLevel === "public" && styles.accessCardSelected]}
                onPress={() => setAccessLevel("public")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="globe-outline"
                  size={22}
                  color={accessLevel === "public" ? appTheme.colors.primary : appTheme.colors.textMuted}
                />
                <Text style={[styles.accessCardTitle, accessLevel === "public" && styles.accessCardTitleSelected]}>
                  Público
                </Text>
                <Text style={styles.accessCardDesc}>Visível a todos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accessCard, accessLevel === "restricted" && styles.accessCardSelected]}
                onPress={() => setAccessLevel("restricted")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={accessLevel === "restricted" ? appTheme.colors.primary : appTheme.colors.textMuted}
                />
                <Text style={[styles.accessCardTitle, accessLevel === "restricted" && styles.accessCardTitleSelected]}>
                  Privado
                </Text>
                <Text style={styles.accessCardDesc}>Apenas membros</Text>
              </TouchableOpacity>
            </View>
          </View>

          {accessLevel === "restricted" && (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Círculo de Diálogo</Text>
              <Text style={styles.membersHint}>Adicione os membros que poderão participar nesta sala privada.</Text>

              {selectedMembers.length > 0 && (
                <View style={styles.selectedChips}>
                  {selectedMembers.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.memberChip}
                      onPress={() => setSelectedMembers((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      <Text style={styles.memberChipText}>{m.name.split(" ")[0]}</Text>
                      <Ionicons name="close" size={12} color={appTheme.colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <UserSearchBar
                value={searchMemberText}
                onChangeText={setSearchMemberText}
                placeholder="Pesquisar por nome ou @username..."
              />

              <View style={styles.memberListWrap}>
                <UserList
                  users={suggestedMembers}
                  selectedUserIds={selectedMembers.map((m) => m.id)}
                  onAddUser={(m) => { setSelectedMembers((prev) => [...prev, m]); setSearchMemberText(""); }}
                />
              </View>
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Descreva o contexto e as questões</Text>
            <TextInput
              style={[styles.input, styles.textArea, focusedInput === "content" && styles.inputFocused]}
              placeholder="Desenvolva o contexto histórico e as questões que pretende debater..."
              placeholderTextColor={appTheme.colors.textMuted}
              value={content}
              onChangeText={setContent}
              onFocus={() => setFocusedInput("content")}
              onBlur={() => setFocusedInput(null)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.publishBtn, (!canSubmit || submitting) && styles.publishBtnDisabled]}
            disabled={!canSubmit || submitting}
            onPress={() => void handlePublish()}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.publishBtnText}>Iniciar discussão</Text>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  introHeader: {
    marginBottom: 28,
  },
  introTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: "#8B1E2D",
    marginBottom: 12,
  },
  introDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: "#574142",
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputWrap: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: appTheme.radius.sm,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 16,
    fontFamily: "Source_Sans_3",
  },
  inputFocused: {
    borderColor: "#8B1E2D",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  accessToggle: {
    flexDirection: "row",
    gap: 12,
  },
  accessCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: appTheme.radius.sm,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    gap: 6,
  },
  accessCardSelected: {
    borderColor: appTheme.colors.primary,
    backgroundColor: "#FDF3F4",
  },
  accessCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
  },
  accessCardTitleSelected: {
    color: appTheme.colors.primary,
  },
  accessCardDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  membersHint: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  selectedChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FDF3F4",
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.primary,
  },
  memberListWrap: {
    maxHeight: 240,
    marginTop: 8,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  publishBtn: {
    flexDirection: "row",
    backgroundColor: "#8B1E2D",
    height: 56,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#8B1E2D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: "Source_Sans_3",
    color: "#8B1E2D",
    fontSize: 14,
    fontWeight: "600",
  },
});
