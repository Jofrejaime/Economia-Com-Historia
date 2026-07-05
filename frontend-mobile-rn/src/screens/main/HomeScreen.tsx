import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { MediaFormatCards } from "../../components/MediaFormatCards";
import { appTheme } from "../../constants/theme";
import { documentService } from "../../services/api/documentService";
import type { Document } from "../../types/api";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  article: "Artigo",
  thesis: "Tese",
  report: "Relatório",
  manuscript: "Manuscrito",
  archive: "Arquivo",
};

export function HomeScreen() {
  const navigation = useNavigation<any>();

  const [featuredDoc, setFeaturedDoc] = useState<Document | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [featuredRes, recentRes] = await Promise.allSettled([
        documentService.list({ sort: "popular", per_page: 1 }),
        documentService.list({ sort: "recent", per_page: 3 }),
      ]);
      if (featuredRes.status === "fulfilled") setFeaturedDoc(featuredRes.value.data[0] ?? null);
      if (recentRes.status === "fulfilled") setRecentDocs(recentRes.value.data);
      setLoading(false);
    };
    load();
  }, []);

  const featuredTypeLabel = featuredDoc
    ? (featuredDoc.category?.name ?? DOCUMENT_TYPE_LABELS[featuredDoc.document_type] ?? featuredDoc.document_type).toUpperCase()
    : "";

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <Ionicons name="book" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.appTitle}>Economia com História</Text>
              <Text style={styles.appSubtitle}>Angola</Text>
            </View>
          </View>
          <Text style={styles.headerLead}>
            Aprende a história económica do teu país com conteúdo académico sério e acessível
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Em Destaque */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Em Destaque</Text>

              {featuredDoc ? (
                <TouchableOpacity
                  style={styles.featuredCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    const isMedia = featuredDoc.document_type === "video" || featuredDoc.document_type === "audio";
                    navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: featuredDoc.id });
                  }}
                >
                  {featuredDoc.cover_image_url ? (
                    <ImageBackground
                      source={{ uri: featuredDoc.cover_image_url }}
                      style={styles.featuredImage}
                      imageStyle={{ borderRadius: 14 }}
                    >
                      <View style={styles.featuredOverlay} />
                      <View style={styles.featuredBody}>
                        <Text style={styles.featuredTag}>{featuredTypeLabel}</Text>
                        <Text style={styles.featuredTitle} numberOfLines={3}>
                          {featuredDoc.title}
                        </Text>
                        <TouchableOpacity
                          style={styles.featuredButton}
                          onPress={() =>
                            featuredDoc.access_level_id === "jindungo"
                              ? navigation.navigate("Content", { access_level_id: "jindungo" })
                              : navigation.navigate("Content", { document_type: featuredDoc.document_type })
                          }
                        >
                          <Text style={styles.featuredButtonText}>
                            Explorar mais {featuredDoc.category?.name ?? DOCUMENT_TYPE_LABELS[featuredDoc.document_type]}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={[styles.featuredImage, styles.featuredImageFallback]}>
                      <View style={styles.featuredOverlay} />
                      <View style={styles.featuredBody}>
                        <Text style={styles.featuredTag}>{featuredTypeLabel}</Text>
                        <Text style={styles.featuredTitle} numberOfLines={3}>
                          {featuredDoc.title}
                        </Text>
                        <TouchableOpacity
                          style={styles.featuredButton}
                          onPress={() =>
                            featuredDoc.access_level_id === "jindungo"
                              ? navigation.navigate("Content", { access_level_id: "jindungo" })
                              : navigation.navigate("Content", { document_type: featuredDoc.document_type })
                          }
                        >
                          <Text style={styles.featuredButtonText}>
                            Explorar mais {featuredDoc.category?.name ?? DOCUMENT_TYPE_LABELS[featuredDoc.document_type]}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.featuredEmpty}>
                  <Text style={styles.emptyText}>Nenhum conteúdo em destaque.</Text>
                </View>
              )}
            </View>

            {/* Conteúdos Recentes */}
            {recentDocs.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitleSmall}>Conteúdos Recentes</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Content")}>
                    <Text style={styles.linkText}>Ver todos</Text>
                  </TouchableOpacity>
                </View>

                {recentDocs.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.card}
                    onPress={() => {
                      const isMedia = doc.document_type === "video" || doc.document_type === "audio";
                      navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: doc.id });
                    }}
                  >
                    {doc.cover_image_url ? (
                      <ImageBackground
                        source={{ uri: doc.cover_image_url }}
                        style={styles.cardImage}
                        imageStyle={{ borderRadius: 10 }}
                      />
                    ) : (
                      <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
                    )}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTag}>
                        {doc.category?.name ?? DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                      </Text>
                      <Text style={styles.cardTitle} numberOfLines={2}>{doc.title}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>{doc.author}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Vídeos e Áudios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleSmall}>Vídeos e Áudios</Text>
              <MediaFormatCards
                onPressVideo={() => navigation.navigate("Content", { document_type: "video" })}
                onPressAudio={() => navigation.navigate("Content", { document_type: "audio" })}
              />
            </View>

            {/* Explorar por Formato */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleSmall}>Explorar por Formato</Text>

              <TouchableOpacity
                style={styles.formatCard}
                onPress={() => navigation.navigate("Content", { access_level_id: "jindungo" })}
              >
                <View style={[styles.formatIcon, { backgroundColor: appTheme.colors.primary }]}>
                  <Ionicons name="flame" size={24} color="white" />
                </View>
                <View style={styles.formatBody}>
                  <Text style={styles.formatTitle}>Jindungo</Text>
                  <Text style={styles.formatDesc}>Análises profundas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.formatCard}
                onPress={() => navigation.navigate("Content", { document_type: "article" })}
              >
                <View style={[styles.formatIcon, { backgroundColor: appTheme.colors.warning }]}>
                  <Ionicons name="flash" size={24} color="white" />
                </View>
                <View style={styles.formatBody}>
                  <Text style={styles.formatTitle}>Artigos</Text>
                  <Text style={styles.formatDesc}>Leitura rápida</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.formatCard}
                onPress={() => navigation.navigate("Content", { document_type: "thesis" })}
              >
                <View style={[styles.formatIcon, { backgroundColor: appTheme.colors.success }]}>
                  <Ionicons name="school-outline" size={24} color="white" />
                </View>
                <View style={styles.formatBody}>
                  <Text style={styles.formatTitle}>Teses</Text>
                  <Text style={styles.formatDesc}>Investigação académica</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.formatCard}
                onPress={() => navigation.navigate("Content", { document_type: "report" })}
              >
                <View style={[styles.formatIcon, { backgroundColor: appTheme.colors.textSecondary }]}>
                  <Ionicons name="bar-chart-outline" size={24} color="white" />
                </View>
                <View style={styles.formatBody}>
                  <Text style={styles.formatTitle}>Relatórios</Text>
                  <Text style={styles.formatDesc}>Estudos e análises</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.formatCard}
                onPress={() => navigation.navigate("Content", { document_type: "manuscript" })}
              >
                <View style={[styles.formatIcon, { backgroundColor: appTheme.colors.primaryDark }]}>
                  <Ionicons name="book-outline" size={24} color="white" />
                </View>
                <View style={styles.formatBody}>
                  <Text style={styles.formatTitle}>Manuscritos</Text>
                  <Text style={styles.formatDesc}>Documentos históricos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 48,
  },

  // Header
  header: {
    backgroundColor: appTheme.colors.primary,
    padding: appTheme.spacing.md,
    borderRadius: 12,
    marginTop: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: appTheme.radius.sm,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  appTitle: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 20,
    fontWeight: "700",
  },
  appSubtitle: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
  headerLead: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 22,
  },

  // Loading
  loadingWrap: {
    paddingVertical: 64,
    alignItems: "center",
  },

  // Section
  section: {
    marginTop: appTheme.spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  linkText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontWeight: "600",
  },

  // Featured card
  featuredCard: {
    borderRadius: appTheme.radius.lg,
    overflow: "hidden",
  },
  featuredImage: {
    height: 180,
    justifyContent: "flex-end",
  },
  featuredImageFallback: {
    backgroundColor: appTheme.colors.primaryDark,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: appTheme.colors.textMuted,
  },
  featuredBody: {
    padding: appTheme.spacing.md,
  },
  featuredTag: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
    overflow: "hidden",
  },
  featuredTitle: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 12,
  },
  featuredButton: {
    alignSelf: "flex-end",
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: appTheme.radius.button,
  },
  featuredButtonText: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  featuredEmpty: {
    height: 100,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: 14,
  },

  // Content cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: appTheme.radius.sm,
    marginRight: 12,
  },
  cardImagePlaceholder: {
    backgroundColor: appTheme.colors.border,
  },
  cardBody: {
    flex: 1,
  },
  cardTag: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 4,
  },
  cardMeta: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },

  // Format cards
  formatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: appTheme.spacing.md,
    marginBottom: appTheme.spacing.sm,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: appTheme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  formatBody: {
    flex: 1,
  },
  formatTitle: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },
  formatDesc: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
});
