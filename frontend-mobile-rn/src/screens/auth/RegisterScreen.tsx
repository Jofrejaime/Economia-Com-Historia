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

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const academicLevels = ["Ensino Médio", "Licenciatura", "Mestrado", "Outro"];
const interestsList = ["Economia", "História", "Política", "Desenvolvimento", "Outro"];

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [academicLevel, setAcademicLevel] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinueStep1 = useMemo(
    () => Boolean(fullName.trim()) && Boolean(email.trim()) && password.length >= 8 && !emailError,
    [fullName, email, password, emailError],
  );

  const canCompleteStep2 = useMemo(
    () => Boolean(academicLevel) && interests.length > 0,
    [academicLevel, interests],
  );

  const validateEmail = (value: string) => {
    if (value && !value.includes("@")) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError("");
  };

  const calculatePasswordStrength = (value: string) => {
    let strength = 0;
    if (value.length >= 8) {
      strength += 1;
    }
    if (/[A-Z]/.test(value)) {
      strength += 1;
    }
    if (/[0-9]/.test(value)) {
      strength += 1;
    }
    setPasswordStrength(strength);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleRegister = async () => {
    if (!canCompleteStep2) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        fullName,
        email,
        password,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.headerShell}>
        <View style={styles.statusBarMock}>
          <Text style={styles.statusTime}>9:41</Text>
          <Text style={styles.statusIcons}>📶 📡 🔋</Text>
        </View>

        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (step === 1) {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
                return;
              }
              setStep(1);
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={appTheme.colors.primary} />
            <Text style={styles.backLabel}>{step === 1 ? "Voltar" : "Anterior"}</Text>
          </Pressable>

          <View style={styles.progressRow}>
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, step === 2 ? styles.progressSegmentActive : null]} />
          </View>
          <Text style={styles.progressText}>Passo {step} de 2</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Cria a tua conta</Text>
            <Text style={styles.subtitle}>Preenche os teus dados</Text>

            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
              onPress={() => setStep(2)}
            >
              <View style={styles.googleIconWrap}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonLabel}>Registar com Google</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Luís Manuel Ferreira"
                placeholderTextColor={appTheme.colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
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
                  placeholder="mín. 8 caracteres"
                  placeholderTextColor={appTheme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    calculatePasswordStrength(text);
                  }}
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

              {password ? (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBarRow}>
                    <View style={[styles.strengthBar, passwordStrength >= 1 ? styles.strengthWeak : null]} />
                    <View style={[styles.strengthBar, passwordStrength >= 2 ? styles.strengthMedium : null]} />
                    <View style={[styles.strengthBar, passwordStrength >= 3 ? styles.strengthStrong : null]} />
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      passwordStrength === 1
                        ? styles.strengthWeakText
                        : passwordStrength === 2
                          ? styles.strengthMediumText
                          : styles.strengthStrongText,
                    ]}
                  >
                    {passwordStrength === 1 ? "Fraca" : passwordStrength === 2 ? "Média" : "Forte"}
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={() => canContinueStep1 && setStep(2)}
              disabled={!canContinueStep1}
              style={({ pressed }) => [
                styles.primaryButton,
                !canContinueStep1 && styles.primaryButtonDisabled,
                pressed && canContinueStep1 && styles.pressed,
              ]}
            >
              <Text style={[styles.primaryButtonText, !canContinueStep1 && styles.primaryButtonTextDisabled]}>
                Continuar
              </Text>
            </Pressable>

            <View style={styles.termsWrap}>
              <Text style={styles.termsText}>
                Ao continuar, aceitas os <Text style={styles.termsLink}>Termos de Uso</Text> e <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>O teu perfil</Text>
            <Text style={styles.subtitle}>Personaliza a tua experiência de aprendizagem</Text>

            <View style={styles.formGroupLarge}>
              <Text style={styles.label}>Nível académico</Text>
              <View style={styles.academicGrid}>
                {academicLevels.map((level) => {
                  const selected = academicLevel === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => setAcademicLevel(level)}
                      style={({ pressed }) => [
                        styles.academicButton,
                        selected && styles.academicButtonSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.academicButtonText, selected && styles.academicButtonTextSelected]}>{level}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formGroupLarge}>
              <Text style={styles.label}>Área de interesse</Text>
              <Text style={styles.interestHint}>Seleciona pelo menos uma área</Text>
              <View style={styles.interestWrap}>
                {interestsList.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <Pressable
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      style={({ pressed }) => [
                        styles.interestChip,
                        selected && styles.interestChipSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.interestChipText, selected && styles.interestChipTextSelected]}>{interest}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={() => void handleRegister()}
              disabled={!canCompleteStep2 || isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canCompleteStep2 || isSubmitting) && styles.primaryButtonDisabled,
                pressed && canCompleteStep2 && !isSubmitting && styles.pressed,
              ]}
            >
              <Text style={[styles.primaryButtonText, (!canCompleteStep2 || isSubmitting) && styles.primaryButtonTextDisabled]}>
                {isSubmitting ? "A criar..." : "Criar conta"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 0,
  },
  headerShell: {
    backgroundColor: appTheme.colors.surface,
  },
  statusBarMock: {
    minHeight: 44,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusTime: {
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    fontWeight: "700",
  },
  statusIcons: {
    fontSize: 13,
    color: appTheme.colors.textPrimary,
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
    marginBottom: 16,
  },
  backLabel: {
    color: appTheme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.border,
  },
  progressSegmentActive: {
    backgroundColor: appTheme.colors.primary,
  },
  progressText: {
    marginTop: 8,
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    paddingBottom: 48,
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
  formGroupLarge: {
    marginBottom: 24,
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
  error: {
    color: appTheme.colors.danger,
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
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
  strengthWrap: {
    marginTop: 8,
  },
  strengthBarRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.border,
  },
  strengthWeak: {
    backgroundColor: appTheme.colors.danger,
  },
  strengthMedium: {
    backgroundColor: appTheme.colors.warning,
  },
  strengthStrong: {
    backgroundColor: appTheme.colors.success,
  },
  strengthText: {
    fontSize: 12,
  },
  strengthWeakText: {
    color: appTheme.colors.danger,
  },
  strengthMediumText: {
    color: appTheme.colors.warning,
  },
  strengthStrongText: {
    color: appTheme.colors.success,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  primaryButtonText: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButtonTextDisabled: {
    color: appTheme.colors.textMuted,
  },
  termsWrap: {
    marginTop: 32,
  },
  termsText: {
    textAlign: "center",
    color: appTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: appTheme.colors.primary,
    fontWeight: "500",
  },
  academicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  academicButton: {
    width: "48%",
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  academicButtonSelected: {
    backgroundColor: "#FDF3F4",
    borderColor: appTheme.colors.primary,
  },
  academicButtonText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  academicButtonTextSelected: {
    color: appTheme.colors.primary,
  },
  interestHint: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
  },
  interestWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    minHeight: 36,
    borderRadius: appTheme.radius.pill,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: appTheme.colors.surface,
  },
  interestChipSelected: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.primary,
  },
  interestChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  interestChipTextSelected: {
    color: appTheme.colors.surface,
  },
  pressed: {
    opacity: 0.9,
  },
});
