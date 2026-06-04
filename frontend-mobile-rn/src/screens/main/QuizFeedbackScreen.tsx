import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

type RouteParams = {
  isCorrect: boolean;
};

export function QuizFeedbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isCorrect } = (route.params as RouteParams) || { isCorrect: false };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Ionicons
          name={isCorrect ? "checkmark-circle" : "close-circle"}
          size={80}
          color={isCorrect ? appTheme.colors.success : appTheme.colors.danger}
        />
        <Text style={styles.feedbackText}>
          {isCorrect ? "Resposta correta!" : "Resposta errada!"}
        </Text>
        <Text style={styles.subtitle}>
          {isCorrect
            ? "Muito bem! Continue assim."
            : "Não desanime, reveja o conteúdo e tente novamente."}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: appTheme.colors.primary,
  },
  buttonText: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});