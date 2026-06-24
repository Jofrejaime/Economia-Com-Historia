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
              <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
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
                    {subject === s.value && <Feather name="check" size={14} color="#8B1E2D" />}
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
              placeholderTextColor="#9CA3AF"
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
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D",
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
    fontSize: 16,
    color: "#574142",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    height: 48,
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dropdownList: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#FDF3F4",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#4B5563",
  },
  dropdownItemTextActive: {
    color: "#8B1E2D",
    fontWeight: "700",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    height: 140,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#8B1E2D",
    height: 48,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  faqSection: {
    gap: 16,
  },
  faqTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});