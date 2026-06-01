import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { AuthStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
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
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={appTheme.colors.primary} />
          <Text style={styles.backLabel}>Voltar</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entra para continuar a aprender</Text>

        <Pressable
          style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
          onPress={handleSignIn}
        >
          <View style={styles.googleIconWrap}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.googleButtonLabel}>Continuar com Google</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="o.teu@email.com"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
          />
          {emailError ? (
            <Text style={styles.error}>⚠ {emailError}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Palavra-passe</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor={appTheme.colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={appTheme.colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

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
          <Text style={[styles.submitLabel, (!canSubmit || isSubmitting) && styles.submitLabelDisabled]}>
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
  googleButton: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    backgroundColor: appTheme.colors.surface,
  },
  googleIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    color: "#4285F4",
    fontWeight: "700",
    fontSize: 12,
  },
  googleButtonLabel: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: appTheme.colors.border,
  },
  dividerText: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.surface,
    minHeight: 48,
    paddingHorizontal: appTheme.spacing.md,
    color: appTheme.colors.textPrimary,
  },
  inputError: {
    borderColor: appTheme.colors.danger,
    backgroundColor: "#FEF2F2",
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 14,
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
    backgroundColor: appTheme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
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
  error: {
    color: appTheme.colors.danger,
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.9,
  },
});
