import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

type RouteParams = {
  initialTitle?: string;
  initialCategory?: string;
};

export function CreateTopicScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialTitle = "", initialCategory = "" } = (route.params as RouteParams) || {};

  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [content, setContent] = useState("");
  const [accessLevel, setAccessLevel] = useState<"public" | "limited">("public");
  
  const [selectedMembers, setSelectedMembers] = useState([
    { id: "1", name: "João Domingos", avatar: "JD" },
    { id: "2", name: "Catarina Domingos", avatar: "CD" },
    { id: "3", name: "Eduardo Loureiro", avatar: "EL" }
  ]);

  const categories = [
    "História Monetária",
    "Agronegócio",
    "Petróleo e Reforma",
    "Infraestrutura",
    "Economia Colonial",
    "Desenvolvimento Sustentável"
  ];

  const handlePublish = () => {
    console.log("Publicar tópico:", { title, category, content, accessLevel, selectedMembers });
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    console.log("Salvar rascunho:", { title, category, content, accessLevel, selectedMembers });
    navigation.goBack();
  };

  const canSubmit = title.trim().length > 0 && category && content.trim().length > 0;

  return (
    <ScreenContainer style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B1E2D" />
          <Text style={styles.backButtonText}>Novo Fórum</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              style={styles.input}
              placeholder="Ex: A desvalorização do Kwanza e seu impacto..."
              placeholderTextColor={appTheme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Selecionar categoria</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Descreva o contexto e as questões</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Desenvolva o contexto histórico e as questões que pretende debater..."
              placeholderTextColor={appTheme.colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Discussion Circle */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Círculo de Diálogo</Text>
          <Text style={styles.sectionSubtitle}>Estas pessoas poderão participar activamente e serão notificadas</Text>

          <View style={styles.membersList}>
            {selectedMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <TouchableOpacity onPress={() => setSelectedMembers(prev => prev.filter(m => m.id !== member.id))}>
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addMemberBtn}>
            <Ionicons name="add" size={18} color="#8B1E2D" />
            <Text style={styles.addMemberBtnText}>Adicionar mais membros</Text>
          </TouchableOpacity>
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
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 16,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D9E3F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "#8B1E2D",
    fontSize: 13,
    fontWeight: "700",
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
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
});