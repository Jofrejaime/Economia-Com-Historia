import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { quizService } from "../../services/api/quizService";
import type { QuizQuestion, QuizOption, GamificationResult } from "../../types/api";
import { MainStackParamList } from "../../types/navigation";

type QuizRouteProp = RouteProp<MainStackParamList, "Quiz">;

export function QuizScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<QuizRouteProp>();
  const { quizId, attemptId: routeAttemptId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(routeAttemptId ?? null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [initError, setInitError] = useState(false);

  const [answered, setAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [feedbackExplanation, setFeedbackExplanation] = useState<string | null>(null);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);

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
    } catch (error: any) {
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
    if (!selectedOptionId || !attemptId || !currentQuestion || submitting) return;
    setSubmitting(true);

    const timeSpentSecs = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    try {
      const result = await quizService.submitAnswer(attemptId, {
        question_id: currentQuestion.id,
        selected_option_id: selectedOptionId,
        time_spent_secs: timeSpentSecs,
      });

      const isLast = currentIndex === totalQuestions - 1;

      setAnswered(true);
      setIsCorrectAnswer(result.is_correct);
      setFeedbackExplanation(result.explanation ?? null);
      setCorrectOptionId(result.correct_option_id ?? (result.is_correct ? selectedOptionId : null));

      if (isLast) {
        const totalSecs = Math.round((Date.now() - quizStartTimeRef.current) / 1000);
        try {
          const completion = await quizService.completeAttempt(attemptId, totalSecs);
          setGamificationResult(completion.gamification ?? null);
        } catch {
          // attempt may already be completed (409)
        }
      }
    } catch (error) {
      console.warn("Erro ao submeter resposta", error);
      Alert.alert("Erro", "Não foi possível registar a resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const isLast = currentIndex === totalQuestions - 1;

    if (isLast) {
      navigation.navigate("QuizResult", {
        attemptId,
        quizId,
        gamification: gamificationResult ?? undefined,
      });
    } else {
      setSelectedOptionId(null);
      setAnswered(false);
      setIsCorrectAnswer(null);
      setFeedbackExplanation(null);
      setCorrectOptionId(null);
      setCurrentIndex((i) => i + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const getOptionStyles = (optionId: string) => {
    if (answered) {
      if (optionId === correctOptionId) {
        return {
          btn: [styles.optionBtn, styles.optionBtnCorrect],
          letter: [styles.optionLetter, styles.optionLetterCorrect],
          text: [styles.optionText, styles.optionTextCorrect],
          iconName: "check" as const,
          iconColor: appTheme.colors.success,
        };
      }
      if (optionId === selectedOptionId && !isCorrectAnswer) {
        return {
          btn: [styles.optionBtn, styles.optionBtnIncorrect],
          letter: [styles.optionLetter, styles.optionLetterIncorrect],
          text: [styles.optionText, styles.optionTextIncorrect],
          iconName: "x" as const,
          iconColor: appTheme.colors.danger ?? appTheme.colors.primary,
        };
      }
      return {
        btn: [styles.optionBtn, styles.optionBtnDefault, { opacity: 0.6 }],
        letter: [styles.optionLetter, styles.optionLetterDefault],
        text: [styles.optionText, styles.optionTextDefault],
        iconName: null,
        iconColor: null,
      };
    }

    const isSelected = selectedOptionId === optionId;
    return {
      btn: [
        styles.optionBtn,
        isSelected ? styles.optionBtnSelected : styles.optionBtnDefault,
      ],
      letter: [
        styles.optionLetter,
        isSelected ? styles.optionLetterSelected : styles.optionLetterDefault,
      ],
      text: [
        styles.optionText,
        isSelected ? styles.optionTextSelected : styles.optionTextDefault,
      ],
      iconName: isSelected ? ("check" as const) : null,
      iconColor: appTheme.colors.primaryDark,
    };
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
            const stylesInfo = getOptionStyles(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedOptionId(option.id)}
                disabled={answered}
                style={stylesInfo.btn}
              >
                <View style={styles.optionRow}>
                  <Text style={stylesInfo.letter}>
                    {option.option_key}
                  </Text>
                  <Text style={stylesInfo.text}>
                    {option.option_text}
                  </Text>
                  {stylesInfo.iconName && (
                    <Feather name={stylesInfo.iconName} size={20} color={stylesInfo.iconColor ?? undefined} style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bloco de Feedback Inline */}
        {answered && (
          <View style={[
            styles.feedbackCard,
            isCorrectAnswer ? styles.feedbackCardCorrect : styles.feedbackCardIncorrect
          ]}>
            <View style={styles.feedbackCardBody}>
              <View style={styles.feedbackTitleRow}>
                <Feather
                  name={isCorrectAnswer ? "check" : "info"}
                  size={16}
                  color={isCorrectAnswer ? appTheme.colors.success : appTheme.colors.primary}
                />
                <Text style={[
                  styles.feedbackTitle,
                  isCorrectAnswer ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect
                ]}>
                  {isCorrectAnswer ? "Resposta certa! 🎉" : "Não foi desta vez — mas aprendeu algo novo:"}
                </Text>
              </View>
              <Text style={styles.feedbackExplanationText}>
                {feedbackExplanation
                  ? feedbackExplanation
                  : isCorrectAnswer
                    ? "Excelente raciocínio. Continue assim!"
                    : "Analise a resposta para compreender melhor o tema e continue a praticar."}
              </Text>
            </View>
          </View>
        )}

        {/* Hint and Submit */}
        <View style={styles.submitSection}>
          {currentQuestion.hint_quote && !answered && (
            <View style={styles.hintRow}>
              <Feather name="help-circle" size={14} color={appTheme.colors.textMuted} style={{ marginTop: 2 }} />
              <Text style={styles.hintText}>{currentQuestion.hint_quote}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (answered) {
                handleNext();
              } else {
                void handleConfirm();
              }
            }}
            disabled={!selectedOptionId || submitting}
            style={[
              styles.submitBtn,
              (!selectedOptionId || submitting) && styles.submitBtnDisabled,
              (answered && isCorrectAnswer) && { backgroundColor: appTheme.colors.success },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.submitBtnLabel}>
                  {answered
                    ? currentIndex === totalQuestions - 1
                      ? "Ver Resultados"
                      : "Seguinte"
                    : "Confirmar Resposta"}
                </Text>
                <Feather
                  name={
                    answered
                      ? currentIndex === totalQuestions - 1
                        ? "award"
                        : "chevron-right"
                      : "check-circle"
                  }
                  size={18}
                  color="white"
                />
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
    fontFamily: appTheme.fontFamily.body,
    fontSize: 15,
    color: appTheme.colors.textMuted,
  },
  errorText: {
    fontFamily: appTheme.fontFamily.body,
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
    fontFamily: appTheme.fontFamily.heading,
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
    borderRadius: appTheme.radius.button,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: appTheme.colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: appTheme.fontFamily.body,
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
    fontFamily: appTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    letterSpacing: 2.4,
    marginBottom: 12,
    textAlign: "center",
  },
  questionSubtitle: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  questionText: {
    fontFamily: appTheme.fontFamily.heading,
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
    backgroundColor: appTheme.colors.border,
  },
  readingBlock: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: appTheme.radius.sm,
    padding: 16,
    marginBottom: 24,
  },
  readingTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  readingText: {
    fontFamily: appTheme.fontFamily.body,
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
    ...appTheme.shadow.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  optionLetter: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 18,
    fontWeight: "700",
  },
  optionLetterDefault: {
    color: appTheme.colors.primaryDark,
    opacity: 0.4,
  },
  optionLetterSelected: {
    color: appTheme.colors.primaryDark,
  },
  optionText: {
    fontFamily: appTheme.fontFamily.body,
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
    fontFamily: appTheme.fontFamily.body,
    flex: 1,
    fontStyle: "italic",
    fontSize: 13,
    color: appTheme.colors.textMuted,
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
    ...appTheme.shadow.md,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnLabel: {
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  optionBtnCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: appTheme.colors.success ?? "#10b981",
  },
  optionBtnIncorrect: {
    backgroundColor: "rgba(139, 30, 45, 0.08)",
    borderColor: appTheme.colors.primary ?? "#dc2626",
  },
  optionLetterCorrect: {
    color: appTheme.colors.success ?? "#10b981",
  },
  optionLetterIncorrect: {
    color: appTheme.colors.primary ?? "#dc2626",
  },
  optionTextCorrect: {
    color: appTheme.colors.success ?? "#10b981",
    fontWeight: "600",
  },
  optionTextIncorrect: {
    color: appTheme.colors.primary ?? "#dc2626",
    fontWeight: "600",
  },
  feedbackCard: {
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: appTheme.colors.badgeLightBg ?? "#f9fafb",
    marginBottom: 24,
    padding: 16,
    ...appTheme.shadow.sm,
  },
  feedbackCardCorrect: {
    borderLeftColor: appTheme.colors.success ?? "#10b981",
  },
  feedbackCardIncorrect: {
    borderLeftColor: appTheme.colors.primary ?? "#8b1e2d",
  },
  feedbackCardBody: {
    gap: 8,
  },
  feedbackTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackTitleCorrect: {
    color: appTheme.colors.success ?? "#10b981",
  },
  feedbackTitleIncorrect: {
    color: appTheme.colors.primary ?? "#8b1e2d",
  },
  feedbackExplanationText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 15,
    color: appTheme.colors.textSecondary ?? "#4b5563",
    lineHeight: 22,
  },
});
