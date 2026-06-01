import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { AppButton } from "../../components/AppButton";
import { appTheme } from "../../constants/theme";
import { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Ponto de entrada pós-login, preservando nomenclatura original</Text>
        <View style={styles.buttonWrapper}>
          <AppButton label="Abrir navegação principal" onPress={() => navigation.navigate("MainTabs")} />
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
    fontSize: appTheme.typography.heading.fontSize,
    fontWeight: appTheme.typography.heading.fontWeight,
    color: appTheme.colors.textPrimary,
  },
  subtitle: {
    marginTop: appTheme.spacing.sm,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: appTheme.spacing.lg,
  },
  buttonWrapper: {
    width: "100%",
  },
});
