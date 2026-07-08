import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { MainStackParamList } from "../../types/navigation";

type QuizFeedbackRouteProp = RouteProp<MainStackParamList, "QuizFeedback">;

export function QuizFeedbackScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<QuizFeedbackRouteProp>();
  const { isCorrect, explanation, isLast, attemptId, quizId, gamification } = route.params;

  const handleNext = () => {
    if (isLast) {
      navigation.navigate("QuizResult", { attemptId, quizId, gamification });
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <HeaderBar title="Resultado" showBackButton={false} />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <View style={[styles.iconWrap, isCorrect ? styles.iconWrapCorrect : styles.iconWrapIncorrect]}>
            <Ionicons
              name={isCorrect ? "checkmark-circle" : "close-circle"}
              size={36}
              color={isCorrect ? appTheme.colors.success : appTheme.colors.primary}
            />
          </View>

          <View style={styles.statusTextContainer}>
            <Text style={styles.feedbackLabel}>Feedback do Sistema</Text>
            <Text style={[styles.statusTitle, isCorrect ? styles.statusTitleCorrect : styles.statusTitleIncorrect]}>
              {isCorrect ? "Correto" : "Incorreto"}
            </Text>
          </View>
        </View>

        {/* Explanation Card */}
        <View style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardIncorrect]}>
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Feather name={isCorrect ? "check" : "info"} size={14} color={isCorrect ? appTheme.colors.success : appTheme.colors.primary} />
              <Text style={[styles.cardTitle, isCorrect ? styles.cardTitleCorrect : styles.cardTitleIncorrect]}>
                {isCorrect ? "Explicação" : "Resposta Correta"}
              </Text>
            </View>

            <Text style={styles.explanationText}>
              {explanation
                ? explanation
                : isCorrect
                  ? "Boa resposta! Continua assim."
                  : "Não foi desta vez. Estuda bem o conteúdo relacionado e tenta novamente."}
            </Text>
          </View>
        </View>

        {/* Next */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.nextBtn, isCorrect ? styles.nextBtnCorrect : styles.nextBtnIncorrect]}
          >
            <Text style={styles.nextBtnLabel}>
              {isLast ? "Ver Resultado" : "Próxima Pergunta"}
            </Text>
            <Feather name={isLast ? "award" : "chevron-right"} size={18} color="white" />
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapCorrect: {
    backgroundColor: appTheme.colors.successLight,
  },
  iconWrapIncorrect: {
    backgroundColor: appTheme.colors.dangerLight,
  },
  statusTextContainer: {
    flex: 1,
  },
  feedbackLabel: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.success,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statusTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 38,
    fontWeight: "700",
  },
  statusTitleCorrect: {
    color: appTheme.colors.primaryDark,
  },
  statusTitleIncorrect: {
    color: appTheme.colors.danger,
  },
  card: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: 8,
    borderLeftWidth: 4,
    overflow: "hidden",
    marginBottom: 32,
    ...appTheme.shadow.sm,
  },
  cardCorrect: {
    borderLeftColor: appTheme.colors.success,
  },
  cardIncorrect: {
    borderLeftColor: appTheme.colors.primaryDark,
  },
  cardBody: {
    padding: 24,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardTitleCorrect: {
    color: appTheme.colors.success,
  },
  cardTitleIncorrect: {
    color: appTheme.colors.primaryDark,
  },
  explanationText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 24,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: appTheme.radius.sm,
  },
  nextBtnCorrect: {
    backgroundColor: appTheme.colors.success,
    ...appTheme.shadow.md,
  },
  nextBtnIncorrect: {
    backgroundColor: appTheme.colors.primary,
    ...appTheme.shadow.md,
  },
  nextBtnLabel: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
