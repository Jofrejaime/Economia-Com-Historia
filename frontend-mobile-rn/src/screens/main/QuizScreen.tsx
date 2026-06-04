import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

// Dados mock para o quiz (substituir por dados reais depois)
const mockQuestions = [
  {
    id: 1,
    question: "Em que ano Angola alcançou a independência?",
    options: ["1975", "1974", "1976", "1977"],
    correct: 0,
  },
  {
    id: 2,
    question: "Qual é a moeda nacional de Angola?",
    options: ["Escudo", "Kwanza", "Real", "Peso"],
    correct: 1,
  },
  {
    id: 3,
    question: "Qual destes recursos naturais é mais abundante em Angola?",
    options: ["Ouro", "Diamantes", "Petróleo", "Cobre"],
    correct: 2,
  },
];

export function QuizScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = mockQuestions[currentIndex];
  const isLastQuestion = currentIndex === mockQuestions.length - 1;

  const handleSelectOption = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === currentQuestion.correct;
    if (correct) setScore(score + 1);
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      navigation.navigate("QuizResult" as never);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  // Função auxiliar para obter os estilos condicionais de cada opção
  const getOptionStyle = (idx: number) => {
    const baseStyle = styles.optionButton;
    const isSelected = selectedOption === idx;
    if (isSelected && showFeedback) {
      if (idx === currentQuestion.correct) {
        return [baseStyle, styles.optionCorrect];
      }
      return [baseStyle, styles.optionIncorrect];
    }
    if (isSelected) {
      return [baseStyle, styles.optionSelected];
    }
    return [baseStyle];
  };

  const getTextStyle = (idx: number) => {
    const baseTextStyle = styles.optionText;
    const isSelected = selectedOption === idx;
    if (isSelected && showFeedback) {
      if (idx === currentQuestion.correct) {
        return [baseTextStyle, styles.optionTextCorrect];
      }
      return [baseTextStyle, styles.optionTextIncorrect];
    }
    if (isSelected) {
      return [baseTextStyle, styles.optionTextSelected];
    }
    return [baseTextStyle];
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Quiz</Text>
        <Text style={styles.progress}>
          {currentIndex + 1} / {mockQuestions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={getOptionStyle(idx)}
              onPress={() => handleSelectOption(idx)}
              disabled={showFeedback}
            >
              <Text style={getTextStyle(idx)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}>
              {isCorrect ? "✅ Resposta correta!" : "❌ Resposta errada!"}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? "Ver resultado" : "Próxima questão"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!showFeedback && (
          <TouchableOpacity
            style={[styles.submitButton, selectedOption === null && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={selectedOption === null}
          >
            <Text style={styles.submitButtonText}>Responder</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    marginBottom: 20,
  },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700", color: appTheme.colors.textPrimary },
  progress: { fontSize: 16, color: appTheme.colors.textMuted },
  content: { flexGrow: 1, paddingBottom: 32 },
  questionCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 26,
  },
  optionsContainer: { gap: 12, marginBottom: 24 },
  optionButton: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    padding: 16,
  },
  optionSelected: {
    backgroundColor: appTheme.colors.primaryLight,
    borderColor: appTheme.colors.primary,
    borderWidth: 2,
    borderRadius: appTheme.radius.md,
    padding: 16,
  },
  optionCorrect: {
    backgroundColor: appTheme.colors.successLight,
    borderColor: appTheme.colors.successLight,
    borderWidth: 2,
    borderRadius: appTheme.radius.md,
    padding: 16,
  },
  optionIncorrect: {
    backgroundColor: appTheme.colors.dangerLight,
    borderColor: appTheme.colors.dangerLight,
    borderWidth: 2,
    borderRadius: appTheme.radius.md,
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    color: appTheme.colors.textPrimary,
  },
  optionTextSelected: {
    color: appTheme.colors.surface,
    fontWeight: "600",
  },
  optionTextCorrect: {
    color: appTheme.colors.successLight,
    fontWeight: "600",
  },
  optionTextIncorrect: {
    color: appTheme.colors.dangerLight,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: { opacity: 0.5 },
  submitButtonText: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackContainer: {
    marginTop: 8,
    alignItems: "center",
    gap: 16,
  },
  feedbackCorrect: {
    fontSize: 18,
    color: appTheme.colors.successLight,
    fontWeight: "600",
    textAlign: "center",
  },
  feedbackIncorrect: {
    fontSize: 18,
    color: appTheme.colors.dangerLight,
    fontWeight: "600",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.md,
    minHeight: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});