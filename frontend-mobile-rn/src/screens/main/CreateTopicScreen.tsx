import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
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
import { userService } from "../../services/api/userService";
import type { CommunityCategory } from "../../types/api";
import { MainStackParamList } from "../../types/navigation";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import type { UserProfile } from "../../types/room";

type CreateTopicNavigationProp = NativeStackNavigationProp<MainStackParamList, "CreateTopic">;
type CreateTopicRouteProp = RouteProp<MainStackParamList, "CreateTopic">;

export function CreateTopicScreen() {
  const navigation = useNavigation<CreateTopicNavigationProp>();
  const route = useRoute<CreateTopicRouteProp>();
  const { user } = useAuth();
  const { addTopicOptimistic } = useCommunity();

  const { initialTitle = "", initialCategoryId } = route.params ?? {};

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState("");
  const [accessLevel, setAccessLevel] = useState<"public" | "restricted">("public");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId ?? null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [searchMemberText, setSearchMemberText] = useState("");
  const [suggestedMembers, setSuggestedMembers] = useState<UserProfile[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestedMembers([]); return; }
    setSearchingMembers(true);
    try {
      const results = await userService.search(query.trim(), 8);
      const selectedIds = new Set(selectedMembers.map((m) => m.id));
      setSuggestedMembers(
        results
          .filter((r) => !selectedIds.has(r.id))
          .map((r) => ({ id: r.id, name: r.display_name, username: r.full_name ?? r.display_name, avatarUri: r.avatar_url }))
      );
    } catch {
      setSuggestedMembers([]);
    } finally {
      setSearchingMembers(false);
    }
  }, [selectedMembers]);

  useEffect(() => {
    if (!user) {
      navigation.replace("LoginPrompt", { type: "create-topic" });
    }
  }, [user, navigation]);

  useEffect(() => {
    const timer = setTimeout(() => { void searchUsers(searchMemberText); }, 300);
    return () => clearTimeout(timer);
  }, [searchMemberText, searchUsers]);

  useEffect(() => {
    communityService.categories()
      .then((data) => setCategories(data))
      .catch((e) => console.warn("Erro ao carregar categorias", e))
      .finally(() => setLoadingCategories(false));
  }, []);

  const activeCategories = categories.filter((c) => c.is_active);

  const resolvedCategoryId = selectedCategoryId;

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !loadingCategories &&
    resolvedCategoryId !== null &&
    (accessLevel !== "restricted" || selectedMembers.length >= 1);

  const handlePublish = async () => {
    if (!canSubmit || !user || !resolvedCategoryId) return;
    setSubmitting(true);
    try {
      const newTopic = await communityService.createTopic({
        title: title.trim(),
        content: content.trim(),
        category_id: resolvedCategoryId,
        visibility: accessLevel === "restricted" ? "INVITE_ONLY" : "PUBLIC",
        member_ids: accessLevel === "restricted" && selectedMembers.length > 0
          ? selectedMembers.map((m) => m.id)
          : undefined,
      });
      addTopicOptimistic(newTopic);
      navigation.navigate("TopicDiscussion", { id: newTopic.id });
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
                onPress={() => { setAccessLevel("public"); }}
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

          <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Categoria</Text>
              {loadingCategories ? (
                <ActivityIndicator size="small" color={appTheme.colors.primary} style={{ marginTop: 8 }} />
              ) : (
                <TouchableOpacity
                  style={[styles.selectField, selectedCategoryId && styles.selectFieldFilled]}
                  onPress={() => setCategoryModalVisible(true)}
                  activeOpacity={0.8}
                >
                  {selectedCategoryId ? (
                    <View style={styles.selectFieldContent}>
                      {activeCategories.find((c) => c.id === selectedCategoryId)?.color_bg && (
                        <View style={[styles.selectDot, { backgroundColor: activeCategories.find((c) => c.id === selectedCategoryId)!.color_bg! }]} />
                      )}
                      <Text style={styles.selectFieldText}>
                        {activeCategories.find((c) => c.id === selectedCategoryId)?.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectPlaceholder}>Seleccionar categoria...</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color={appTheme.colors.textMuted} />
                </TouchableOpacity>
              )}

              <Modal
                visible={categoryModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCategoryModalVisible(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Escolher Categoria</Text>
                    {activeCategories.length === 0 ? (
                      <Text style={styles.categoryEmptyText}>Nenhuma categoria disponível.</Text>
                    ) : (
                      <FlatList
                        data={activeCategories}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                        renderItem={({ item }) => {
                          const isSelected = selectedCategoryId === item.id;
                          return (
                            <TouchableOpacity
                              style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                              onPress={() => { setSelectedCategoryId(item.id); setCategoryModalVisible(false); }}
                              activeOpacity={0.7}
                            >
                              <View style={styles.modalOptionLeft}>
                                {item.color_bg && (
                                  <View style={[styles.modalDot, { backgroundColor: item.color_bg }]} />
                                )}
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                                    {item.name}
                                  </Text>
                                  {item.description ? (
                                    <Text style={styles.modalOptionDesc} numberOfLines={1}>{item.description}</Text>
                                  ) : null}
                                </View>
                              </View>
                              {isSelected && (
                                <Ionicons name="checkmark" size={20} color={appTheme.colors.primary} />
                              )}
                            </TouchableOpacity>
                          );
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

          {accessLevel === "restricted" && (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Círculo de Diálogo</Text>
              <Text style={styles.membersHint}>
                Uma sala privada requer pelo menos um membro além de si. Adicione os participantes abaixo.
              </Text>
              {selectedMembers.length === 0 && (
                <View style={styles.membersWarning}>
                  <Ionicons name="alert-circle-outline" size={15} color={appTheme.colors.badgeYellowText} />
                  <Text style={styles.membersWarningText}>Adicione pelo menos 1 membro para poder criar a sala.</Text>
                </View>
              )}

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
                loading={searchingMembers}
                placeholder="Pesquisar por nome..."
              />

              <View style={styles.memberListWrap}>
                <UserList
                  users={suggestedMembers}
                  selectedUserIds={selectedMembers.map((m) => m.id)}
                  onAddUser={(m) => { setSelectedMembers((prev) => [...prev, m]); setSearchMemberText(""); setSuggestedMembers([]); }}
                  loading={searchingMembers}
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
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: appTheme.spacing.lg,
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
    color: appTheme.colors.primary,
    marginBottom: 12,
  },
  introDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
  },
  inputWrap: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.sm,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontFamily: "Source_Sans_3",
  },
  inputFocused: {
    borderColor: appTheme.colors.primary,
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
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    gap: 6,
  },
  accessCardSelected: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.debateHighlightBg,
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
    marginBottom: 8,
    lineHeight: 18,
  },
  membersWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.badgeYellowBg,
    borderWidth: 1,
    borderColor: appTheme.colors.warning,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  membersWarningText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.badgeYellowText,
    flex: 1,
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
    backgroundColor: appTheme.colors.debateHighlightBg,
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.pill,
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
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.sm,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  selectFieldFilled: {
    borderColor: appTheme.colors.primary,
  },
  selectFieldContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  selectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectFieldText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    flex: 1,
  },
  selectPlaceholder: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textMuted,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: appTheme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: appTheme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appTheme.colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: appTheme.colors.background,
    marginHorizontal: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalOptionSelected: {
    backgroundColor: appTheme.colors.debateHighlightBg,
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOptionText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
  },
  modalOptionTextSelected: {
    color: appTheme.colors.primary,
  },
  modalOptionDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 2,
  },
  categoryEmptyText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  publishBtn: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.primary,
    height: 56,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...appTheme.shadow.md,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 17,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
