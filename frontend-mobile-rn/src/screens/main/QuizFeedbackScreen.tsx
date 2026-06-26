import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function QuizFeedbackScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isCorrect, explanation, onNext } = route.params as {
    isCorrect: boolean;
    explanation: string | null;
    onNext?: () => void;
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      navigation.navigate("QuizResult");
    }
  };

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Resultado" />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          {/* Icon */}
          <View style={[styles.iconWrap, isCorrect ? styles.iconWrapCorrect : styles.iconWrapIncorrect]}>
            <Ionicons
              name={isCorrect ? "checkmark-circle" : "close-circle"}
              size={36}
              color={isCorrect ? "#003A32" : appTheme.colors.primary}
            />
          </View>

          {/* Status */}
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
            {/* Title */}
            <View style={styles.cardTitleRow}>
              <Feather name={isCorrect ? "check" : "info"} size={14} color={isCorrect ? "#047857" : appTheme.colors.primary} />
              <Text style={[styles.cardTitle, isCorrect ? styles.cardTitleCorrect : styles.cardTitleIncorrect]}>
                {isCorrect ? "Explicação" : "Resposta Correta"}
              </Text>
            </View>

            {/* Explanation */}
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
            style={[
              styles.nextBtn,
              isCorrect ? styles.nextBtnCorrect : styles.nextBtnIncorrect,
            ]}
          >
            <Text style={styles.nextBtnLabel}>Próxima Pergunta</Text>
            <Feather name="chevron-right" size={18} color="white" />
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
  closeButton: {
    padding: 4,
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
    backgroundColor: "#90D3C5",
  },
  iconWrapIncorrect: {
    backgroundColor: "#FCA5A5",
  },
  statusTextContainer: {
    flex: 1,
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003A32",
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
    color: "#6B0119",
  },
  statusTitleIncorrect: {
    color: appTheme.colors.danger,
  },
  card: {
    backgroundColor: "#EFF4FF",
    borderRadius: 8,
    borderLeftWidth: 4,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCorrect: {
    borderLeftColor: "#047857",
  },
  cardIncorrect: {
    borderLeftColor: "#6B0119",
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
    color: "#047857",
  },
  cardTitleIncorrect: {
    color: "#6B0119",
  },
  explanationText: {
    fontSize: 16,
    color: "#574142",
    lineHeight: 24,
    marginBottom: 20,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(222,191,191,0.2)",
    paddingTop: 24,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 10,
  },
  nextBtnCorrect: {
    backgroundColor: "#047857",
    shadowColor: "#047857",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnIncorrect: {
    backgroundColor: appTheme.colors.primary,
    shadowColor: appTheme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});