import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { contentData, ContentItem } from "../../data/contents";

type CategoryType = "all" | "jindungo" | "micro" | "series" | "podcast" | "video";
type SortType = "recent" | "popular" | "trending";
type ThemeType = "all" | "economia" | "historia" | "politica" | "desenvolvimento";

export function ContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (route.params) {
      if (route.params.searchQuery !== undefined) {
        setSearchQuery(route.params.searchQuery);
      }
      if (route.params.category !== undefined) {
        setSelectedCategory(route.params.category);
        setShowFilters(true);
      }
      navigation.setParams({ searchQuery: undefined, category: undefined });
    }
  }, [route.params]);

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case "jindungo":
        return <Ionicons name="flame" size={14} color="white" />;
      case "micro":
        return <Ionicons name="flash" size={14} color="white" />;
      case "podcast":
        return <Ionicons name="headset" size={14} color="white" />;
      case "video":
        return <Ionicons name="videocam" size={14} color="white" />;
      case "series":
        return <Ionicons name="book" size={14} color="white" />;
      default:
        return <Ionicons name="document-text" size={14} color="white" />;
    }
  };

  const getCategoryIconColor = (category: CategoryType, active: boolean) => {
    if (active) return "white";
    switch (category) {
      case "jindungo":
        return appTheme.colors.primary;
      case "micro":
        return appTheme.colors.primary;
      case "podcast":
        return appTheme.colors.success;
      case "video":
        return appTheme.colors.videoColor || "#3B82F6";
      case "series":
        return appTheme.colors.seriesColor || "#D97706";
      default:
        return appTheme.colors.textSecondary;
    }
  };

  const getCategoryName = (category: CategoryType) => {
    switch (category) {
      case "jindungo":
        return "Jindungo";
      case "micro":
        return "Micro Textos";
      case "podcast":
        return "Podcasts";
      case "video":
        return "Vídeos";
      case "series":
        return "Séries";
      default:
        return "Todos";
    }
  };

  const getThemeName = (theme: ThemeType) => {
    switch (theme) {
      case "economia":
        return "Economia";
      case "historia":
        return "História";
      case "politica":
        return "Política";
      case "desenvolvimento":
        return "Desenvolvimento";
      default:
        return "Todos os temas";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    return `Há ${Math.floor(diffDays / 30)} meses`;
  };

  const filteredContent = contentData
    .filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedTheme !== "all" && item.theme !== selectedTheme) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
      if (sortBy === "trending") return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      return 0;
    });

  const handleCardPress = (item: ContentItem) => {
    if (item.category === "podcast") {
      navigation.navigate("Podcast");
    } else if (item.category === "jindungo") {
      navigation.navigate("Article", { id: item.id, type: "jindungo" });
    } else if (item.category === "micro") {
      navigation.navigate("Article", { id: item.id, type: "micro" });
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={20} color={appTheme.colors.primary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Conteúdos</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={appTheme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Procurar conteúdos..."
            placeholderTextColor={appTheme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        >
          <Feather name="filter" size={16} color={showFilters ? "white" : appTheme.colors.textSecondary} />
          <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
            Filtros
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <View style={styles.chipsContainer}>
                {(["all", "jindungo", "micro", "podcast", "video", "series"] as CategoryType[]).map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Ionicons
                        name={
                          cat === "jindungo"
                            ? "flame"
                            : cat === "micro"
                            ? "flash"
                            : cat === "podcast"
                            ? "headset"
                            : cat === "video"
                            ? "videocam"
                            : cat === "series"
                            ? "book"
                            : "document-text"
                        }
                        size={14}
                        color={getCategoryIconColor(cat, active)}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {getCategoryName(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Themes */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tema</Text>
              <View style={styles.chipsContainer}>
                {(["all", "economia", "historia", "politica", "desenvolvimento"] as ThemeType[]).map((theme) => {
                  const active = selectedTheme === theme;
                  return (
                    <TouchableOpacity
                      key={theme}
                      onPress={() => setSelectedTheme(theme)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {getThemeName(theme)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sort */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Ordenar por</Text>
              <View style={styles.chipsContainer}>
                <TouchableOpacity
                  onPress={() => setSortBy("recent")}
                  style={[styles.chip, sortBy === "recent" && styles.chipActive]}
                >
                  <Feather name="calendar" size={14} color={sortBy === "recent" ? "white" : appTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.chipText, sortBy === "recent" && styles.chipTextActive]}>Recentes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy("popular")}
                  style={[styles.chip, sortBy === "popular" && styles.chipActive]}
                >
                  <Feather name="trending-up" size={14} color={sortBy === "popular" ? "white" : appTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.chipText, sortBy === "popular" && styles.chipTextActive]}>Populares</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy("trending")}
                  style={[styles.chip, sortBy === "trending" && styles.chipActive]}
                >
                  <Ionicons name="flame" size={14} color={sortBy === "trending" ? "white" : appTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.chipText, sortBy === "trending" && styles.chipTextActive]}>Tendências</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.resultsCount}>
          {filteredContent.length} {filteredContent.length === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}
        </Text>

        <FlatList
          data={filteredContent}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCardPress(item)}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                {/* Image */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  {/* Category Badge overlay */}
                  <View
                    style={[
                      styles.cardBadge,
                      {
                        backgroundColor:
                          item.category === "jindungo"
                            ? appTheme.colors.danger
                            : item.category === "micro"
                            ? appTheme.colors.primary
                            : item.category === "podcast"
                            ? appTheme.colors.success
                            : item.category === "video"
                            ? "#3B82F6"
                            : "#D97706",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.category === "jindungo"
                          ? "flame"
                          : item.category === "micro"
                          ? "flash"
                          : item.category === "podcast"
                          ? "headset"
                          : item.category === "video"
                          ? "videocam"
                          : "book"
                      }
                      size={12}
                      color="white"
                    />
                  </View>
                </View>

                {/* Content Info */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.isTrending && (
                      <Ionicons name="flame" size={16} color={appTheme.colors.danger} style={{ marginLeft: 4 }} />
                    )}
                  </View>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Metadata */}
                  <View style={styles.cardMetaContainer}>
                    <View style={styles.authorRow}>
                      <Image source={{ uri: item.authorImage }} style={styles.authorImage} />
                      <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                    </View>
                    <View style={styles.metaBadgesRow}>
                      <View style={styles.metaDurationBadge}>
                        <Feather name="clock" size={10} color={appTheme.colors.primary} style={{ marginRight: 2 }} />
                        <Text style={styles.metaDurationText}>{item.duration}</Text>
                      </View>
                      {item.views && (
                        <View style={styles.metaViewsBadge}>
                          <Feather name="eye" size={10} color={appTheme.colors.textSecondary} style={{ marginRight: 2 }} />
                          <Text style={styles.metaViewsText}>{item.views.toLocaleString()}</Text>
                        </View>
                      )}
                      <Text style={styles.metaDateText}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {filteredContent.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Feather name="search" size={32} color={appTheme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum conteúdo encontrado</Text>
            <Text style={styles.emptyDesc}>Tenta ajustar os filtros ou a pesquisa</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backButtonText: {
    color: appTheme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    fontFamily: "IBM_Plex_Sans",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: appTheme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterButtonText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "white",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Native tab bar buffer
  },
  filtersPanel: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    backgroundColor: "white",
  },
  chipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  chipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
  },
  resultsCount: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  cardMetaContainer: {
    gap: 6,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  metaBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3F4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(139,30,45,0.1)",
  },
  metaDurationText: {
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  metaViewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  metaViewsText: {
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
  },
  metaDateText: {
    fontSize: 10,
    color: appTheme.colors.textMuted,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
    fontFamily: "IBM_Plex_Sans",
  },
  emptyDesc: {
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
});
