import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function LoginPromptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { type } = (route.params as { type: "create-topic" | "comment" | "quiz" }) || {
    type: "quiz",
  };

  const prompts = {
    "create-topic": {
      title: "Quer debater sobre um tema?",
      description: "Faça login para criar tópicos e participar das discussões da comunidade.",
    },
    comment: {
      title: "Quer deixar a sua opinião?",
      description: "Faça login para comentar e participar activamente nas discussões.",
    },
    quiz: {
      title: "Quer testar os seus conhecimentos?",
      description: "Faça login para realizar quizzes e acompanhar o seu progresso académico.",
    },
  };

  const currentPrompt = prompts[type] || prompts["quiz"];

  const benefits = [
    "Criar e participar em debates",
    "Comentar e partilhar opiniões",
    "Realizar quizzes e acompanhar progresso",
    "Aceder a conteúdos exclusivos",
  ];

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Login Necessário" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Icon */}
          <View style={styles.iconCircleWrap}>
            <View style={styles.iconCircle}>
              <Feather name="log-in" size={44} color={appTheme.colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.contentTitle}>{currentPrompt.title}</Text>

          {/* Description */}
          <Text style={styles.contentDesc}>{currentPrompt.description}</Text>

          {/* Benefits Box */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Com uma conta podes:</Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.checkmarkIcon}>
                    <Feather name="check" size={12} color="white" />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Feather name="log-in" size={18} color="white" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Fazer Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  contentWrap: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconCircleWrap: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: appTheme.colors.debateHighlightBg,
    alignItems: "center",
    justifyContent: "center",
  },
  contentTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 32,
  },
  contentDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  benefitsCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 24,
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  benefitsTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    flex: 1,
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.primary,
    height: 52,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  btnIcon: {
    marginTop: 1,
  },
  primaryButtonText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: appTheme.colors.surface,
    height: 52,
    borderRadius: appTheme.radius.button,
    borderWidth: 2,
    borderColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});