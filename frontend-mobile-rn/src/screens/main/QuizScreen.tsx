import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { quizService } from "../../services/api/quizService";
import type { QuizQuestion, QuizOption } from "../../types/api";
import { MainStackParamList } from "../../types/navigation";

type QuizRouteProp = RouteProp<MainStackParamList, "Quiz">;

export function QuizScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<QuizRouteProp>();
  const { quizId, attemptId: routeAttemptId } = route.params;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(routeAttemptId ?? null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [initError, setInitError] = useState(false);

  const quizStartTimeRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(Date.now());

  const initQuiz = useCallback(async () => {
    setLoading(true);
    setInitError(false);
    try {
      let activeAttemptId = routeAttemptId ?? null;
      if (!activeAttemptId) {
        const attempt = await quizService.startAttempt(quizId);
        activeAttemptId = attempt.id;
        setAttemptId(attempt.id);
      }
      const qs = await quizService.questions(quizId);
      setQuestions(qs);
      quizStartTimeRef.current = Date.now();
      questionStartTimeRef.current = Date.now();
    } catch (error) {
      console.warn("Erro ao iniciar quiz", error);
      setInitError(true);
    } finally {
      setLoading(false);
    }
  }, [quizId, routeAttemptId]);

  useEffect(() => {
    void initQuiz();
  }, [initQuiz]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleConfirm = async () => {
    if (!selectedOptionId || !attemptId || !currentQuestion) return;
    setSubmitting(true);

    const timeSpentSecs = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    try {
      const result = await quizService.submitAnswer(attemptId, {
        question_id: currentQuestion.id,
        selected_option_id: selectedOptionId,
        time_spent_secs: timeSpentSecs,
      });

      const isLast = currentIndex === totalQuestions - 1;

      if (isLast) {
        const totalSecs = Math.round((Date.now() - quizStartTimeRef.current) / 1000);
        try {
          await quizService.completeAttempt(attemptId, totalSecs);
        } catch {
          // attempt may already be completed; proceed to result
        }
        navigation.navigate("QuizFeedback", {
          isCorrect: result.is_correct,
          explanation: result.explanation ?? null,
          isLast: true,
          attemptId,
          quizId,
        });
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedOptionId(null);
        questionStartTimeRef.current = Date.now();
        navigation.navigate("QuizFeedback", {
          isCorrect: result.is_correct,
          explanation: result.explanation ?? null,
          isLast: false,
          attemptId,
          quizId,
        });
      }
    } catch (error) {
      console.warn("Erro ao submeter resposta", error);
      Alert.alert("Erro", "Não foi possível registar a resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Quiz" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={styles.loadingText}>A preparar o quiz...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!loading && (initError || !currentQuestion)) {
    return (
      <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
        <HeaderBar title="Quiz" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Não foi possível carregar as perguntas.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void initQuiz()}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Quiz" />

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>{currentIndex + 1} / {totalQuestions}</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Module + Question */}
        <View style={styles.questionBlock}>
          {currentQuestion.module_label && (
            <Text style={styles.moduleLabel}>{currentQuestion.module_label.toUpperCase()}</Text>
          )}
          {currentQuestion.subtitle && (
            <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
          )}
          <Text style={styles.questionText}>{currentQuestion.title}</Text>
          <View style={styles.divider} />
        </View>

        {/* Reading material */}
        {currentQuestion.reading_text && (
          <View style={styles.readingBlock}>
            {currentQuestion.reading_title && (
              <Text style={styles.readingTitle}>{currentQuestion.reading_title}</Text>
            )}
            <Text style={styles.readingText}>{currentQuestion.reading_text}</Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {(currentQuestion.options ?? []).map((option: QuizOption) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedOptionId(option.id)}
                style={[
                  styles.optionBtn,
                  isSelected ? styles.optionBtnSelected : styles.optionBtnDefault,
                ]}
              >
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.optionLetter,
                      isSelected ? styles.optionLetterSelected : styles.optionLetterDefault,
                    ]}
                  >
                    {option.option_key}
                  </Text>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected ? styles.optionTextSelected : styles.optionTextDefault,
                    ]}
                  >
                    {option.option_text}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={20} color={appTheme.colors.primaryDark} style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hint and Submit */}
        <View style={styles.submitSection}>
          {currentQuestion.hint_quote && (
            <View style={styles.hintRow}>
              <Feather name="help-circle" size={14} color="rgba(87,65,66,0.7)" style={{ marginTop: 2 }} />
              <Text style={styles.hintText}>{currentQuestion.hint_quote}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => void handleConfirm()}
            disabled={!selectedOptionId || submitting}
            style={[
              styles.submitBtn,
              (!selectedOptionId || submitting) && styles.submitBtnDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.submitBtnLabel}>Confirmar Resposta</Text>
                <Feather name="check-circle" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textMuted,
  },
  errorText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: appTheme.radius.button,
  },
  retryBtnText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: appTheme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: appTheme.colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    minWidth: 40,
    textAlign: "right",
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
    marginBottom: 24,
  },
  moduleLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    letterSpacing: 2.4,
    marginBottom: 12,
    textAlign: "center",
  },
  questionSubtitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  questionText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 24,
  },
  divider: {
    width: 64,
    height: 2,
    backgroundColor: "rgba(139,30,45,0.2)",
  },
  readingBlock: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  readingTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  readingText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionBtn: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
  optionBtnDefault: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderColor: "transparent",
  },
  optionBtnSelected: {
    backgroundColor: appTheme.colors.surface,
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
    color: appTheme.colors.primaryDark,
  },
  optionText: {
    fontFamily: "Source_Sans_3",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  optionTextDefault: {
    color: appTheme.colors.textSecondary,
  },
  optionTextSelected: {
    color: appTheme.colors.textPrimary,
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
    fontFamily: "Source_Sans_3",
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
    borderRadius: appTheme.radius.button,
    shadowColor: appTheme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnLabel: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
