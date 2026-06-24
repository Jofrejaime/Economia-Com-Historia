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
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function QuizResultScreen() {
  const navigation = useNavigation<any>();

  const handleViewRanking = () => {
    // Go to MainTabs and select QuizList tab
    navigation.navigate("MainTabs", { screen: "QuizList" });
  };

  const handleExploreContent = () => {
    navigation.navigate("MainTabs", { screen: "Content" });
  };

  const handleRetakeQuiz = () => {
    navigation.navigate("Quiz");
  };

  return (
    <ScreenContainer style={[styles.container, { paddingHorizontal: 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Resultado Final" />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Score Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Conclusão{"\n"}Meritória</Text>
          <Text style={styles.heroDesc}>
            Parabéns pela sua dedicação ao estudo da trajetória económica de Angola. O seu desempenho reflete um compromisso com o rigor histórico.
          </Text>

          {/* Radial Score Circle (Simulated) */}
          <View style={styles.circleContainer}>
            <View style={styles.scoreOuterCircle}>
              <View style={styles.scoreInnerCircle}>
                <Text style={styles.scoreValue}>85%</Text>
                <Text style={styles.scoreLabel}>SCORE FINAL</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Cards */}
        <View style={styles.performanceBlock}>
          {/* Domain Card */}
          <View style={styles.whiteCard}>
            <Text style={styles.cardHeaderLabel}>ANÁLISE DE DOMÍNIO</Text>
            <Text style={styles.cardHeaderTitle}>Desempenho por Período</Text>

            <View style={styles.progressList}>
              <View style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressTitle}>Economia Pré-Colonial</Text>
                  <Text style={styles.progressPercent}>92%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: "92%" }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressTitle}>O Ciclo do Café e Diamantes</Text>
                  <Text style={styles.progressPercent}>78%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: "78%" }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressTitle}>Reconstrução Pós-Guerra</Text>
                  <Text style={styles.progressPercent}>85%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: "85%" }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.redCard}>
            <Feather name="award" size={24} color="white" style={styles.trophyIcon} />
            <Text style={styles.correctCount}>17 / 20</Text>
            <Text style={styles.correctSub}>
              Respostas Corretas articuladas com precisão histórica.
            </Text>

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>TEMPO TOTAL</Text>
              <Text style={styles.timeValue}>12m 45s</Text>
            </View>
          </View>
        </View>

        {/* Editorial Insights */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <Feather name="book-open" size={20} color={appTheme.colors.primary} />
            <Text style={styles.insightsHeaderTitle}>Parecer Académico</Text>
          </View>

          <View style={styles.insightsList}>
            <View style={styles.insightBox}>
              <Text style={styles.insightBoxTitle}>Pontos Fortes</Text>
              <Text style={styles.insightBoxText}>
                Demonstrou uma compreensão profunda das rotas comerciais ancestrais e do impacto da moeda 'Kwanza' na soberania nacional.
              </Text>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightBoxTitle}>Sugestão de Estudo</Text>
              <Text style={styles.insightBoxText}>
                Recomendamos a revisão do módulo sobre a 'Diversificação Económica Pós-2002' para consolidar os conceitos de macroeconomia angolana.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity onPress={handleViewRanking} style={styles.primaryActionBtn}>
            <Feather name="trending-up" size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Ver Ranking</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleExploreContent} style={styles.secondaryActionBtn}>
            <Feather name="book-open" size={16} color="#574142" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryActionText}>Explorar Mais Conteúdos</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRetakeQuiz} style={styles.linkActionBtn}>
            <Feather name="refresh-cw" size={16} color={appTheme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.linkActionText}>Refazer Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Visual Context Grayscale Image */}
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80" }}
          style={styles.grayscaleImage}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9ff",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7f1d1d",
    fontFamily: "IBM_Plex_Sans",
    letterSpacing: -0.45,
  },
  searchBtn: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: "#eff4ff",
    borderRadius: 8,
    borderLeftWidth: 8,
    borderLeftColor: "#8b1e2d",
    padding: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: "#8b1e2d",
    lineHeight: 36,
    letterSpacing: -0.9,
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 15,
    color: "#574142",
    lineHeight: 22,
    marginBottom: 24,
  },
  circleContainer: {
    alignItems: "center",
  },
  scoreOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: "#8B1E2D", // Simplified circle progress border
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreInnerCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 38,
    fontWeight: "700",
    color: "#8b1e2d",
    lineHeight: 38,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#894d50",
    letterSpacing: 1,
    marginTop: 2,
  },
  performanceBlock: {
    gap: 20,
    marginBottom: 32,
  },
  whiteCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#894d50",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  cardHeaderTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
  },
  progressList: {
    gap: 16,
  },
  progressItem: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8b1e2d",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#dee9fc",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b1e2d",
    borderRadius: 3,
  },
  redCard: {
    backgroundColor: "#8b1e2d",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    position: "relative",
  },
  trophyIcon: {
    position: "absolute",
    right: 20,
    top: 20,
    opacity: 0.8,
  },
  correctCount: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginTop: 12,
    marginBottom: 8,
  },
  correctSub: {
    fontSize: 13,
    color: "#ff9da0",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  timeSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    width: "100%",
    paddingTop: 16,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  insightsSection: {
    marginBottom: 32,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  insightsHeaderTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  insightsList: {
    gap: 12,
  },
  insightBox: {
    backgroundColor: "#eff4ff",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#debfbf",
    padding: 16,
  },
  insightBoxTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b1e2d",
    marginBottom: 4,
  },
  insightBoxText: {
    fontSize: 13,
    color: "#574142",
    lineHeight: 18,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(222,191,191,0.3)",
    paddingTop: 24,
    gap: 12,
    marginBottom: 24,
  },
  primaryActionBtn: {
    flexDirection: "row",
    backgroundColor: "#8b1e2d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    flexDirection: "row",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#debfbf",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: "#574142",
    fontSize: 15,
    fontWeight: "700",
  },
  linkActionBtn: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkActionText: {
    color: appTheme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  grayscaleImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    opacity: 0.6,
    marginBottom: 16,
  },
});