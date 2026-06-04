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

  const categories = ["Discussão", "Dúvida", "Sugestão", "Recurso", "Outro"];

  const handlePublish = () => {
    // TODO: implementar publicação do tópico
    console.log("Publicar tópico:", { title, category, content });
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    // TODO: implementar salvamento de rascunho
    console.log("Salvar rascunho:", { title, category, content });
    navigation.goBack();
  };

  const canSubmit = title.trim().length > 0 && category && content.trim().length > 0;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Criar Tópico</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o título do tópico"
            placeholderTextColor={appTheme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria</Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Conteúdo</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Escreva o conteúdo do tópico..."
            placeholderTextColor={appTheme.colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={handleSaveDraft}
          >
            <Text style={styles.draftButtonText}>Guardar Rascunho</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.publishButton, !canSubmit && styles.buttonDisabled]}
            onPress={handlePublish}
            disabled={!canSubmit}
          >
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: appTheme.radius.pill,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  categoryChipSelected: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  categoryChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: appTheme.colors.surface,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  draftButton: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
  },
  draftButtonText: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  publishButton: {
    backgroundColor: appTheme.colors.primary,
  },
  publishButtonText: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});