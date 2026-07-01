import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api/userService";
import { MainStackParamList } from "../../types/navigation";

type PrivacyScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, "Privacy">;

export function PrivacyScreen() {
  const navigation = useNavigation<PrivacyScreenNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, "Privacy">>();
  const { signOut, user } = useAuth();

  const { isFromRecovery } = route.params || {};

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      onOk?.();
    } else {
      Alert.alert(title, message, onOk ? [{ text: "OK", onPress: onOk }] : undefined);
    }
  };

  const handleUpdatePassword = async () => {
    if (!isFromRecovery && !currentPassword) {
      showAlert("Erro", "Por favor, insere a tua palavra-passe atual.");
      return;
    }
    if (newPassword.length < 8) {
      showAlert("Erro", "A nova palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Erro", "A nova palavra-passe e a confirmação não coincidem.");
      return;
    }

    setSaving(true);
    try {
      const payload: Parameters<typeof userService.updatePassword>[0] = {
        password: newPassword,
        password_confirmation: confirmPassword,
      };
      // When coming from recovery flow, identity was already verified via reset link — omit current_password
      if (!isFromRecovery) {
        payload.current_password = currentPassword;
      }
      await userService.updatePassword(payload);
      showAlert("Sucesso", "A sua palavra-passe foi actualizada com sucesso!", () => {
        if (isFromRecovery) {
          if (user) void signOut();
          navigation.navigate("Login");
        } else {
          navigation.goBack();
        }
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.errors?.current_password?.[0] ??
        err?.response?.data?.message ??
        "Não foi possível alterar a palavra-passe.";
      showAlert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Privacidade e Segurança" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Alterar palavra-passe e acessos</Text>

        <View style={styles.card}>
          {!isFromRecovery && (
            <FormInput
              label="Palavra-passe Atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          )}

          <FormInput
            label="Nova Palavra-passe"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <FormInput
            label="Confirmar Nova Palavra-passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.updateButton, saving && { opacity: 0.6 }]}
            onPress={() => void handleUpdatePassword()}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.updateButtonText}>Atualizar Palavra-passe</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  updateButton: {
    backgroundColor: appTheme.colors.primary,
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  updateButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});