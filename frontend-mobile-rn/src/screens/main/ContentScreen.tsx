import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { ContentCard } from "../../components/ContentCard";
import { SkeletonLoader } from "../../components/SkeletonLoader";
import { appTheme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { documentService } from "../../services/api/documentService";
import type { Document, DocumentType, AccessLevelId } from "../../types/api";
import type { ContentParams } from "../../types/navigation";

type SortType = "recent" | "popular";

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: "Artigo", value: "article" },
  { label: "Tese", value: "thesis" },
  { label: "Relatório", value: "report" },
  { label: "Manuscrito", value: "manuscript" },
  { label: "Arquivo", value: "archive" },
  { label: "Vídeo", value: "video" },
  { label: "Áudio", value: "audio" },
];


function ListCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonLoader width={96} height={72} borderRadius={appTheme.radius.md} />
      <View style={skeletonStyles.content}>
        <SkeletonLoader width={72} height={14} />
        <SkeletonLoader width="95%" height={16} />
        <SkeletonLoader width="75%" height={14} />
        <SkeletonLoader width="50%" height={12} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    gap: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
});

function accessLevelLabel(id: string): { label: string; color: string } {
  if (id === "jindungo") return { label: "Jindungo", color: appTheme.colors.warning };
  if (id === "restricted") return { label: "Restrito", color: appTheme.colors.danger };
  return { label: "Público", color: appTheme.colors.success };
}

export function ContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [draftSearch, setDraftSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | undefined>(undefined);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevelId | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [showFilters, setShowFilters] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  // Usar ref para página evita que fetchDocuments seja recriado a cada fetch,
  // eliminando o ciclo useCallback → setPage → novo fetchDocuments → re-render.
  const pageRef = useRef(1);

  useEffect(() => {
    const params = route.params as ContentParams | undefined;
    const hasAny = !!(params?.document_type || params?.access_level_id || params?.searchQuery);
    if (!hasAny) return;

    if (params!.document_type) { setSelectedType(params!.document_type); }
    if (params!.access_level_id) { setSelectedAccessLevel(params!.access_level_id); }
    if (params!.searchQuery) { setSearchQuery(params!.searchQuery); setDraftSearch(params!.searchQuery); }
    setShowFilters(true);

    navigation.setParams({
      document_type: undefined,
      access_level_id: undefined,
      academic_level: undefined,
      searchQuery: undefined,
    });
  }, [route.params]);

  const fetchDocuments = useCallback(async (reset = false) => {
    if (reset) {
      pageRef.current = 1;
      setDocuments([]);
      setTotal(0);
      setHasMore(true);
    }
    setLoading(true);
    const currentPage = pageRef.current;
    try {
      const response = await documentService.list({
        q: searchQuery.trim() || undefined,
        document_type: selectedType,
        access_level_id: selectedAccessLevel,
        sort: sortBy,
        page: currentPage,
        per_page: 15,
      });
      setDocuments((prev) => (reset ? response.data : [...prev, ...response.data]));
      setTotal(response.meta.total);
      setHasMore(response.meta.current_page < response.meta.last_page);
      pageRef.current = currentPage + 1;
    } catch (error) {
      console.warn("Erro ao carregar documentos", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedAccessLevel, sortBy]);

  useEffect(() => {
    void fetchDocuments(true);
  }, [fetchDocuments]);

  const applySearch = () => {
    const q = draftSearch.trim();
    if (q !== searchQuery) setSearchQuery(q);
  };

  const clearSearch = () => {
    setDraftSearch("");
    setSearchQuery("");
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <ContentCard
      variant="list"
      title={item.title}
      author={item.author}
      image={item.cover_image_url}
      documentType={item.document_type}
      accessLevelId={item.access_level_id}
      categoryName={item.category?.name}
      categoryColorBg={item.category?.color_bg}
      categoryColorText={item.category?.color_text}
      summary={item.summary}
      viewsCount={item.views_count}
      likesCount={item.likes_count}
      publishedAt={item.published_at ?? item.created_at}
      onPress={() => {
        const isMedia = item.document_type === "video" || item.document_type === "audio";
        navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: item.id });
      }}
    />
  );

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Documentos" showBackButton={false} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={appTheme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={draftSearch}
            onChangeText={setDraftSearch}
            onSubmitEditing={applySearch}
            returnKeyType="search"
            placeholder="Pesquisar documentos..."
            placeholderTextColor={appTheme.colors.textMuted}
            style={styles.searchInput}
            underlineColorAndroid="transparent"
            selectionColor={appTheme.colors.primary}
          />
          {draftSearch.length > 0 && (
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
          {[selectedType, selectedAccessLevel].filter(Boolean).length > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {[selectedType, selectedAccessLevel].filter(Boolean).length}
              </Text>
            </View>
          ) : (
            <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>Filtros</Text>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Tipo de Documento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
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
          </ScrollView>

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

      <FlatList
        data={!loading && total === 0 ? [] : documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (hasMore && !loading) fetchDocuments(false); }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={() =>
          !loading || documents.length > 0 ? (
            <Text style={styles.resultsCount}>
              {`${total} ${total === 1 ? "documento encontrado" : "documentos encontrados"}`}
            </Text>
          ) : null
        }
        ListFooterComponent={() =>
          loading && documents.length > 0 ? (
            <ActivityIndicator size="small" color={appTheme.colors.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View>
                {[1, 2, 3, 4, 5].map((i) => <ListCardSkeleton key={i} />)}
              </View>
            );
          }
          const hasFilters = !!(searchQuery || selectedType || selectedAccessLevel);
          return (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={52} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Nenhum documento encontrado</Text>
              {hasFilters ? (
                <>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? `Não há resultados para "${searchQuery}"${selectedType ? ` do tipo ${DOCUMENT_TYPES.find((t) => t.value === selectedType)?.label}` : ""}.`
                      : "Não há documentos que correspondam aos filtros seleccionados."}
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={() => {
                      setSearchQuery("");
                      setDraftSearch("");
                      setSelectedType(undefined);
                      setSelectedAccessLevel(undefined);
                    }}
                  >
                    <Feather name="x-circle" size={15} color={appTheme.colors.primary} />
                    <Text style={styles.clearFiltersText}>Limpar filtros</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyStateText}>Ainda não há documentos publicados.</Text>
              )}
            </View>
          );
        }}
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
    borderRadius: appTheme.radius.sm,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    // @ts-ignore
    outlineWidth: 0,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: appTheme.radius.sm,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  filterButtonText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filtersPanel: {
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  filterLabel: {
    fontFamily: "Source_Sans_3",
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
    backgroundColor: appTheme.colors.surface,
  },
  chipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  chipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  resultsCount: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    fontFamily: "IBM_Plex_Sans",
  },
  emptyStateText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
  },
  clearFiltersText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.primary,
    fontWeight: "600",
  },
});
