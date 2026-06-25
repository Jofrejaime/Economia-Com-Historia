import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";
import { useAuth } from "../../hooks/useAuth";
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

  const handleUpdatePassword = async () => {
    if (!isFromRecovery && !currentPassword) {
      if (Platform.OS === "web") {
        window.alert("Por favor, insere a tua palavra-passe atual.");
      } else {
        Alert.alert("Erro", "Por favor, insere a tua palavra-passe atual.");
      }
      return;
    }
    if (newPassword.length < 8) {
      if (Platform.OS === "web") {
        window.alert("A nova palavra-passe deve ter pelo menos 8 caracteres.");
      } else {
        Alert.alert("Erro", "A nova palavra-passe deve ter pelo menos 8 caracteres.");
      }
      return;
    }
    if (newPassword !== confirmPassword) {
      if (Platform.OS === "web") {
        window.alert("A nova palavra-passe e a confirmação não coincidem.");
      } else {
        Alert.alert("Erro", "A nova palavra-passe e a confirmação não coincidem.");
      }
      return;
    }

    if (Platform.OS === "web") {
      window.alert("A sua palavra-passe foi atualizada com sucesso!");
    } else {
      Alert.alert("Sucesso", "A sua palavra-passe foi atualizada com sucesso!");
    }
    
    if (isFromRecovery) {
      if (user) {
        await signOut();
      }
      navigation.navigate("Login");
    } else {
      navigation.goBack();
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

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
            <Text style={styles.updateButtonText}>Atualizar Palavra-passe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D",
    letterSpacing: -0.4,
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
    fontSize: 16,
    color: "#574142",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  updateButton: {
    backgroundColor: "#8B1E2D",
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});