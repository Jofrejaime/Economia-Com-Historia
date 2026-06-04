import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { AppButton } from "../../components/AppButton";

export function LoginPromptScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params as { type: string };
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Entrar necessário</Text>
        <Text style={styles.subtitle}>
          {type === "create-topic" && "Para criar um tópico, faz login."}
          {type === "comment" && "Para comentar, faz login."}
          {type === "quiz" && "Para fazer o quiz, faz login."}
        </Text>
        <AppButton label="Fazer Login" onPress={() => navigation.navigate("Login" as never)} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: appTheme.colors.textPrimary, marginBottom: 12 },
  subtitle: { fontSize: 16, color: appTheme.colors.textSecondary, textAlign: "center", marginBottom: 24 },
  backLink: { marginTop: 16 },
  backLinkText: { color: appTheme.colors.primary, fontSize: 16 },
});