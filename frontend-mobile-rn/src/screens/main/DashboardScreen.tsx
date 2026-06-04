import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../types/navigation";
import { BottomNav } from "../../components/BottomNav";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Data structures
const continueLearning = [
  {
    id: "1",
    title: "A Economia do Petróleo em Angola",
    chapter: "Capítulo 3",
    progress: 65,
    timeLeft: 5,
    image: "https://via.placeholder.com/300x200/8B1E2D/FFFFFF?text=Petróleo",
  },
];

const jindungoItems = [
  {
    id: "1",
    title: "Debate: Moeda Kwanza pós-1976",
    category: "Moeda e Inflação",
    trending: true,
  },
  {
    id: "2",
    title: "Discussão: Dependência do Petróleo",
    category: "Economia Moderna",
    trending: true,
  },
  {
    id: "3",
    title: "Análise: Transição Económica",
    category: "Período Colonial",
    trending: false,
  },
];

const microTexts = [
  {
    id: "1",
    title: "Origem do Kwanza",
    time: 3,
    difficulty: "Iniciante",
    status: "new",
  },
  {
    id: "2",
    title: "Diamang: Empresa Colonial",
    time: 5,
    difficulty: "Intermédio",
    status: "trending",
  },
  {
    id: "3",
    title: "Banco Nacional de Angola",
    time: 4,
    difficulty: "Avançado",
    status: "popular",
  },
];

const contentFormats = [
  { id: "1", label: "Vídeos", icon: "videocam", count: 24, color: appTheme.colors.videoColor },
  { id: "2", label: "Áudio", icon: "headset", count: 18, color: appTheme.colors.audioColor },
  { id: "3", label: "Artigos", icon: "document-text", count: 148, color: appTheme.colors.articleColor },
  { id: "4", label: "Séries", icon: "list", count: 12, color: appTheme.colors.seriesColor },
];

const recentArticles = [
  {
    id: "1",
    title: "Descoberta do Petróleo em Angola",
    category: "Período Moderno",
    readTime: 12,
    difficulty: "Intermédio",
    image: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Artigo1",
  },
  {
    id: "2",
    title: "Colónias Portuguesas na África",
    category: "História Colonial",
    readTime: 15,
    difficulty: "Avançado",
    image: "https://via.placeholder.com/100x100/DC2626/FFFFFF?text=Artigo2",
  },
];

const activeDebates = [
  {
    id: "1",
    title: "Papel da Moeda na Transição (1976)",
    replies: 24,
    isHighlight: true,
  },
  {
    id: "2",
    title: "Sustentabilidade da Economia Angolana",
    replies: 18,
    isHighlight: false,
  },
];

const topUsers = [
  { id: "1", name: "Maria Silva", role: "Professora", points: 2850, rank: 1 },
  { id: "2", name: "João Ferreira", role: "Pesquisador", points: 2420, rank: 2 },
  { id: "3", name: "Ana Costa", role: "Estudante", points: 1980, rank: 3 },
  { id: "4", name: "Pedro Santos", role: "Historiador", points: 1750, rank: 4 },
  { id: "5", name: "Sofia Nunes", role: "Académica", points: 1620, rank: 5 },
];

export function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<"home" | "content" | "community" | "quiz">("home");

  const getFormattedDate = () => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const today = new Date();
    const day = days[today.getDay()];
    const date = today.getDate();
    const month = months[today.getMonth()];
    return `${day}, ${date} de ${month}`;
  };

  const handleNavPress = (tab: "home" | "content" | "community" | "quiz") => {
    setActiveTab(tab);
    if (tab !== "home") {
      navigation.navigate("MainTabs");
    }
  };

  const handleGoToTabs = () => {
    navigation.navigate("MainTabs");
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header com Greeting */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.userName}>{user?.name || "Leitor"}</Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
          <View style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={24} color={appTheme.colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={appTheme.colors.primary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Procurar conteúdo...</Text>
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuar a aprender</Text>
          <FlatList
            data={continueLearning}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.continueCard} onPress={handleGoToTabs}>
                <Image source={{ uri: item.image }} style={styles.continueImage} />
                <View style={styles.continueOverlay} />
                <View style={styles.continueContent}>
                  <Text style={styles.continueChapter}>{item.chapter}</Text>
                  <Text style={styles.continueTitle}>{item.title}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{item.progress}%</Text>
                  </View>
                  <TouchableOpacity style={styles.resumeButton}>
                    <Text style={styles.resumeButtonText}>Retomar leitura ({item.timeLeft} min)</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Jindungo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={20} color={appTheme.colors.danger} />
            <Text style={styles.sectionTitle}>Conteúdo Polémico (Jindungo)</Text>
          </View>
          <FlatList
            data={jindungoItems}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.jindungoCard,
                  {
                    borderLeftColor: item.trending ? appTheme.colors.danger : appTheme.colors.warning,
                  },
                ]}
                onPress={handleGoToTabs}
              >
                <View
                  style={[
                    styles.jindungoIcon,
                    {
                      backgroundColor: item.trending ? appTheme.colors.danger : appTheme.colors.warning,
                    },
                  ]}
                >
                  <Ionicons name="flame" size={16} color="white" />
                </View>
                <View style={styles.jindungoContent}>
                  <Text style={styles.jindungoTitle}>{item.title}</Text>
                  <Text style={styles.jindungoCategory}>{item.category}</Text>
                </View>
                {item.trending && (
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingText}>TRENDING</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.exploreButton} onPress={handleGoToTabs}>
            <Text style={styles.exploreButtonText}>Explorar mais Jindungo</Text>
            <Ionicons name="arrow-forward" size={16} color={appTheme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Micro Texts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leituras Rápidas (2-5 min)</Text>
          <FlatList
            data={microTexts}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.microTextCard} onPress={handleGoToTabs}>
                <View style={styles.microTextLeft}>
                  <Text style={styles.microTitle}>{item.title}</Text>
                  <View style={styles.microMeta}>
                    <Text style={styles.microTime}>{item.time} min</Text>
                    <View
                      style={[
                        styles.difficultyBadge,
                        item.difficulty === "Iniciante" && styles.beginnerBadge,
                        item.difficulty === "Intermédio" && styles.intermediateBadge,
                        item.difficulty === "Avançado" && styles.advancedBadge,
                      ]}
                    >
                      <Text style={styles.difficultyText}>{item.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statusIcon}>
                  {item.status === "new" && <Ionicons name="star" size={16} color={appTheme.colors.warning} />}
                  {item.status === "trending" && (
                    <Ionicons name="trending-up" size={16} color={appTheme.colors.danger} />
                  )}
                  {item.status === "popular" && (
                    <Ionicons name="heart" size={16} color={appTheme.colors.danger} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Content Formats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorar por Formato</Text>
          <View style={styles.formatsGrid}>
            {contentFormats.map((format) => (
              <TouchableOpacity key={format.id} style={styles.formatCard} onPress={handleGoToTabs}>
                <View style={[styles.formatIcon, { backgroundColor: `${format.color}20` }]}>
                  <Ionicons name={format.icon as any} size={28} color={format.color} />
                </View>
                <Text style={styles.formatLabel}>{format.label}</Text>
                <Text style={styles.formatCount}>{format.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artigos Recentes</Text>
          <FlatList
            data={recentArticles}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.articleCard} onPress={handleGoToTabs}>
                <Image source={{ uri: item.image }} style={styles.articleImage} />
                <View style={styles.articleContent}>
                  <Text style={styles.articleCategory}>{item.category}</Text>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.articleMeta}>
                    <Text style={styles.readTime}>📖 {item.readTime} min</Text>
                    <View style={styles.difficultyTag}>
                      <Text style={styles.difficultyTagText}>{item.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Active Debates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debates Activos</Text>
          <FlatList
            data={activeDebates}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.debateCard,
                  {
                    borderLeftColor: item.isHighlight ? appTheme.colors.danger : appTheme.colors.border,
                    backgroundColor: item.isHighlight ? appTheme.colors.debateHighlightBg : appTheme.colors.background,
                  },
                ]}
                onPress={handleGoToTabs}
              >
                <Text style={styles.debateTitle}>{item.title}</Text>
                <Text style={styles.debateReplies}>{item.replies} respostas</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Ranking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ranking</Text>
          <FlatList
            data={topUsers}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.rankingItem,
                  item.rank === 1 && styles.rankingItemFirst,
                  item.rank === 2 && styles.rankingItemSecond,
                  item.rank === 3 && styles.rankingItemThird,
                ]}
              >
                <View style={styles.rankContainer}>
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor:
                          item.rank === 1
                            ? "transparent"
                            : appTheme.colors.rankingCardSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankNumber,
                        { color: item.rank === 1 ? "white" : appTheme.colors.rankingCardGray },
                      ]}
                    >
                      #{item.rank}
                    </Text>
                  </View>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.name.split(" ").map((n) => n[0]).join("")}
                    </Text>
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: item.rank === 1 ? "white" : appTheme.colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.userRole,
                      { color: item.rank === 1 ? "rgba(255,255,255,0.8)" : appTheme.colors.rankingCardGray },
                    ]}
                  >
                    {item.role}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.pointsNumber,
                    { color: item.rank === 1 ? "white" : appTheme.colors.textSecondary },
                  ]}
                >
                  {item.points}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={appTheme.colors.danger} />
          <Text style={styles.signOutText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav activeTab="home" onNavPress={handleNavPress} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 96,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  notificationBell: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: appTheme.colors.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 12,
    marginLeft: 8,
  },
  continueCard: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  continueImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  continueOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  continueContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  continueChapter: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginBottom: 4,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: appTheme.colors.success,
  },
  progressText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  resumeButton: {
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  resumeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  jindungoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  jindungoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  jindungoContent: {
    flex: 1,
  },
  jindungoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 2,
  },
  jindungoCategory: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  trendingBadge: {
    backgroundColor: appTheme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trendingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  exploreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    marginTop: 8,
  },
  exploreButtonText: {
    color: appTheme.colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  microTextCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  microTextLeft: {
    flex: 1,
  },
  microTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 6,
  },
  microMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  microTime: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  beginnerBadge: {
    backgroundColor: appTheme.colors.badgeYellowBg,
  },
  intermediateBadge: {
    backgroundColor: appTheme.colors.badgeLightBg,
  },
  advancedBadge: {
    backgroundColor: "rgba(220,38,38,0.15)",
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusIcon: {
    marginLeft: 12,
  },
  formatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  formatCard: {
    flex: 1,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  formatIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  formatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  formatCount: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  articleImage: {
    width: 80,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  articleCategory: {
    fontSize: 10,
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  articleTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginVertical: 4,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readTime: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  difficultyTag: {
    backgroundColor: appTheme.colors.badgeLightBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyTagText: {
    fontSize: 9,
    color: appTheme.colors.badgeLightText,
    fontWeight: "600",
  },
  debateCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  debateTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 6,
  },
  debateReplies: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  rankingItemFirst: {
    backgroundColor: appTheme.colors.primary,
  },
  rankingItemSecond: {
    backgroundColor: "rgba(211, 211, 211, 0.2)",
  },
  rankingItemThird: {
    backgroundColor: "rgba(205, 127, 50, 0.1)",
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankNumber: {
    fontWeight: "700",
    fontSize: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appTheme.colors.userAvatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userRole: {
    fontSize: 11,
    marginTop: 2,
  },
  pointsNumber: {
    fontSize: 14,
    fontWeight: "700",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.danger,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  signOutText: {
    color: appTheme.colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
});
