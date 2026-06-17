import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { SocialButton } from "../../components/SocialButton";
import { Divider } from "../../components/Divider";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import { AcademicLevelButton } from "../../components/AcademicLevelButton";
import { InterestChip } from "../../components/InterestChip";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Register">;

const academicLevels = ["Ensino Médio", "Licenciatura", "Mestrado", "Outro"];
const interestsList = ["Economia", "História", "Política", "Desenvolvimento", "Outro"];

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [academicLevel, setAcademicLevel] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinueStep1 = useMemo(
    () =>
      Boolean(fullName.trim()) &&
      Boolean(email.trim()) &&
      password.length >= 8 &&
      !emailError,
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
    if (value.length >= 8) strength += 1;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[0-9]/.test(value)) strength += 1;
    setPasswordStrength(strength);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const handleRegister = async () => {
    if (!canCompleteStep2) return;
    setIsSubmitting(true);
    try {
      await signUp({ fullName, email, password });
      navigation.navigate("MainTabs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.headerShell}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (step === 1) {
                if (navigation.canGoBack()) navigation.goBack();
                return;
              }
              setStep(1);
            }}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={appTheme.colors.primary}
            />
            <Text style={styles.backLabel}>
              {step === 1 ? "Voltar" : "Anterior"}
            </Text>
          </Pressable>

          <View style={styles.progressRow}>
            <View
              style={[styles.progressSegment, styles.progressSegmentActive]}
            />
            <View
              style={[
                styles.progressSegment,
                step === 2 ? styles.progressSegmentActive : null,
              ]}
            />
          </View>
          <Text style={styles.progressText}>Passo {step} de 2</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            <Text style={styles.title}>Cria a tua conta</Text>
            <Text style={styles.subtitle}>Preenche os teus dados</Text>

            <SocialButton
              icon="G"
              label="Registar com Google"
              onPress={() => setStep(2)}
            />

            <Divider />

            <FormInput
              label="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Luís Manuel Ferreira"
            />

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
              onChangeText={(text) => {
                setPassword(text);
                calculatePasswordStrength(text);
              }}
              placeholder="mín. 8 caracteres"
              secureTextEntry
            />

            <PasswordStrengthIndicator strength={passwordStrength} />

            <Pressable
              onPress={() => canContinueStep1 && setStep(2)}
              disabled={!canContinueStep1}
              style={({ pressed }) => [
                styles.primaryButton,
                !canContinueStep1 && styles.primaryButtonDisabled,
                pressed && canContinueStep1 && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !canContinueStep1 && styles.primaryButtonTextDisabled,
                ]}
              >
                Continuar
              </Text>
            </Pressable>

            <View style={styles.termsWrap}>
              <Text style={styles.termsText}>
                Ao continuar, aceitas os{" "}
                <Text style={styles.termsLink}>Termos de Uso</Text> e{" "}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>O teu perfil</Text>
            <Text style={styles.subtitle}>
              Personaliza a tua experiência de aprendizagem
            </Text>

            <View style={styles.formGroupLarge}>
              <Text style={styles.label}>Nível académico</Text>
              <View style={styles.academicGrid}>
                {academicLevels.map((level) => (
                  <AcademicLevelButton
                    key={level}
                    level={level}
                    selected={academicLevel === level}
                    onPress={() => setAcademicLevel(level)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formGroupLarge}>
              <Text style={styles.label}>Área de interesse</Text>
              <Text style={styles.interestHint}>
                Seleciona pelo menos uma área
              </Text>
              <View style={styles.interestWrap}>
                {interestsList.map((interest) => (
                  <InterestChip
                    key={interest}
                    label={interest}
                    selected={interests.includes(interest)}
                    onPress={() => toggleInterest(interest)}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => void handleRegister()}
              disabled={!canCompleteStep2 || isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canCompleteStep2 || isSubmitting) &&
                  styles.primaryButtonDisabled,
                pressed && canCompleteStep2 && !isSubmitting && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  (!canCompleteStep2 || isSubmitting) &&
                    styles.primaryButtonTextDisabled,
                ]}
              >
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
  formGroupLarge: {
    marginBottom: 24,
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
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
  pressed: {
    opacity: 0.9,
  },
});