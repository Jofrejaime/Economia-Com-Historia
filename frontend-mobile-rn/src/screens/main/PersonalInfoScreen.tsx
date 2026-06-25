import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";

export function PersonalInfoScreen() {
  const navigation = useNavigation();

  // Initial mockup values matching web version
  const [name, setName] = useState("José da Assunção A. Ndele");
  const [email, setEmail] = useState("jose.ndele@email.com");
  const [occupation, setOccupation] = useState("Economista e Político Angolano");
  const [location, setLocation] = useState("Luanda, Angola");
  const [emailError, setEmailError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }
    if (emailError || !email.includes("@")) {
      Alert.alert("Erro", "Por favor, insere um email válido.");
      return;
    }
    Alert.alert("Sucesso", "As tuas alterações foram salvas com sucesso!");
    navigation.goBack();
  };

  const validateEmail = (value: string) => {
    if (value && !value.includes("@")) {
      setEmailError("Email inválido");
    } else {
      setEmailError("");
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />
      <HeaderBar title="Informação Pessoal" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Gerir dados da conta e identificação</Text>

        <View style={styles.formCard}>
          <FormInput
            label="Nome Completo"
            value={name}
            onChangeText={setName}
            placeholder="O teu nome completo"
          />

          <FormInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="o.teu@email.com"
          />

          <FormInput
            label="Ocupação"
            value={occupation}
            onChangeText={setOccupation}
            placeholder="Ex: Estudante, Historiador"
          />

          <FormInput
            label="Localização"
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Luanda, Angola"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Alterações</Text>
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
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: "#8B1E2D",
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});