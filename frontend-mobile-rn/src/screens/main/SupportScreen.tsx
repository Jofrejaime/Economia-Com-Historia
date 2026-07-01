import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { SectionAccentLine } from "../../components/SectionAccentLine";

export function SupportScreen() {
  const navigation = useNavigation();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const subjects = [
    { value: "technical", label: "Problema Técnico" },
    { value: "content", label: "Questão sobre Conteúdo" },
    { value: "account", label: "Questão sobre Conta" },
    { value: "suggestion", label: "Sugestão" },
    { value: "other", label: "Outro" },
  ];

  const handleSend = () => {
    if (!subject) {
      Alert.alert("Erro", "Por favor, seleciona um assunto.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Erro", "Por favor, escreve uma mensagem.");
      return;
    }

    Alert.alert("Sucesso", "A tua mensagem foi enviada à equipa editorial!");
    setSubject("");
    setMessage("");
    navigation.goBack();
  };

  const getSelectedLabel = () => {
    const found = subjects.find((s) => s.value === subject);
    return found ? found.label : "Selecione um assunto";
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Suporte e Ajuda" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Contactar a equipa editorial</Text>

        {/* Support Form Card */}
        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Assunto</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownButtonText, !subject && styles.placeholderText]}>
                {getSelectedLabel()}
              </Text>
              <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={appTheme.colors.textMuted} />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownList}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.dropdownItem, subject === s.value && styles.dropdownItemActive]}
                    onPress={() => {
                      setSubject(s.value);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        subject === s.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                    {subject === s.value && <Feather name="check" size={14} color={appTheme.colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mensagem</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Descreva a sua questão ou sugestão..."
              placeholderTextColor={appTheme.colors.textMuted}
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Enviar Mensagem</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Perguntas Frequentes</Text>
          <SectionAccentLine />

          <View style={styles.faqList}>
            {/* FAQ 1 */}
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Como posso aceder a textos com jindungo?</Text>
              <Text style={styles.faqAnswer}>
                Os textos com jindungo requerem permissão especial. Pode solicitar acesso através do botão presente em cada artigo.
              </Text>
            </View>

            {/* FAQ 2 */}
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Como funcionam as conquistas?</Text>
              <Text style={styles.faqAnswer}>
                As conquistas são desbloqueadas automaticamente conforme completa quizzes e participa na comunidade.
              </Text>
            </View>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    letterSpacing: -0.4,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
    backgroundColor: appTheme.colors.background,
    height: 48,
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textPrimary,
  },
  placeholderText: {
    color: appTheme.colors.textMuted,
  },
  dropdownList: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  dropdownItemActive: {
    backgroundColor: appTheme.colors.debateHighlightBg,
  },
  dropdownItemText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  textArea: {
    fontFamily: "Source_Sans_3",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
    backgroundColor: appTheme.colors.background,
    height: 140,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: appTheme.colors.primary,
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  sendButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  faqSection: {
    gap: 16,
  },
  faqTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  faqQuestion: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.rankingCardGray,
    lineHeight: 20,
  },
});