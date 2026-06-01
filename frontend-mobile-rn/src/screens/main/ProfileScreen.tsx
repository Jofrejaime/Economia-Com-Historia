import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { AppButton } from "../../components/AppButton";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

export function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Estrutura inicial de perfil e definições</Text>
        <View style={styles.buttonWrapper}>
          <AppButton label="Terminar sessão" onPress={() => void signOut()} />
        </View>
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
    marginBottom: appTheme.spacing.lg,
  },
  buttonWrapper: {
    width: "100%",
  },
});
