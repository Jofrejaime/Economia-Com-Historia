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
import { isMediaDocument } from "../../utils/mediaKind";
import type { Document, DocumentType, MediaType } from "../../types/api";
import type { ContentParams } from "../../types/navigation";

type SortType = "recent" | "popular";

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: "Artigo", value: "article" },
  { label: "Tese", value: "thesis" },
  { label: "Relatório", value: "report" },
  { label: "Manuscrito", value: "manuscript" },
  { label: "Arquivo", value: "archive" },
];

// Tipo de conteúdo (determinado pelo ficheiro) — coerente com o filtro do web.
const MEDIA_TYPES: { label: string; value: MediaType }[] = [
  { label: "Texto", value: "TEXT" },
  { label: "Vídeo", value: "VIDEO" },
  { label: "Podcast", value: "AUDIO" },
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

export function ContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [draftSearch, setDraftSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | undefined>(undefined);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [showFilters, setShowFilters] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const pageRef = useRef(1);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = await documentService.categories();
        setCategories(cats);
      } catch (err) {
        console.warn("Erro ao obter categorias", err);
      }
    };
    void loadCats();
  }, []);

  useEffect(() => {
    const params = route.params as ContentParams | undefined;
    const hasAny = !!(params?.document_type || params?.media_type || params?.searchQuery || params?.category_id);
    if (!hasAny) return;

    if (params!.media_type) { setSelectedMediaType(params!.media_type); }
    if (params!.document_type) { setSelectedDocumentType(params!.document_type); }
    if (params!.category_id) { setSelectedCategoryId(params!.category_id); }
    if (params!.searchQuery) { setSearchQuery(params!.searchQuery); setDraftSearch(params!.searchQuery); }
    setShowFilters(true);

    navigation.setParams({
      document_type: undefined,
      media_type: undefined,
      academic_level: undefined,
      category_id: undefined,
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
        media_type: selectedMediaType,
        document_type: selectedDocumentType,
        category_id: selectedCategoryId,
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
  }, [searchQuery, selectedMediaType, selectedDocumentType, selectedCategoryId, sortBy]);

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
      requiresSubscription={item.category?.requires_subscription === true}
      categoryName={item.category?.name}
      categoryColorBg={item.category?.color_bg}
      categoryColorText={item.category?.color_text}
      summary={item.summary}
      viewsCount={item.views_count}
      likesCount={item.likes_count}
      publishedAt={item.published_at ?? item.created_at}
      onPress={() => {
        const isMedia = isMediaDocument(item);
        navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: item.id });
      }}
    />
  );

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <HeaderBar title="Arquivo de Conteúdos" showBackButton={false} />

      <View style={styles.introHeader}>
        <Text style={styles.introText}>Documentos, vídeos, áudios e artigos sobre a história económica de Angola.</Text>
      </View>

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
          {[selectedMediaType, selectedDocumentType, selectedCategoryId].filter(Boolean).length > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {[selectedMediaType, selectedDocumentType, selectedCategoryId].filter(Boolean).length}
              </Text>
            </View>
          ) : (
            <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>Filtros</Text>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Tipo de conteúdo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <TouchableOpacity
              onPress={() => setSelectedMediaType(undefined)}
              style={[styles.chip, !selectedMediaType && styles.chipActive]}
            >
              <Text style={[styles.chipText, !selectedMediaType && styles.chipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {MEDIA_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSelectedMediaType(selectedMediaType === t.value ? undefined : t.value)}
                style={[styles.chip, selectedMediaType === t.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedMediaType === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Formato de documento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <TouchableOpacity
              onPress={() => setSelectedDocumentType(undefined)}
              style={[styles.chip, !selectedDocumentType && styles.chipActive]}
            >
              <Text style={[styles.chipText, !selectedDocumentType && styles.chipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {DOCUMENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSelectedDocumentType(selectedDocumentType === t.value ? undefined : t.value)}
                style={[styles.chip, selectedDocumentType === t.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedDocumentType === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {categories.length > 0 && (
            <>
              <Text style={[styles.filterLabel, { marginTop: 12 }]}>Categorias</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                <TouchableOpacity
                  onPress={() => setSelectedCategoryId(undefined)}
                  style={[styles.chip, !selectedCategoryId && styles.chipActive]}
                >
                  <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>Todas</Text>
                </TouchableOpacity>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCategoryId(selectedCategoryId === c.id ? undefined : c.id)}
                    style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

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
          const hasFilters = !!(searchQuery || selectedMediaType || selectedDocumentType || selectedCategoryId);
          return (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={52} color={appTheme.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Nada por aqui ainda</Text>
              <Text style={styles.emptyStateText}>
                Não encontrámos documentos com estes filtros. Experimente limpar a pesquisa ou escolher outro tema.
              </Text>
              {hasFilters && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery("");
                    setDraftSearch("");
                    setSelectedMediaType(undefined);
                    setSelectedDocumentType(undefined);
                    setSelectedCategoryId(undefined);
                  }}
                >
                  <Feather name="x-circle" size={15} color={appTheme.colors.primary} />
                  <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
                </TouchableOpacity>
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
    fontFamily: appTheme.fontFamily.body,
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    // @ts-ignore
    outlineWidth: 0,
    // @ts-ignore
    outlineStyle: "none" as any,
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
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: appTheme.colors.surface,
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: appTheme.radius.sm,
    backgroundColor: appTheme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontFamily: appTheme.fontFamily.body,
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
    fontFamily: appTheme.fontFamily.body,
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
    borderRadius: appTheme.radius.pill,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
  },
  chipActive: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  chipText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: appTheme.colors.surface,
    fontWeight: "600",
  },
  resultsCount: {
    fontFamily: appTheme.fontFamily.body,
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
    fontFamily: appTheme.fontFamily.heading,
  },
  emptyStateText: {
    fontFamily: appTheme.fontFamily.body,
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
    borderRadius: appTheme.radius.pill,
    borderWidth: 1,
    borderColor: appTheme.colors.primary,
  },
  clearFiltersText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    color: appTheme.colors.primary,
    fontWeight: "600",
  },
  introHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  introText: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
  },
});
