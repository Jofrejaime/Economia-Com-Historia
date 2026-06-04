import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

export function JindungoPermissionScreen() {
  const navigation = useNavigation();

  const handleRequestAccess = () => {
    Alert.alert(
      "Acesso Solicitado",
      "O teu pedido de acesso ao conteúdo Jindungo foi registado e está em análise pela equipa editorial.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScreenContainer style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B1E2D" />
        </TouchableOpacity>
        <Text style={styles.title}>Conteúdo Restrito</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Lock Icon */}
          <View style={styles.iconCircleWrap}>
            <View style={styles.iconCircle}>
              <Feather name="lock" size={48} color="#8B1E2D" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.contentTitle}>Texto com Jindungo</Text>

          {/* Description */}
          <Text style={styles.contentDesc}>
            Este conteúdo aborda temas controversos e sensíveis que requerem permissão especial para acesso.
          </Text>

          {/* Alert Box */}
          <View style={styles.alertBox}>
            <View style={styles.alertRow}>
              <Feather name="alert-circle" size={20} color="#8B1E2D" style={styles.alertIcon} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertTitle}>Porque Preciso de Permissão?</Text>
                <Text style={styles.alertDesc}>
                  Os textos com jindungo contêm análises históricas e económicas que podem gerar debate. Garantimos que apenas utilizadores comprometidos com o rigor académico acedam a estes conteúdos.
                </Text>
              </View>
            </View>
          </View>

          {/* Approval Info */}
          <View style={styles.infoBox}>
            <View style={styles.clockIconWrap}>
              <Feather name="clock" size={24} color="#8B1E2D" />
            </View>
            <Text style={styles.infoTitle}>Aprovação do Administrador</Text>
            <Text style={styles.infoDesc}>
              O seu pedido será analisado pela equipa editorial. Aguarde a aprovação do administrador para aceder aos conteúdos com jindungo.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRequestAccess}>
              <Text style={styles.primaryButtonText}>Solicitar Acesso</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryButtonText}>Voltar aos Conteúdos</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            O pedido de acesso será revisto pela equipa editorial em até 24 horas.
          </Text>
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
    color: "#8B1E2D",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  contentWrap: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconCircleWrap: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FDF3F4",
    alignItems: "center",
    justifyContent: "center",
  },
  contentTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  contentDesc: {
    fontSize: 16,
    color: "#574142",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#DEBFBF",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    width: "100%",
  },
  alertRow: {
    flexDirection: "row",
    gap: 12,
  },
  alertIcon: {
    marginTop: 2,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B1E2D",
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 13,
    color: "#574142",
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    marginBottom: 32,
    alignItems: "center",
    width: "100%",
  },
  clockIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(139, 30, 45, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  infoDesc: {
    fontSize: 13,
    color: "#574142",
    lineHeight: 18,
    textAlign: "center",
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#8B1E2D",
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "white",
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#574142",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 24,
    textAlign: "center",
  },
});