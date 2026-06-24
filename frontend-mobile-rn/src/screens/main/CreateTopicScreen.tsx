import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../hooks/useAuth";
import { useCommunity } from "../../hooks/useCommunity";
import { ScreenContainer } from "../../components/ScreenContainer";
import { CategorySelect } from "../../components/CategorySelect";
import { UserSearchBar } from "../../components/UserSearchBar";
import { UserList } from "../../components/UserList";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { MainStackParamList, CommunityTopic } from "../../types/navigation";
import { CategoryGroup, CategoryOption, UserProfile } from "../../types/room";

type RouteParams = {
  initialTitle?: string;
  initialCategory?: string;
};

type CreateTopicNavigationProp = NativeStackNavigationProp<MainStackParamList, "CreateTopic">;

type CreateTopicRouteProp = RouteProp<MainStackParamList, "CreateTopic">;

export function CreateTopicScreen() {
  const navigation = useNavigation<CreateTopicNavigationProp>();
  const route = useRoute<CreateTopicRouteProp>();
  const { user } = useAuth();
  const { addTopic } = useCommunity();
  const { initialTitle = "", initialCategory = "" } = (route.params as RouteParams) || {};

  const [title, setTitle] = useState(initialTitle);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [content, setContent] = useState("");
  const [accessLevel, setAccessLevel] = useState<"public" | "limited">("public");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [searchMemberText, setSearchMemberText] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const categoryGroups: CategoryGroup[] = [
    {
      title: "Temas Econômicos",
      categories: [
        { id: "c1", label: "Política Monetária", group: "Temas Econômicos", description: "Inflação, taxa de juros e câmbio." },
        { id: "c2", label: "Desenvolvimento Sustentável", group: "Temas Econômicos", description: "Economia e meio ambiente." },
      ],
    },
    {
      title: "História e Sociedade",
      categories: [
        { id: "c3", label: "Economia Colonial", group: "História e Sociedade", description: "Comércio histórico e trabalho." },
        { id: "c4", label: "Infraestrutura", group: "História e Sociedade", description: "Desenvolvimento de transportes e energia." },
      ],
    },
  ];

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

  const handlePublish = () => {
    const authorName = user?.name || "Anónimo";
    const authorInitials = authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newTopic: CommunityTopic = {
      id: String(Date.now()),
      author: authorName,
      authorInitials,
      time: "Agora",
      title,
      description: content,
      category: selectedCategory?.label || "Outros",
      image: imageUri ?? undefined,
      replies: 0,
      views: "0",
      isPinned: false,
      isPrivate: accessLevel === "limited",
      isActive: true,
      createdAt: new Date().toISOString(),
      members: selectedMembers,
      comments: [],
    };

    addTopic(newTopic);
    navigation.navigate("TopicDiscussion", { id: newTopic.id });
  };

  const pickImage = async () => {
    try {
      // Request permission (Android/iOS)
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos para escolher uma imagem.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      const anyResult = result as any;
      const canceled = anyResult?.canceled ?? anyResult?.cancelled ?? false;
      if (!canceled) {
        const resultAssets = anyResult.assets;
        const uri = resultAssets?.[0]?.uri ?? anyResult.uri;
        if (uri) setImageUri(uri as string);
      }
    } catch (error) {
      console.warn("Erro ao seleccionar imagem", error);
    }
  };

  const removeImage = () => setImageUri(null);

  const handleSaveDraft = () => {
    console.log("Salvar rascunho:", {
      title,
      category: selectedCategory?.label ?? null,
      content,
      accessLevel,
      selectedMembers,
    });
    navigation.goBack();
  };

  const handleAddMember = useCallback((member: UserProfile) => {
    setSelectedMembers((prev) => [...prev, member]);
    setSearchMemberText("");
  }, []);

  const handleRemoveMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const canSubmit = title.trim().length > 0 && selectedCategory !== null && content.trim().length > 0;

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Novo Fórum" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro Header */}
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Iniciar Discussão</Text>
          <Text style={styles.introDesc}>
            Crie um tópico para debater temas relevantes. Será publicado no arquivo público da plataforma e notificará os membros do círculo de diálogo. Moderadores podem mover para o arquivo secundário se não atender aos critérios editoriais.
          </Text>
        </View>

        {/* Form Identity Section */}
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
            <CategorySelect
              groups={categoryGroups}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>

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

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Imagem do tópico (opcional)</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={18} color="#8B1E2D" />
                <Text style={styles.imagePickerText}>{imageUri ? "Alterar imagem" : "Adicionar imagem"}</Text>
              </TouchableOpacity>
              {imageUri && (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity onPress={removeImage} style={styles.removeImageBtn}>
                    <Text style={styles.removeImageText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Discussion Circle */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Círculo de Diálogo</Text>
          <Text style={styles.sectionSubtitle}>Procure e adicione membros que poderão participar activamente</Text>

          <UserSearchBar
            value={searchMemberText}
            onChangeText={setSearchMemberText}
            loading={loadingMembers}
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

          {selectedMembers.length > 0 && (
            <View style={styles.selectedMembersSection}>
              <Text style={styles.sectionSubtitle}>Membros adicionados ({selectedMembers.length})</Text>
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
                  <TouchableOpacity onPress={() => handleRemoveMember(member.id)} style={styles.removeMemberButton}>
                    <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

        </View>

        {/* Access Level */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Nível de Acesso</Text>
          <Text style={styles.sectionSubtitle}>Define quem pode ler e participar da discussão</Text>

          <View style={styles.accessCardsContainer}>
            {/* Public Card */}
            <TouchableOpacity
              style={[styles.accessCard, accessLevel === "public" && styles.accessCardSelected]}
              onPress={() => setAccessLevel("public")}
            >
              <View style={[styles.radioButton, accessLevel === "public" && styles.radioButtonSelected]}>
                {accessLevel === "public" && <View style={styles.radioButtonDot} />}
              </View>
              <Ionicons name="globe-outline" size={20} color="#8B1E2D" style={styles.accessCardIcon} />
              <View style={styles.accessCardInfo}>
                <Text style={styles.accessCardTitle}>Público</Text>
                <Text style={styles.accessCardDesc}>Qualquer pessoa pode ler e participar da discussão</Text>
              </View>
            </TouchableOpacity>

            {/* Limited Card */}
            <TouchableOpacity
              style={[styles.accessCard, accessLevel === "limited" && styles.accessCardSelected]}
              onPress={() => setAccessLevel("limited")}
            >
              <View style={[styles.radioButton, accessLevel === "limited" && styles.radioButtonSelected]}>
                {accessLevel === "limited" && <View style={styles.radioButtonDot} />}
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#8B1E2D" style={styles.accessCardIcon} />
              <View style={styles.accessCardInfo}>
                <Text style={styles.accessCardTitle}>Limitado</Text>
                <Text style={styles.accessCardDesc}>Apenas convidados específicos podem participar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>



        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]}
            disabled={!canSubmit}
            onPress={handlePublish}
          >
            <Text style={styles.publishBtnText}>Iniciar discussão</Text>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveDraftBtn} onPress={handleSaveDraft}>
            <Text style={styles.saveDraftBtnText}>Salvar rascunho temporário</Text>
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
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#8B1E2D",
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 32,
    fontWeight: "700",
    color: "#8B1E2D",
    marginBottom: 12,
  },
  introDesc: {
    fontSize: 15,
    color: "#574142",
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  inputWrap: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  categoryChipSelected: {
    backgroundColor: "#8B1E2D",
    borderColor: "#8B1E2D",
  },
  categoryChipText: {
    color: "#574142",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextSelected: {
    color: "white",
  },
  membersList: {
    gap: 10,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EFF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D9E3F6",
  },
  memberAvatarText: {
    color: "#8B1E2D",
    fontSize: 14,
    fontWeight: "700",
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  memberUsername: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  selectedMembersSection: {
    marginTop: 18,
  },
  selectedMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flex: 1,
  },
  removeMemberButton: {
    marginLeft: 12,
  },
  userListWrapper: {
    minHeight: 200,
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  addMemberBtnText: {
    color: "#8B1E2D",
    fontWeight: "600",
    fontSize: 14,
  },
  accessCardsContainer: {
    gap: 12,
  },
  accessCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  accessCardSelected: {
    borderColor: "#8B1E2D",
    backgroundColor: "#FDF3F4",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: "#8B1E2D",
  },
  radioButtonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8B1E2D",
  },
  accessCardIcon: {
    marginTop: 2,
  },
  accessCardInfo: {
    flex: 1,
  },
  accessCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  accessCardDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  actionButtonsContainer: {
    marginTop: 24,
    gap: 16,
  },
  publishBtn: {
    flexDirection: "row",
    backgroundColor: "#8B1E2D",
    height: 56,
    borderRadius: 12,
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
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  saveDraftBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  saveDraftBtnText: {
    color: "#8B1E2D",
    fontSize: 14,
    fontWeight: "600",
  },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imagePickerText: {
    color: "#8B1E2D",
    fontWeight: "700",
    marginLeft: 4,
  },
  imagePreviewWrap: {
    marginLeft: 12,
    alignItems: "center",
  },
  imagePreview: {
    width: 80,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  removeImageBtn: {
    marginTop: 6,
  },
  removeImageText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  inputFocused: {
    borderColor: "#8B1E2D",
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "white",
    marginBottom: 12,
    height: 48,
  },
  searchContainerFocused: {
    borderColor: "#8B1E2D",
    shadowColor: "#8B1E2D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  suggestionsWrapper: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 12,
    maxHeight: 280,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  suggestionsHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFBFC",
  },
  suggestionsHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsList: {
    maxHeight: 240,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8EFF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D9E3F6",
  },
  suggestionAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8B1E2D",
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  suggestionAddIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FDF3F4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3E8EB",
  },
});