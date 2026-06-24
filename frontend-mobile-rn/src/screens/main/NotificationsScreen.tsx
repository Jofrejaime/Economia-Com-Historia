import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

interface NotificationItem {
  id: string;
  type: "content" | "security" | "achievement" | "community" | "system";
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

export function NotificationsScreen() {
  const navigation = useNavigation();

  const notifications: NotificationItem[] = [
    {
      id: "1",
      type: "content",
      icon: "file-text",
      title: "Novo conteúdo disponível",
      description: 'O artigo "Agricultura Angolana: Do Colonialismo ao Abandono" foi publicado',
      time: "Há 2 horas",
      isNew: true,
    },
    {
      id: "2",
      type: "security",
      icon: "lock",
      title: "Palavra-passe alterada",
      description: "A sua palavra-passe foi alterada com sucesso",
      time: "Ontem",
      isNew: true,
    },
    {
      id: "3",
      type: "achievement",
      icon: "award",
      title: "Nova conquista desbloqueada",
      description: 'Completou 10 quizzes! Ganhou o badge "Estudante Dedicado"',
      time: "Há 2 dias",
      isNew: false,
    },
    {
      id: "4",
      type: "community",
      icon: "message-circle",
      title: "Nova resposta no seu tópico",
      description: 'Catarina Neto respondeu em "O petróleo foi uma bênção ou uma maldição?"',
      time: "Há 3 dias",
      isNew: false,
    },
    {
      id: "5",
      type: "content",
      icon: "file-text",
      title: "Novo podcast disponível",
      description: "Kwanza: História e Desafios da Moeda Nacional já está disponível",
      time: "Há 5 dias",
      isNew: false,
    },
    {
      id: "6",
      type: "system",
      icon: "bell",
      title: "Atualização do sistema",
      description: "A plataforma foi atualizada com novas funcionalidades",
      time: "Há 1 semana",
      isNew: false,
    },
  ];

  const getIconStyles = (type: string, isNew: boolean) => {
    switch (type) {
      case "content":
        return {
          bg: isNew ? "#3B82F6" : "#EFF6FF",
          color: isNew ? "white" : "#3B82F6",
        };
      case "security":
        return {
          bg: isNew ? "#DC2626" : "#FEE2E2",
          color: isNew ? "white" : "#DC2626",
        };
      case "achievement":
        return {
          bg: isNew ? "#F59E0B" : "#FFFBEB",
          color: isNew ? "white" : "#F59E0B",
        };
      case "community":
        return {
          bg: isNew ? "#8B1E2D" : "#FDF3F4",
          color: isNew ? "white" : "#8B1E2D",
        };
      default:
        return {
          bg: isNew ? "#6B7280" : "#F3F4F6",
          color: isNew ? "white" : "#6B7280",
        };
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Notificações" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {notifications.map((item) => {
            const stylesIcon = getIconStyles(item.type, item.isNew);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  item.isNew ? styles.cardNew : styles.cardOld,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconContainer, { backgroundColor: stylesIcon.bg }]}>
                    <Feather name={item.icon} size={20} color={stylesIcon.color} />
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {item.isNew && <View style={styles.newDot} />}
                    </View>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                    <Text style={styles.cardTime}>{item.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footerText}>Todas as notificações foram carregadas</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardNew: {
    borderColor: "#8B1E2D",
    shadowColor: "#8B1E2D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardOld: {
    borderColor: "#E5E7EB",
  },
  cardRow: {
    flexDirection: "row",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8B1E2D",
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 32,
    marginBottom: 16,
  },
});