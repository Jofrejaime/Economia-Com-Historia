import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function QuizScreen() {
  const navigation = useNavigation<any>();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedOption) return;
    navigation.navigate("QuizFeedback", {
      isCorrect: selectedOption === "B",
    });
  };

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Quiz" />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Module and Question */}
        <View style={styles.questionBlock}>
          <Text style={styles.moduleLabel}>MÓDULO II: A ERA COLONIAL</Text>
          <Text style={styles.questionText}>
            Qual foi o impacto imediato da abolição do tráfico negreiro na estrutura comercial de Luanda em 1836?
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Option A */}
          <TouchableOpacity
            onPress={() => setSelectedOption("A")}
            style={[
              styles.optionBtn,
              selectedOption === "A" ? styles.optionBtnSelected : styles.optionBtnDefault,
            ]}
          >
            <View style={styles.optionRow}>
              <Text
                style={[
                  styles.optionLetter,
                  selectedOption === "A" ? styles.optionLetterSelected : styles.optionLetterDefault,
                ]}
              >
                A
              </Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "A" ? styles.optionTextSelected : styles.optionTextDefault,
                ]}
              >
                O colapso total imediato de todas as rotas comerciais marítimas para a Europa.
              </Text>
              {selectedOption === "A" && (
                <Feather name="check" size={20} color="#6B0119" style={styles.checkIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Option B */}
          <TouchableOpacity
            onPress={() => setSelectedOption("B")}
            style={[
              styles.optionBtn,
              selectedOption === "B" ? styles.optionBtnSelected : styles.optionBtnDefault,
            ]}
          >
            <View style={styles.optionRow}>
              <Text
                style={[
                  styles.optionLetter,
                  selectedOption === "B" ? styles.optionLetterSelected : styles.optionLetterDefault,
                ]}
              >
                B
              </Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "B" ? styles.optionTextSelected : styles.optionTextDefault,
                ]}
              >
                Uma transição forçada para a "economia lícita", focada na exportação de cera, marfim e óleo de palma.
              </Text>
              {selectedOption === "B" && (
                <Feather name="check" size={20} color="#6B0119" style={styles.checkIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Option C */}
          <TouchableOpacity
            onPress={() => setSelectedOption("C")}
            style={[
              styles.optionBtn,
              selectedOption === "C" ? styles.optionBtnSelected : styles.optionBtnDefault,
            ]}
          >
            <View style={styles.optionRow}>
              <Text
                style={[
                  styles.optionLetter,
                  selectedOption === "C" ? styles.optionLetterSelected : styles.optionLetterDefault,
                ]}
              >
                C
              </Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "C" ? styles.optionTextSelected : styles.optionTextDefault,
                ]}
              >
                A substituição imediata da mão-de-obra escrava por sistemas mecanizados industriais importados.
              </Text>
              {selectedOption === "C" && (
                <Feather name="check" size={20} color="#6B0119" style={styles.checkIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Option D */}
          <TouchableOpacity
            onPress={() => setSelectedOption("D")}
            style={[
              styles.optionBtn,
              selectedOption === "D" ? styles.optionBtnSelected : styles.optionBtnDefault,
            ]}
          >
            <View style={styles.optionRow}>
              <Text
                style={[
                  styles.optionLetter,
                  selectedOption === "D" ? styles.optionLetterSelected : styles.optionLetterDefault,
                ]}
              >
                D
              </Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "D" ? styles.optionTextSelected : styles.optionTextDefault,
                ]}
              >
                O isolamento diplomático de Angola perante as outras colónias portuguesas no Atlântico.
              </Text>
              {selectedOption === "D" && (
                <Feather name="check" size={20} color="#6B0119" style={styles.checkIcon} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Hint and Submit */}
        <View style={styles.submitSection}>
          <View style={styles.hintRow}>
            <Feather name="help-circle" size={14} color="rgba(87,65,66,0.7)" style={{ marginTop: 2 }} />
            <Text style={styles.hintText}>
              Pense na transição entre o mercantilismo clássico e o novo colonialismo.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedOption}
            style={[
              styles.submitBtn,
              !selectedOption && styles.submitBtnDisabled,
            ]}
          >
            <Text style={styles.submitBtnLabel}>Confirmar Resposta</Text>
            <Feather name="check-circle" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.primary,
    fontFamily: "IBM_Plex_Sans",
  },
  moreButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  questionBlock: {
    alignItems: "center",
    marginBottom: 32,
  },
  moduleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#894D50",
    letterSpacing: 2.4,
    marginBottom: 16,
    textAlign: "center",
  },
  questionText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 24,
    fontWeight: "700",
    color: "#121C2A",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 24,
  },
  divider: {
    width: 64,
    height: 2,
    backgroundColor: "rgba(139,30,45,0.2)",
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionBtn: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
  optionBtnDefault: {
    backgroundColor: "#EFF4FF",
    borderColor: "transparent",
  },
  optionBtnSelected: {
    backgroundColor: "white",
    borderColor: appTheme.colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  optionLetter: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
  },
  optionLetterDefault: {
    color: "rgba(107,1,25,0.4)",
  },
  optionLetterSelected: {
    color: "#6B0119",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  optionTextDefault: {
    color: "#574142",
  },
  optionTextSelected: {
    color: "#121C2A",
    fontWeight: "600",
  },
  checkIcon: {
    alignSelf: "center",
  },
  submitSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(222,191,191,0.15)",
    paddingTop: 24,
  },
  hintRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  hintText: {
    flex: 1,
    fontStyle: "italic",
    fontSize: 13,
    color: "rgba(87,65,66,0.7)",
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    shadowColor: appTheme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});