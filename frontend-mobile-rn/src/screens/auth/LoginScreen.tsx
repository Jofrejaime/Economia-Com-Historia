import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Modal, Alert, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { SocialButton } from "../../components/SocialButton";
import { Divider } from "../../components/Divider";
import { ErrorBanner } from "../../components/ErrorBanner";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { parseApiError } from "../../utils/apiError";
import { MainStackParamList } from "../../types/navigation";
import { httpClient } from "../../services/http/client";
import { API_ENDPOINTS } from "../../constants/api";

type Props = NativeStackScreenProps<MainStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryEmailError, setRecoveryEmailError] = useState("");
  const [isRecoverySuccess, setIsRecoverySuccess] = useState(false);
  const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);

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
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      navigation.navigate("MainTabs");
    } catch (err: unknown) {
      setLoginError(parseApiError(err));
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

  const handleSendRecoveryCode = async () => {
    const trimmedEmail = recoveryEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setRecoveryEmailError("Email inválido");
      return;
    }
    setIsRecoverySubmitting(true);
    setRecoveryEmailError("");
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: trimmedEmail });
      setIsRecoverySuccess(true);
    } catch (error) {
      console.error(error);
      setRecoveryEmailError(parseApiError(error));
    } finally {
      setIsRecoverySubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setRecoveryEmail("");
    setRecoveryEmailError("");
    setIsRecoverySuccess(false);
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Iniciar Sessão" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            if (loginError) setLoginError(null);
          }}
          placeholder="o.seu@email.com"
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Palavra-passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (loginError) setLoginError(null);
          }}
          placeholder="••••••••"
          secureTextEntry
        />

        <View style={styles.forgotRow}>
          <Pressable onPress={() => setIsModalVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.forgotText}>Esqueci a palavra-passe</Text>
          </Pressable>
        </View>

        <ErrorBanner message={loginError} onDismiss={() => setLoginError(null)} />

        <Pressable
          onPress={() => void handleSignIn()}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
            pressed && canSubmit && !isSubmitting && styles.pressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={appTheme.colors.surface} />
          ) : (
            <Text style={[styles.submitLabel, (!canSubmit || isSubmitting) && styles.submitLabelDisabled]}>
              Entrar
            </Text>
          )}
        </Pressable>

        <View style={styles.registerWrap}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Criar Conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Password Recovery Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recuperar Palavra-passe</Text>
              <Pressable onPress={handleCloseModal} style={styles.modalCloseButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={appTheme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {!isRecoverySuccess ? (
                <>
                  <Text style={styles.modalDescription}>
                    Introduza o email com o qual fez a abertura de conta para receber um link de redefinição.
                  </Text>

                  <FormInput
                    label="Email da Conta"
                    value={recoveryEmail}
                    onChangeText={(text) => {
                      setRecoveryEmail(text);
                      if (recoveryEmailError) setRecoveryEmailError("");
                    }}
                    placeholder="o.seu@email.com"
                    error={recoveryEmailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Pressable
                    onPress={() => void handleSendRecoveryCode()}
                    disabled={isRecoverySubmitting}
                    style={({ pressed }) => [
                      styles.modalSubmitButton,
                      isRecoverySubmitting && styles.submitButtonDisabled,
                      pressed && !isRecoverySubmitting && styles.pressed,
                    ]}
                  >
                    {isRecoverySubmitting ? (
                      <ActivityIndicator size="small" color={appTheme.colors.surface} />
                    ) : (
                      <Text style={styles.modalSubmitLabel}>Enviar link</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.modalDescription}>
                    Enviámos um link de redefinição de palavra-passe para o email <Text style={styles.modalEmailHighlight}>{recoveryEmail}</Text>. Por favor, consulte a sua caixa de entrada para prosseguir.
                  </Text>

                  <Pressable
                    onPress={handleCloseModal}
                    style={styles.modalSubmitButton}
                  >
                    <Text style={styles.modalSubmitLabel}>Fechar</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: appTheme.spacing.xl,
    paddingBottom: 48,
  },
  title: {
    ...appTheme.typography.heading,
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...appTheme.typography.body,
    color: appTheme.colors.textSecondary,
    marginBottom: 32,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    ...appTheme.typography.label,
    color: appTheme.colors.primary,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  submitLabel: {
    ...appTheme.typography.body,
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.surface,
    fontWeight: "700",
  },
  submitLabelDisabled: {
    color: appTheme.colors.textMuted,
  },
  registerWrap: {
    marginTop: appTheme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    ...appTheme.typography.body,
    fontSize: 15,
    color: appTheme.colors.textSecondary,
  },
  registerLink: {
    ...appTheme.typography.body,
    fontSize: 15,
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: appTheme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    width: "100%",
    maxWidth: 400,
    ...appTheme.shadow.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  modalTitle: {
    ...appTheme.typography.titleSmall,
    color: appTheme.colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
    gap: 0,
  },
  modalDescription: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textSecondary,
    marginBottom: 20,
  },
  modalEmailHighlight: {
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  modalSubmitButton: {
    minHeight: 52,
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalSubmitLabel: {
    ...appTheme.typography.body,
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.surface,
    fontWeight: "700",
  },
  modalSecondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  modalSecondaryLabel: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
    fontWeight: "600",
  },
});
