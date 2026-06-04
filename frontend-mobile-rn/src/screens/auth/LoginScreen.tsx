import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { SocialButton } from "../../components/SocialButton";
import { Divider } from "../../components/Divider";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(email.trim()) && Boolean(password.trim()) && !emailError,
    [email, password, emailError],
  );

  const validateEmail = (value: string) => {
    if (value && !value.includes("@")) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError("");
  };

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      navigation.navigate("MainTabs");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn({ email: "google.demo@local", password: "" });
      navigation.navigate("MainTabs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={appTheme.colors.primary}
          />
          <Text style={styles.backLabel}>Voltar</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entra para continuar a aprender</Text>

        <SocialButton icon="G" label="Continuar com Google" onPress={handleGoogleSignIn} />

        <Divider />

        <FormInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
          }}
          placeholder="o.teu@email.com"
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Palavra-passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <View style={styles.forgotRow}>
          <Pressable>
            <Text style={styles.forgotText}>Esqueci a palavra-passe</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => void handleSignIn()}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
            pressed && canSubmit && !isSubmitting && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.submitLabel,
              (!canSubmit || isSubmitting) && styles.submitLabelDisabled,
            ]}
          >
            {isSubmitting ? "A entrar..." : "Entrar"}
          </Text>
        </Pressable>

        <View style={styles.registerWrap}>
          <Text style={styles.registerText}>Não tens conta? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Regista-te</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 0,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  backLabel: {
    color: appTheme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: appTheme.typography.heading.fontSize,
    fontWeight: appTheme.typography.heading.fontWeight,
    marginBottom: 8,
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: appTheme.colors.primary,
    fontSize: 14,
  },
  submitButton: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  submitLabel: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  submitLabelDisabled: {
    color: appTheme.colors.textMuted,
  },
  registerWrap: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  registerText: {
    color: appTheme.colors.textSecondary,
    fontSize: 16,
  },
  registerLink: {
    color: appTheme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
  },
});