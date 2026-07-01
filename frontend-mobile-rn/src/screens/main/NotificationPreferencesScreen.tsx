import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";

export function NotificationPreferencesScreen() {
  const navigation = useNavigation();

  const [newContent, setNewContent] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);
  const [achievements, setAchievements] = useState(true);

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Preferências de Notificação" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Configurar alertas de novos conteúdos e desafios</Text>

        <View style={styles.card}>
          {/* Row 1 */}
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Novos Conteúdos</Text>
              <Text style={styles.preferenceDesc}>Artigos, podcasts e micro textos</Text>
            </View>
            <Switch
              value={newContent}
              onValueChange={setNewContent}
              trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
              thumbColor={appTheme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Row 2 */}
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Lembretes de Quiz</Text>
              <Text style={styles.preferenceDesc}>Novos quizzes disponíveis</Text>
            </View>
            <Switch
              value={quizReminders}
              onValueChange={setQuizReminders}
              trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
              thumbColor={appTheme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Row 3 */}
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Atualizações da Comunidade</Text>
              <Text style={styles.preferenceDesc}>Respostas e discussões</Text>
            </View>
            <Switch
              value={communityUpdates}
              onValueChange={setCommunityUpdates}
              trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
              thumbColor={appTheme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Row 4 */}
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Conquistas e Badges</Text>
              <Text style={styles.preferenceDesc}>Novos méritos desbloqueados</Text>
            </View>
            <Switch
              value={achievements}
              onValueChange={setAchievements}
              trackColor={{ false: appTheme.colors.border, true: appTheme.colors.primary }}
              thumbColor={appTheme.colors.surface}
            />
          </View>
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
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 2,
  },
  preferenceDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.rankingCardGray,
  },
  divider: {
    height: 1,
    backgroundColor: appTheme.colors.border,
  },
});