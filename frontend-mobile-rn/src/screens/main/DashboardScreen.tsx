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
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../types/navigation";
// Deleted unused BottomNav import

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Data structures
const continueLearning = [
  {
    id: "1",
    title: "A Economia do Petróleo em Angola",
    chapter: "Capítulo 3 de 5 · 60% concluído",
    progress: 60,
    difficulty: "Intermédio",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
  },
];

const jindungoItems = [
  {
    id: "1",
    title: "Dívida Externa: Angola pode sair da dependência do FMI?",
    description: "Análise crítica sobre as negociações com o Fundo Monetário Internacional e os impactos nas políticas económicas nacionais",
    duration: "15 min",
    replies: 89,
    difficulty: "Avançado",
    category: "Economia",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    trending: true,
    borderColor: "#8B1E2D",
    iconBg: "#8B1E2D",
  },
  {
    id: "2",
    title: "Privatizações: Progresso ou retrocesso económico?",
    description: "O debate sobre a privatização de empresas estatais e o impacto na economia nacional",
    duration: "12 min",
    replies: 67,
    difficulty: "Intermédio",
    category: "Política",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    trending: false,
    borderColor: "#8B1E2D",
    iconBg: "#8B1E2D",
  },
  {
    id: "3",
    title: "Agricultura vs Petróleo: É possível diversificar a economia?",
    description: "Debate sobre as políticas de diversificação económica e o abandono do sector agrícola em Angola",
    duration: "18 min",
    replies: 102,
    difficulty: "Intermédio",
    category: "Desenvolvimento",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    trending: false,
    borderColor: "#8B1E2D",
    iconBg: "#8B1E2D",
  },
];

const microTexts = [
  {
    id: "1",
    title: "O que foi o Acordo de Bicesse?",
    time: 3,
    difficulty: "Novo",
    status: "new",
    description: "Resumo histórico do acordo de paz assinado in 1991 e seu impacto económico em Angola",
    date: "Publicado hoje",
    category: "História",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  },
  {
    id: "2",
    title: "Inflação no Kwanza: números actuais",
    time: 2,
    difficulty: "Popular",
    status: "trending",
    description: "Análise rápida da taxa de inflação e poder de compra em 2024",
    date: "Publicado ontem",
    category: "Economia",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  },
  {
    id: "3",
    title: "Sonangol: Breve história da empresa estatal",
    time: 4,
    difficulty: "Intermédio",
    status: "popular",
    description: "Da criação em 1976 até hoje: evolução e papel na economia nacional",
    date: "Há 2 dias",
    category: "Petróleo",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  },
];

const contentFormats = [
  {
    id: "1",
    label: "Vídeos",
    subLabel: "Aulas em vídeo",
    countText: "24 disponíveis",
    icon: "video",
    borderColor: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  {
    id: "2",
    label: "Áudio",
    subLabel: "Podcasts e narração",
    countText: "18 disponíveis",
    icon: "headphones",
    borderColor: "#16A34A",
    bgColor: "#F0FDF4",
  },
  {
    id: "3",
    label: "Artigos",
    subLabel: "Textos académicos",
    countText: "148 disponíveis",
    icon: "file-text",
    borderColor: "#8B1E2D",
    bgColor: "#FDF3F4",
  },
  {
    id: "4",
    label: "Séries",
    subLabel: "Conteúdo sequencial",
    countText: "12 séries",
    icon: "target",
    borderColor: "#D97706",
    bgColor: "#FFFBEB",
  },
];

const recentArticles = [
  {
    id: "1",
    title: "Independência e Reconstrução Económica (1975–1985)",
    category: "História",
    readTime: 8,
    difficulty: "Introdução",
    date: "Publicado hoje",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80",
  },
  {
    id: "2",
    title: "Agricultura Angolana: Do Colonialismo ao Abandono",
    category: "Economia",
    readTime: 16,
    difficulty: "Intermédio",
    date: "Ontem",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&q=80",
  },
];

const activeDebates = [
  {
    id: "1",
    title: "O petróleo foi uma bênção ou uma maldição para Angola?",
    replies: 47,
    active: "Activo há 2h",
    isHighlight: true,
  },
  {
    id: "2",
    title: "China e Angola: parceria estratégica ou dependência?",
    replies: 34,
    active: "Activo há 4h",
    isHighlight: false,
  },
];

const topUsers = [
  { id: "1", name: "Ana Domingos", role: "Estudante de Economia", points: 980, rank: 1, initials: "AD" },
  { id: "2", name: "Carlos Neto", role: "Professor", points: 870, rank: 2, initials: "CN" },
  { id: "3", name: "Luís Ferreira", role: "Estudante", points: 760, rank: 3, initials: "LF" },
  { id: "4", name: "Maria Santos", role: "Investigadora", points: 650, rank: 4, initials: "MS" },
  { id: "5", name: "João Mendes", role: "Analista", points: 580, rank: 5, initials: "JM" },
];

export function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<"home" | "content" | "community" | "quiz">("home");
  const [searchText, setSearchText] = useState("");

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

  const handleOpenDiscussion = (id: string) => {
    navigation.navigate("TopicDiscussion", { id });
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      (navigation as any).navigate("Content", {
        searchQuery: searchText.trim(),
      });
      setSearchText("");
    }
  };

  const handleFormatPress = (label: string) => {
    let category: "video" | "podcast" | "micro" | "series" = "video";
    if (label === "Vídeos") category = "video";
    else if (label === "Áudio") category = "podcast";
    else if (label === "Artigos") category = "micro";
    else if (label === "Séries") category = "series";

    (navigation as any).navigate("Content", { category });
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
          <TouchableOpacity 
            style={styles.notificationBell}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={appTheme.colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleSearchSubmit}>
            <Ionicons name="search" size={20} color={appTheme.colors.primary} style={styles.searchIcon} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar conteúdo..."
            placeholderTextColor={appTheme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuar a aprender</Text>
          <FlatList
            data={continueLearning}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.continueCard} onPress={() => navigation.navigate("Article", { id: "continue_1" })}>
                <Image source={{ uri: item.image }} style={styles.continueImage} />
                <View style={styles.continueOverlay} />
                <View style={styles.continueContent}>
                  <View style={styles.continueBadge}>
                    <Text style={styles.continueBadgeText}>{item.difficulty}</Text>
                  </View>
                  <Text style={styles.continueTitle}>{item.title}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.continueProgressText}>{item.chapter}</Text>
                  <TouchableOpacity style={styles.continueResumeBtn} onPress={() => navigation.navigate("Article", { id: "continue_1" })}>
                    <Text style={styles.continueResumeBtnText}>Retomar leitura</Text>
                    <Ionicons name="arrow-forward" size={14} color={appTheme.colors.primary} />
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
            <Text style={styles.sectionTitle}>JINDUNGO</Text>
          </View>
          <Text style={styles.sectionSubTitle}>Temas polémicos e debates actuais sobre economia angolana</Text>
          <FlatList
            data={jindungoItems}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.jindungoCard,
                  {
                    borderColor: item.borderColor,
                  },
                ]}
                onPress={() => navigation.navigate("Article", { id: "jindungo_" + item.id })}
              >
                <Image source={{ uri: item.image }} style={styles.jindungoBgImage} />
                <View style={styles.jindungoOverlay} />
                <View style={styles.jindungoCardContent}>
                  <View style={styles.jindungoHeaderRow}>
                    <View style={[styles.jindungoIconWrap, { backgroundColor: item.iconBg }]}>
                      <Ionicons name="flame" size={18} color="white" />
                    </View>
                    <View style={styles.jindungoBadge}>
                      <Text style={styles.jindungoBadgeText}>JINDUNGO</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.jindungoCardTitle}>{item.title}</Text>
                  <Text style={styles.jindungoCardDesc} numberOfLines={2}>{item.description}</Text>
                  
                  <View style={styles.jindungoMetaRow}>
                    <Text style={styles.jindungoMetaText}>📖 {item.duration}</Text>
                    <Text style={styles.jindungoMetaText}>💬 {item.replies} comentários</Text>
                    {item.trending && (
                      <View style={styles.jindungoTrendingBadge}>
                        <Text style={styles.jindungoTrendingText}>Trending</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.jindungoTagsRow}>
                    <View style={styles.jindungoTag}>
                      <Text style={styles.jindungoTagText}>{item.difficulty}</Text>
                    </View>
                    <View style={styles.jindungoTag}>
                      <Text style={styles.jindungoTagText}>{item.category}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.exploreButton} onPress={() => (navigation as any).navigate("Content", { category: "jindungo" })}>
            <Ionicons name="flame" size={16} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.exploreButtonText}>Explorar mais Jindungo</Text>
          </TouchableOpacity>
        </View>

        {/* Micro Texts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color={appTheme.colors.primary} />
            <Text style={styles.sectionTitle}>Micro Textos</Text>
          </View>
          <Text style={styles.sectionSubTitle}>Leituras rápidas de 2-5 minutos</Text>
          <FlatList
            data={microTexts}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.microCard} onPress={() => navigation.navigate("Article", { id: "micro_" + item.id })}>
                <Image source={{ uri: item.image }} style={styles.microBgImage} />
                <View style={styles.microOverlay} />
                <View style={styles.microCardContent}>
                  <View style={styles.microHeaderRow}>
                    <View style={styles.microIconWrap}>
                      <Ionicons name="time-outline" size={16} color={appTheme.colors.primary} />
                    </View>
                    <View style={styles.microBadgeRow}>
                      {item.status === "new" && (
                        <View style={[styles.microTagBadge, { backgroundColor: appTheme.colors.primary }]}>
                          <Text style={styles.microTagText}>NOVO</Text>
                        </View>
                      )}
                      {item.status === "trending" && (
                        <View style={[styles.microTagBadge, { backgroundColor: appTheme.colors.success }]}>
                          <Text style={styles.microTagText}>POPULAR</Text>
                        </View>
                      )}
                      <Text style={styles.microTimeText}>⏱ {item.time} min</Text>
                    </View>
                  </View>

                  <Text style={styles.microCardTitle}>{item.title}</Text>
                  <Text style={styles.microCardDesc} numberOfLines={2}>{item.description}</Text>

                  <View style={styles.microFooterRow}>
                    <Text style={styles.microFooterText}>📅 {item.date} • {item.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.exploreMicroButton} onPress={() => (navigation as any).navigate("Content", { category: "micro" })}>
            <Ionicons name="flash" size={16} color={appTheme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.exploreMicroButtonText}>Ver todos os micro textos</Text>
          </TouchableOpacity>
        </View>

        {/* Content Formats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorar por Formato</Text>
          <View style={styles.formatsGrid}>
            {contentFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={[
                  styles.formatCard,
                  {
                    borderColor: format.borderColor,
                    backgroundColor: format.bgColor,
                  },
                ]}
                onPress={() => handleFormatPress(format.label)}
              >
                <Feather name={format.icon as any} size={28} color={format.borderColor} style={styles.formatCardIcon} />
                <Text style={styles.formatLabel}>{format.label}</Text>
                <Text style={styles.formatSubLabel}>{format.subLabel}</Text>
                <Text style={[styles.formatCountText, { color: format.borderColor }]}>
                  {format.countText}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Articles */}
        <View style={styles.section}>
          <View style={styles.recentArticlesHeader}>
            <Text style={styles.sectionTitle}>Artigos Recentes</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate("Content", { category: "micro" })} style={styles.seeAllRow}>
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Ionicons name="arrow-forward" size={14} color={appTheme.colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentArticles}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.articleCard} onPress={() => navigation.navigate("Article", { id: "recent_" + item.id })}>
                <Image source={{ uri: item.image }} style={styles.articleImage} />
                <View style={styles.articleContent}>
                  <View style={styles.articleTagsRow}>
                    <View style={[styles.articleTag, { backgroundColor: item.id === "1" ? "#EFF6FF" : "#FFFBEB" }]}>
                      <Text style={[styles.articleTagText, { color: item.id === "1" ? "#1E40AF" : "#92400E" }]}>
                        {item.difficulty}
                      </Text>
                    </View>
                    <View style={[styles.articleTag, { backgroundColor: "#F5F5F5" }]}>
                      <Text style={[styles.articleTagText, { color: "#4B5563" }]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.articleDateText}>
                    {item.readTime} min de leitura · {item.date}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Active Debates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color={appTheme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Debates Activos</Text>
          </View>
          <FlatList
            data={activeDebates}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.debateCard,
                  {
                    borderLeftColor: item.isHighlight ? "#8B1E2D" : "#D1D5DB",
                    backgroundColor: item.isHighlight ? "#FDF3F4" : "#F5F5F5",
                  },
                ]}
                onPress={() => handleOpenDiscussion(item.id)}
              >
                <Text style={styles.debateTitle}>{item.title}</Text>
                <View style={styles.debateMetaRow}>
                  <Text style={styles.debateRepliesText}>💬 {item.replies} respostas</Text>
                  <Text style={styles.debateDot}>•</Text>
                  <Text style={styles.debateActiveText}>{item.active}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Ranking */}
        <View style={styles.section}>
          <Text style={styles.rankingHeaderTitle}>Ranking</Text>
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
                  item.rank > 3 && styles.rankingItemDefault,
                ]}
              >
                <View style={styles.rankContainer}>
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor:
                          item.rank === 1
                            ? "rgba(255,255,255,0.2)"
                            : item.rank === 2 || item.rank === 3
                            ? "#E5E7EB"
                            : "#F5F5F5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankNumber,
                        { color: item.rank === 1 ? "white" : item.rank === 2 || item.rank === 3 ? "#6B7280" : "#9CA3AF" },
                      ]}
                    >
                      #{item.rank}
                    </Text>
                  </View>
                  
                  {item.rank === 1 ? (
                    <View style={styles.rankingUserAvatarFirst}>
                      <Text style={styles.rankingUserAvatarFirstText}>👤</Text>
                    </View>
                  ) : (
                    <View style={styles.rankingUserAvatarDefault}>
                      <Text style={styles.rankingUserAvatarDefaultText}>
                        {item.initials}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userNameText, { color: item.rank === 1 ? "white" : appTheme.colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.userRoleText,
                      { color: item.rank === 1 ? "rgba(255,255,255,0.8)" : "#6B7280" },
                    ]}
                  >
                    {item.role}
                  </Text>
                </View>
                <View style={styles.pointsContainer}>
                  <Text
                    style={[
                      styles.pointsNumberText,
                      { color: item.rank === 1 ? "white" : appTheme.colors.textPrimary },
                    ]}
                  >
                    {item.points}
                  </Text>
                  <Text style={[styles.pointsLabelText, { color: item.rank === 1 ? "rgba(255,255,255,0.7)" : "#9CA3AF" }]}>
                    pontos
                  </Text>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.rankingFullButton} onPress={handleGoToTabs}>
            <Text style={styles.rankingFullButtonText}>Ver ranking completo</Text>
            <Ionicons name="arrow-forward" size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>


      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
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
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  userName: {
    fontSize: 20,
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
    backgroundColor: "#8B1E2D",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 24,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: appTheme.colors.textMuted,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: appTheme.colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginLeft: 8,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 16,
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
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  continueContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  continueBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  continueBadgeText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "600",
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
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
  continueProgressText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 12,
  },
  continueResumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  continueResumeBtnText: {
    color: "#8B1E2D",
    fontSize: 15,
    fontWeight: "700",
  },
  jindungoCard: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    position: "relative",
  },
  jindungoBgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  jindungoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  jindungoCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  jindungoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  jindungoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  jindungoBadge: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  jindungoBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  jindungoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    lineHeight: 20,
  },
  jindungoCardDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 16,
  },
  jindungoMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  jindungoMetaText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  jindungoTrendingBadge: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  jindungoTrendingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  jindungoTagsRow: {
    flexDirection: "row",
    gap: 8,
  },
  jindungoTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  jindungoTagText: {
    color: "white",
    fontSize: 10,
  },
  exploreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B1E2D",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  exploreButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  microCard: {
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    position: "relative",
  },
  microBgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  microOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  microCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  microHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  microIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(139, 30, 45, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  microBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  microTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  microTagText: {
    color: "white",
    fontSize: 9,
    fontWeight: "700",
  },
  microTimeText: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  microCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  microCardDesc: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 16,
  },
  microFooterRow: {
    flexDirection: "row",
  },
  microFooterText: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  exploreMicroButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  exploreMicroButtonText: {
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  formatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  formatCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: "flex-start",
    marginBottom: 4,
    flexGrow: 1,
  },
  formatCardIcon: {
    marginBottom: 12,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
  },
  formatSubLabel: {
    fontSize: 12,
    color: "#574142",
    marginBottom: 12,
  },
  formatCountText: {
    fontSize: 11,
    fontWeight: "700",
  },
  recentArticlesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: appTheme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
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
    width: 90,
    height: 90,
  },
  articleContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  articleTagsRow: {
    flexDirection: "row",
    gap: 6,
  },
  articleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  articleTagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginVertical: 4,
    lineHeight: 18,
  },
  articleDateText: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
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
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 6,
  },
  debateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  debateRepliesText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  debateDot: {
    color: appTheme.colors.textMuted,
  },
  debateActiveText: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  rankingHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  rankingItemFirst: {
    backgroundColor: "#8B1E2D",
    borderColor: "#8B1E2D",
  },
  rankingItemSecond: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#9CA3AF",
  },
  rankingItemThird: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#D1D5DB",
  },
  rankingItemDefault: {
    backgroundColor: "white",
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontWeight: "700",
    fontSize: 14,
  },
  rankingUserAvatarFirst: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  rankingUserAvatarFirstText: {
    fontSize: 20,
  },
  rankingUserAvatarDefault: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D9E3F6",
    justifyContent: "center",
    alignItems: "center",
  },
  rankingUserAvatarDefaultText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B1E2D",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userRoleText: {
    fontSize: 12,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsNumberText: {
    fontSize: 18,
    fontWeight: "700",
  },
  pointsLabelText: {
    fontSize: 10,
  },
  rankingFullButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  rankingFullButtonText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 14,
  },
});
