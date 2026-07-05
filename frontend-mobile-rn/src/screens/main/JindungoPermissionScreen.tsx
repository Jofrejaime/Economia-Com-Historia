import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function JindungoPermissionScreen() {
  const navigation = useNavigation<any>();

  // Só visitantes não autenticados chegam a este ecrã (ver onViewJindungo em
  // MainNavigator/HomeScreen) — não podem submeter um pedido de acesso real,
  // por isso encaminha para o login em vez de simular um pedido enviado.
  const handleRequestAccess = () => {
    navigation.navigate("LoginPrompt", { type: "jindungo" });
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Conteúdo Restrito" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Lock Icon */}
          <View style={styles.iconCircleWrap}>
            <View style={styles.iconCircle}>
              <Feather name="lock" size={48} color={appTheme.colors.primary} />
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
              <Feather name="alert-circle" size={20} color={appTheme.colors.primary} style={styles.alertIcon} />
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
              <Feather name="clock" size={24} color={appTheme.colors.primary} />
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
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
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
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.debateHighlightBg,
    alignItems: "center",
    justifyContent: "center",
  },
  contentTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 30,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  contentDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  alertBox: {
    backgroundColor: appTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
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
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 4,
  },
  alertDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 20,
    marginBottom: 32,
    alignItems: "center",
    width: "100%",
  },
  clockIconWrap: {
    width: 48,
    height: 48,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.debateHighlightBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  infoDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: appTheme.colors.primary,
    height: 52,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    ...appTheme.shadow.sm,
  },
  primaryButtonText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: appTheme.colors.surface,
    height: 52,
    borderRadius: appTheme.radius.button,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 24,
    textAlign: "center",
  },
});