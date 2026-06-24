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

  const handleSendRecoveryCode = async () => {
    const trimmedEmail = recoveryEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setRecoveryEmailError("Email inválido");
      return;
    }
    setIsRecoverySubmitting(true);
    setRecoveryEmailError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const registeredEmailsRaw = await AsyncStorage.getItem("@registered_emails");
      const registered = registeredEmailsRaw ? JSON.parse(registeredEmailsRaw) : ["user@demo.com", "luis@demo.com"];

      if (registered.includes(trimmedEmail.toLowerCase())) {
        setIsEmailVerified(true);
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
      const targetEmail = recoveryEmail.trim();
      setIsModalVisible(false);
      setIsEmailVerified(false);
      setRecoveryEmail("");
      setRecoveryCode("");
      await signIn({ email: targetEmail, password: "" });
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
          <Pressable onPress={() => setIsModalVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
          {isSubmitting ? (
            <ActivityIndicator size="small" color={appTheme.colors.surface} />
          ) : (
            <Text style={[styles.submitLabel, (!canSubmit || isSubmitting) && styles.submitLabelDisabled]}>
              Entrar
            </Text>
          )}
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
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recuperar Palavra-passe</Text>
              <Pressable onPress={handleCloseModal} style={styles.modalCloseButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={appTheme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {!isEmailVerified ? (
                <>
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
                    {isRecoverySubmitting ? (
                      <ActivityIndicator size="small" color={appTheme.colors.surface} />
                    ) : (
                      <Text style={styles.modalSubmitLabel}>Enviar código</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.modalDescription}>
                    Enviámos um código para{" "}
                    <Text style={styles.modalEmailHighlight}>{recoveryEmail}</Text>.{" "}
                    Introduz o código abaixo para prosseguir.
                  </Text>

                  <FormInput
                    label="Código de Verificação"
                    value={recoveryCode}
                    onChangeText={(text) => {
                      if (text.length <= 6) setRecoveryCode(text);
                      if (recoveryCodeError) setRecoveryCodeError("");
                    }}
                    placeholder="000000"
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
                    {isRecoverySubmitting ? (
                      <ActivityIndicator size="small" color={appTheme.colors.surface} />
                    ) : (
                      <Text style={styles.modalSubmitLabel}>Verificar Código</Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => setIsEmailVerified(false)}
                    disabled={isRecoverySubmitting}
                    style={styles.modalSecondaryButton}
                  >
                    <Text style={styles.modalSecondaryLabel}>Alterar email</Text>
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
    paddingTop: 36,
    paddingBottom: 48,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  submitLabel: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  submitLabelDisabled: {
    color: appTheme.colors.textMuted,
  },
  registerWrap: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 15,
  },
  registerLink: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
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
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
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
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalEmailHighlight: {
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  modalSubmitButton: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalSubmitLabel: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  modalSecondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  modalSecondaryLabel: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
