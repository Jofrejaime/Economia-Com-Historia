import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Modal, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // States for Password Recovery
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryEmailError, setRecoveryEmailError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCodeError, setRecoveryCodeError] = useState("");
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

  // Recovery methods
  const handleSendRecoveryCode = async () => {
    const trimmedEmail = recoveryEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setRecoveryEmailError("Email inválido");
      return;
    }
    setIsRecoverySubmitting(true);
    setRecoveryEmailError("");
    try {
      // simulated verification delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const registeredEmailsRaw = await AsyncStorage.getItem("@registered_emails");
      const registered = registeredEmailsRaw ? JSON.parse(registeredEmailsRaw) : ["user@demo.com", "luis@demo.com"];

      if (registered.includes(trimmedEmail.toLowerCase())) {
        setIsEmailVerified(true);
        // Automatically prefill verification code
        setRecoveryCode("123456");
        if (Platform.OS === "web") {
          window.alert(`Código Enviado\n\nEnviámos o código de verificação para o email ${trimmedEmail}.\n\n(Para efeitos de teste, o código é: 123456)`);
        } else {
          Alert.alert(
            "Código Enviado",
            `Enviámos o código de verificação para o email ${trimmedEmail}.\n\n(Para efeitos de teste, o código é: 123456)`
          );
        }
      } else {
        setRecoveryEmailError("Este email não está associado a nenhuma conta.");
      }
    } catch (error) {
      console.error(error);
      setRecoveryEmailError("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsRecoverySubmitting(false);
    }
  };

  const handleVerifyRecoveryCode = async () => {
    if (recoveryCode !== "123456") {
      setRecoveryCodeError("Código incorreto");
      return;
    }
    setIsRecoverySubmitting(true);
    setRecoveryCodeError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Reset recovery modal state and close
      const targetEmail = recoveryEmail.trim();
      setIsModalVisible(false);
      setIsEmailVerified(false);
      setRecoveryEmail("");
      setRecoveryCode("");

      // Log in as recovery user
      await signIn({ email: targetEmail, password: "" });

      // Navigate to security/privacy screen
      navigation.navigate("Privacy", { isFromRecovery: true });
    } catch (error) {
      console.error(error);
      setRecoveryCodeError("Erro ao redirecionar. Tente novamente.");
    } finally {
      setIsRecoverySubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setRecoveryEmail("");
    setRecoveryEmailError("");
    setIsEmailVerified(false);
    setRecoveryCode("");
    setRecoveryCodeError("");
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
          <Pressable onPress={() => setIsModalVisible(true)}>
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

      {/* Password Recovery Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recuperar Palavra-passe</Text>
              <Pressable onPress={handleCloseModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={appTheme.colors.textSecondary} />
              </Pressable>
            </View>

            {/* Modal Body */}
            {!isEmailVerified ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Introduz o email com o qual fizeste a abertura de conta para receberes um código de verificação.
                </Text>
                
                <FormInput
                  label="Email da Conta"
                  value={recoveryEmail}
                  onChangeText={(text) => {
                    setRecoveryEmail(text);
                    if (recoveryEmailError) setRecoveryEmailError("");
                  }}
                  placeholder="o.teu@email.com"
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
                  <Text style={styles.modalSubmitLabel}>
                    {isRecoverySubmitting ? "A enviar..." : "Enviar código"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Enviámos um código para <Text style={styles.boldText}>{recoveryEmail}</Text>. Introduz o código abaixo para prosseguir.
                </Text>

                <FormInput
                  label="Código de Verificação"
                  value={recoveryCode}
                  onChangeText={(text) => {
                    if (text.length <= 6) {
                      setRecoveryCode(text);
                    }
                    if (recoveryCodeError) setRecoveryCodeError("");
                  }}
                  placeholder="Introduza o código de 6 dígitos"
                  error={recoveryCodeError}
                  keyboardType="numeric"
                />

                <Pressable
                  onPress={() => void handleVerifyRecoveryCode()}
                  disabled={isRecoverySubmitting}
                  style={({ pressed }) => [
                    styles.modalSubmitButton,
                    isRecoverySubmitting && styles.submitButtonDisabled,
                    pressed && !isRecoverySubmitting && styles.pressed,
                  ]}
                >
                  <Text style={styles.modalSubmitLabel}>
                    {isRecoverySubmitting ? "A verificar..." : "Verificar Código"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsEmailVerified(false)}
                  disabled={isRecoverySubmitting}
                  style={styles.modalSecondaryButton}
                >
                  <Text style={styles.modalSecondaryLabel}>Alterar Email</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: appTheme.colors.secondary,
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
  // Password Recovery Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    gap: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalSubmitButton: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalSubmitLabel: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  modalSecondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  modalSecondaryLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  boldText: {
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
});