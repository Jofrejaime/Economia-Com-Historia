import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
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
  const { isCorrect, onNext } = route.params as { isCorrect: boolean; onNext?: () => void };

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
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80" }}
              style={styles.cardImage}
            />
            <View style={styles.imageOverlay} />
          </View>

          {/* Content */}
          <View style={styles.cardBody}>
            {/* Title */}
            <View style={styles.cardTitleRow}>
              <Feather name="check" size={14} color={isCorrect ? "#047857" : appTheme.colors.primary} />
              <Text style={[styles.cardTitle, isCorrect ? styles.cardTitleCorrect : styles.cardTitleIncorrect]}>
                Análise Histórica
              </Text>
            </View>

            {/* Explanation */}
            <Text style={styles.explanationText}>
              {isCorrect ? (
                "A introdução do Kwanza em 1977 não foi apenas uma mudança monetária, mas um acto de soberania económica fundamental para o recém-formado Estado angolano. Este processo permitiu o controlo centralizado da liquidez e a dissociação definitiva do sistema financeiro colonial português, estabelecendo as bases para a governação macroeconómica do país."
              ) : (
                "A resposta correta era a opção B. A abolição do tráfico negreiro em 1836 forçou uma transição para a \"economia lícita\", focada na exportação de produtos como cera, marfim e óleo de palma. Esta mudança representou uma transformação profunda na estrutura económica de Luanda, embora não tenha eliminado imediatamente todas as formas de trabalho forçado."
              )}
            </Text>

            {/* Link to Chapter */}
            <TouchableOpacity style={styles.reviewBtn}>
              <Feather name="arrow-right" size={14} color={isCorrect ? "#047857" : appTheme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.reviewBtnText, isCorrect ? styles.reviewTextCorrect : styles.reviewTextIncorrect]}>
                Rever capítulo: "A Reforma de 1977"
              </Text>
              <View style={[styles.dot, { backgroundColor: isCorrect ? "#047857" : appTheme.colors.primary }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress and Next */}
        <View style={styles.footerSection}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progresso:</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: isCorrect ? "#047857" : appTheme.colors.primary },
                ]}
              />
            </View>
            <Text style={styles.progressValue}>12/16</Text>
          </View>

          {/* Next Button */}
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
  imageContainer: {
    height: 160,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(107,1,25,0.1)",
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
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewTextCorrect: {
    color: "#047857",
  },
  reviewTextIncorrect: {
    color: "#6B0119",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(222,191,191,0.2)",
    paddingTop: 24,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#574142",
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#D9E3F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "75%",
    height: "100%",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#574142",
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