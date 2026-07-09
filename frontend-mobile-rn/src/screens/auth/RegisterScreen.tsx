import React, { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { HeaderBar } from "../../components/HeaderBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { SocialButton } from "../../components/SocialButton";
import { Divider } from "../../components/Divider";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import { AcademicLevelButton } from "../../components/AcademicLevelButton";
import { InterestChip } from "../../components/InterestChip";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { httpClient } from "../../services/http/client";
import { API_ENDPOINTS } from "../../constants/api";
import { ErrorBanner } from "../../components/ErrorBanner";
import { parseApiError, isEmailError } from "../../utils/apiError";
import { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Register">;

const academicLevels = ["Ensino Médio", "Licenciatura", "Mestrado", "Outro"];
const interestsList = ["Economia", "História", "Política", "Desenvolvimento", "Outro"];

export function RegisterScreen({ navigation }: Props) {
  const { signUp, refreshUser, updateUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [academicLevel, setAcademicLevel] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registerError, setRegisterError] = useState<string | null>(null);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!canCompleteStep2) return;
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      await signUp({ fullName, email, password });
      if (avatarUri) {
        try {
          const form = new FormData();
          form.append("avatar", { uri: avatarUri, name: "avatar.jpg", type: "image/jpeg" } as any);
          await httpClient.post(API_ENDPOINTS.PROFILE.UPDATE_AVATAR, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          // Show the chosen photo immediately — refreshUser will sync the server URL
          updateUser({ avatar_url: avatarUri });
        } catch {
          // avatar upload failure is non-fatal
        }
      }
      await refreshUser();
      navigation.navigate("MainTabs");
    } catch (err: unknown) {
      const message = parseApiError(err);
      if (isEmailError(err)) {
        // navigate back to step 1 so the user can fix their email
        setStep(1);
      }
      setRegisterError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar
        title="Criar Conta"
        onBackPress={() => {
          if (step === 1) {
            if (navigation.canGoBack()) navigation.goBack();
          } else {
            setStep(1);
          }
        }}
      />

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <View style={[styles.progressSegment, styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, step === 2 ? styles.progressSegmentActive : styles.progressSegmentInactive]} />
        </View>
        <Text style={styles.progressText}>Passo {step} de 2</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <>
            <Text style={styles.title}>Cria a tua conta</Text>
            <Text style={styles.subtitle}>Preenche os teus dados para começar</Text>

            <ErrorBanner message={registerError} onDismiss={() => setRegisterError(null)} />

            <SocialButton
              icon="G"
              label="Registar com Google"
              onPress={() => setStep(2)}
            />

            <Divider />

            <FormInput
              label="Nome completo"
              value={fullName}
              onChangeText={(text) => { setFullName(text); if (registerError) setRegisterError(null); }}
              placeholder="Luís Manuel Ferreira"
              autoCapitalize="words"
            />

            <FormInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
                if (registerError) setRegisterError(null);
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
              onPress={() => { if (canContinueStep1) { setRegisterError(null); setStep(2); } }}
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

            <ErrorBanner message={registerError} onDismiss={() => setRegisterError(null)} />

            {/* Avatar picker */}
            <View style={styles.avatarSection}>
              <Pressable style={styles.avatarWrap} onPress={() => void pickImage()}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {fullName.trim().split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <Feather name="camera" size={12} color="white" />
                </View>
              </Pressable>
              <Text style={styles.avatarHint}>
                {avatarUri ? "Toca para alterar a foto" : "Adicionar foto (opcional)"}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>Nível académico</Text>
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

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>Área de interesse</Text>
              <Text style={styles.groupHint}>Seleciona pelo menos uma área</Text>
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
                (!canCompleteStep2 || isSubmitting) && styles.primaryButtonDisabled,
                pressed && canCompleteStep2 && !isSubmitting && styles.pressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={appTheme.colors.surface} />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    (!canCompleteStep2 || isSubmitting) && styles.primaryButtonTextDisabled,
                  ]}
                >
                  Criar conta
                </Text>
              )}
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
  progressSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: appTheme.radius.pill,
  },
  progressSegmentActive: {
    backgroundColor: appTheme.colors.primary,
  },
  progressSegmentInactive: {
    backgroundColor: appTheme.colors.border,
  },
  progressText: {
    ...appTheme.typography.microSemiBold,
    color: appTheme.colors.textMuted,
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
  formGroup: {
    marginBottom: appTheme.spacing.lg,
  },
  groupLabel: {
    ...appTheme.typography.label,
    color: appTheme.colors.textPrimary,
    marginBottom: 12,
  },
  groupHint: {
    ...appTheme.typography.caption,
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  primaryButtonText: {
    ...appTheme.typography.body,
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.surface,
    fontWeight: "700",
  },
  primaryButtonTextDisabled: {
    color: appTheme.colors.textMuted,
  },
  termsWrap: {
    marginTop: appTheme.spacing.lg,
  },
  termsText: {
    ...appTheme.typography.caption,
    fontSize: 13,
    textAlign: "center",
    color: appTheme.colors.textMuted,
  },
  termsLink: {
    color: appTheme.colors.primary,
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrap: {
    position: "relative",
    width: 88,
    height: 88,
    marginBottom: 8,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: appTheme.radius.pill,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.userAvatarBg,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    ...appTheme.typography.heading,
    color: appTheme.colors.primary,
    opacity: 0.6,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: appTheme.colors.surface,
  },
  avatarHint: {
    ...appTheme.typography.caption,
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
  academicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
