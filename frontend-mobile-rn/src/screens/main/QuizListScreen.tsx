import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";

export function QuizListScreen() {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>QuizList</Text>
        <Text style={styles.subtitle}>Estrutura inicial da lista de quizzes</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: appTheme.typography.title.fontSize,
    fontWeight: appTheme.typography.title.fontWeight,
    color: appTheme.colors.textPrimary,
  },
  subtitle: {
    marginTop: appTheme.spacing.sm,
    color: appTheme.colors.textSecondary,
  },
});
