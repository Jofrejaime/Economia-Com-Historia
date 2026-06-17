import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export function NotificationPreferencesScreen() {
  const navigation = useNavigation();

  const [newContent, setNewContent] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);
  const [achievements, setAchievements] = useState(true);

  return (
    <ScreenContainer style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7F1D1D" />
        </TouchableOpacity>
        <Text style={styles.title}>Preferências de Notificação</Text>
      </View>

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
              trackColor={{ false: "#D1D5DB", true: "#8B1E2D" }}
              thumbColor="white"
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
              trackColor={{ false: "#D1D5DB", true: "#8B1E2D" }}
              thumbColor="white"
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
              trackColor={{ false: "#D1D5DB", true: "#8B1E2D" }}
              thumbColor="white"
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
              trackColor={{ false: "#D1D5DB", true: "#8B1E2D" }}
              thumbColor="white"
            />
          </View>
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
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  preferenceDesc: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});