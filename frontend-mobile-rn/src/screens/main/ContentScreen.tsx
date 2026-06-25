import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { documentService } from "../../services/api/documentService";
import type { Document, DocumentType, AccessLevelId, AcademicLevel } from "../../types/api";
import type { ContentParams } from "../../types/navigation";

type SortType = "recent" | "popular";

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: "Artigo", value: "article" },
  { label: "Tese", value: "thesis" },
  { label: "Relatório", value: "report" },
  { label: "Manuscrito", value: "manuscript" },
  { label: "Arquivo", value: "archive" },
];

const ACADEMIC_LEVELS: { label: string; value: AcademicLevel }[] = [
  { label: "Introdução", value: "intro" },
  { label: "Avançado", value: "advanced" },
  { label: "Doutoramento", value: "doctorate" },
];

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return `Há ${Math.floor(diffDays / 30)} meses`;
}

function accessLevelLabel(id: string): { label: string; color: string } {
  if (id === "jindungo") return { label: "Jindungo", color: appTheme.colors.warning };
  if (id === "restricted") return { label: "Restrito", color: appTheme.colors.danger };
  return { label: "Público", color: appTheme.colors.success };
}

export function ContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | undefined>(undefined);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | undefined>(undefined);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevelId | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [showFilters, setShowFilters] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Apply route params on entry
  useEffect(() => {
    const params = route.params as ContentParams | undefined;
    if (!params) return;
    if (params.searchQuery) setSearchQuery(params.searchQuery);
    if (params.document_type) setSelectedType(params.document_type);
    if (params.access_level_id) setSelectedAccessLevel(params.access_level_id);
    if (params.academic_level) setSelectedLevel(params.academic_level);
    navigation.setParams({
      searchQuery: undefined,
      document_type: undefined,
      access_level_id: undefined,
      academic_level: undefined,
    });
  }, [route.params]);

  const fetchDocuments = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const response = await documentService.list({
        document_type: selectedType,
        academic_level: selectedLevel,
        access_level_id: selectedAccessLevel,
        sort: sortBy,
        page: currentPage,
        per_page: 15,
      });
      setDocuments((prev) => (reset ? response.data : [...prev, ...response.data]));
      setTotal(response.meta.total);
      setHasMore(response.meta.current_page < response.meta.last_page);
      setPage(currentPage + 1);
    } catch (error) {
      console.warn("Erro ao carregar documentos", error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedLevel, selectedAccessLevel, sortBy, page]);

  useEffect(() => {
    setPage(1);
    setDocuments([]);
    setHasMore(true);
    fetchDocuments(true);
  }, [selectedType, selectedLevel, selectedAccessLevel, sortBy]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await documentService.search(searchQuery.trim());
      setDocuments(response.data);
      setTotal(response.meta.total);
      setHasMore(false);
    } catch (error) {
      console.warn("Erro na pesquisa", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchDocuments(true);
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const accessInfo = accessLevelLabel(item.access_level_id);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Article", { id: item.id })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardMeta}>
            {item.category && (
              <Text style={styles.cardCategory}>{item.category.name}</Text>
            )}
            <View style={[styles.accessBadge, { backgroundColor: accessInfo.color + "20" }]}>
              <Text style={[styles.accessBadgeText, { color: accessInfo.color }]}>
                {accessInfo.label}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSummary} numberOfLines={3}>{item.summary}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
          <View style={styles.cardStats}>
            <Ionicons name="heart-outline" size={14} color={appTheme.colors.textMuted} />
            <Text style={styles.cardStatText}>{item.likes_count}</Text>
            <Ionicons name="chatbubble-outline" size={14} color={appTheme.colors.textMuted} style={{ marginLeft: 8 }} />
            <Text style={styles.cardStatText}>{item.comments_count}</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.cardDate}>
            {formatDate(item.published_at ?? item.created_at)}
          </Text>
          <Text style={styles.cardTypeLabel}>
            {DOCUMENT_TYPES.find((t) => t.value === item.document_type)?.label ?? item.document_type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Documentos" showBackButton={false} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={appTheme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder="Pesquisar documentos..."
            placeholderTextColor={appTheme.colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={18} color={appTheme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        >
          <Feather name="filter" size={16} color={showFilters ? "white" : appTheme.colors.textSecondary} />
          <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>Filtros</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (hasMore && !loading) fetchDocuments(false); }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={() => (
          <>
            {showFilters && (
              <View style={styles.filtersPanel}>
                {/* Document Type */}
                <Text style={styles.filterLabel}>Tipo de Documento</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedType(undefined)}
                    style={[styles.chip, !selectedType && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, !selectedType && styles.chipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {DOCUMENT_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setSelectedType(selectedType === t.value ? undefined : t.value)}
                      style={[styles.chip, selectedType === t.value && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedType === t.value && styles.chipTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Academic Level */}
                <Text style={[styles.filterLabel, { marginTop: 12 }]}>Nível Académico</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedLevel(undefined)}
                    style={[styles.chip, !selectedLevel && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, !selectedLevel && styles.chipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {ACADEMIC_LEVELS.map((l) => (
                    <TouchableOpacity
                      key={l.value}
                      onPress={() => setSelectedLevel(selectedLevel === l.value ? undefined : l.value)}
                      style={[styles.chip, selectedLevel === l.value && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedLevel === l.value && styles.chipTextActive]}>
                        {l.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Access Level */}
                <Text style={[styles.filterLabel, { marginTop: 12 }]}>Acesso</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedAccessLevel(undefined)}
                    style={[styles.chip, !selectedAccessLevel && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, !selectedAccessLevel && styles.chipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {(["public", "jindungo", "restricted"] as AccessLevelId[]).map((id) => (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setSelectedAccessLevel(selectedAccessLevel === id ? undefined : id)}
                      style={[styles.chip, selectedAccessLevel === id && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedAccessLevel === id && styles.chipTextActive]}>
                        {accessLevelLabel(id).label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sort */}
                <Text style={[styles.filterLabel, { marginTop: 12 }]}>Ordenar por</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    onPress={() => setSortBy("recent")}
                    style={[styles.chip, sortBy === "recent" && styles.chipActive]}
                  >
                    <Feather name="calendar" size={13} color={sortBy === "recent" ? "white" : appTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.chipText, sortBy === "recent" && styles.chipTextActive]}>Recentes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSortBy("popular")}
                    style={[styles.chip, sortBy === "popular" && styles.chipActive]}
                  >
                    <Feather name="trending-up" size={13} color={sortBy === "popular" ? "white" : appTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.chipText, sortBy === "popular" && styles.chipTextActive]}>Populares</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {loading && documents.length === 0 ? "A carregar..." : `${total} ${total === 1 ? "documento" : "documentos"}`}
            </Text>
          </>
        )}
        ListFooterComponent={() =>
          loading && documents.length > 0 ? (
            <ActivityIndicator size="small" color={appTheme.colors.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={() =>
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyStateText}>Nenhum documento encontrado</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginTop: 40 }} />
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: appTheme.colors.textPrimary,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "white",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filtersPanel: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
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
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: "white",
  },
  chipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.primary,
  },
  accessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  accessBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
    fontFamily: "IBM_Plex_Sans",
  },
  cardSummary: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardAuthor: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
    flex: 1,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardStatText: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 8,
  },
  cardDate: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  cardTypeLabel: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: appTheme.colors.textMuted,
  },
});
