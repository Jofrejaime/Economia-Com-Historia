/**
 * MediaDetailScreen — detalhe de vídeo ou áudio.
 *
 * Reprodução real: requer `npx expo install expo-av`.
 * Enquanto o pacote não estiver instalado, o player é mockado com
 * estado local (play/pause, seek). As chamadas à API e toda a UI
 * estão funcionais independentemente do player nativo.
 *
 * Para activar expo-av: descomenta os blocos marcados com [expo-av].
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { documentService } from "../../services/api/documentService";
import { communityService } from "../../services/api/communityService";
import type { Document, DiscussionTopic } from "../../types/api";

// ─── [expo-av] Descomenta quando `npx expo install expo-av` for executado ───
// import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
// import { Audio } from "expo-av";
// ────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = Math.round(SCREEN_WIDTH * (9 / 16));

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-AO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function navigateToDocument(navigation: any, doc: Document) {
  const isMedia = doc.document_type === "video" || doc.document_type === "audio";
  navigation.navigate(isMedia ? "MediaDetail" : "Article", { id: doc.id });
}

// ─── Mock player state (substituído por expo-av quando instalado) ─────────
function useMockPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const play = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setPosition((p) => p + 1);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((secs: number) => setPosition(secs), []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { isPlaying, position, duration, togglePlay, seek, play, pause };
}
// ─────────────────────────────────────────────────────────────────────────────

export function MediaDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { user } = useAuth();

  const player = useMockPlayer();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<DiscussionTopic[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await documentService.detail(id);
        setDoc(data);
        setIsLiked(data.is_liked ?? false);
        setIsFavorited(data.is_favorited ?? false);
        setLikesCount(data.likes_count);

        // Carregar relacionados em background (não bloqueante)
        if (data.category_id) {
          documentService.list({
            category_id: data.category_id,
            document_type: data.document_type,
            per_page: 6,
          })
            .then((res) => setRelatedDocs(res.data.filter((d) => d.id !== id)))
            .catch(() => {});
        }

        if (data.category) {
          communityService.categories()
            .then((cats) => {
              const match = cats.find(
                (c) => c.name.toLowerCase() === data.category!.name.toLowerCase()
              );
              if (!match) return;
              communityService
                .topics({ category_id: match.id, per_page: 4, sort: "recent" })
                .then((res) => setRelatedTopics(res.data))
                .catch(() => {});
            })
            .catch(() => {});
        }
      } catch {
        // erro tratado no render
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleLike = async () => {
    if (!user) { navigation.navigate("LoginPrompt", { type: "comment" }); return; }
    try {
      if (isLiked) {
        await documentService.unlike(id);
        setLikesCount((n) => n - 1);
      } else {
        await documentService.like(id);
        setLikesCount((n) => n + 1);
      }
      setIsLiked((v) => !v);
    } catch { /* ignorar */ }
  };

  const handleFavorite = async () => {
    if (!user) { navigation.navigate("LoginPrompt", { type: "comment" }); return; }
    try {
      if (isFavorited) {
        await documentService.unfavorite(id);
      } else {
        await documentService.favorite(id);
      }
      setIsFavorited((v) => !v);
    } catch { /* ignorar */ }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(next);
    // [expo-av] soundRef.current?.setRateAsync(next, true);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenContainer style={styles.screen}>
        <HeaderBar title="" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!doc) {
    return (
      <ScreenContainer style={styles.screen}>
        <HeaderBar title="" />
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color={appTheme.colors.textMuted} />
          <Text style={styles.errorText}>Conteúdo não encontrado.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isVideo = doc.document_type === "video";
  const isAudio = doc.document_type === "audio";
  const hasMedia = !!doc.media_url;
  const summary = doc.summary ?? "";
  const SUMMARY_LIMIT = 180;
  const summaryNeedsExpansion = summary.length > SUMMARY_LIMIT;

  return (
    <ScreenContainer style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.surface} />

      {/* ── Área multimédia (topo, fora do ScrollView) ── */}
      {isVideo && (
        <View style={styles.videoWrapper}>
          {hasMedia ? (
            // ─── [expo-av] Substituir View por: ───────────────────────────
            // <Video
            //   ref={videoRef}
            //   source={{ uri: doc.media_url! }}
            //   style={styles.videoPlayer}
            //   resizeMode={ResizeMode.CONTAIN}
            //   useNativeControls
            //   shouldPlay={false}
            //   onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            // />
            // ──────────────────────────────────────────────────────────────
            <View style={styles.videoPlayer}>
              {doc.cover_image_url ? (
                <Image source={{ uri: doc.cover_image_url }} style={styles.videoThumbnail} resizeMode="cover" />
              ) : (
                <View style={styles.videoThumbnailFallback} />
              )}
              <TouchableOpacity
                style={styles.videoPlayOverlay}
                onPress={player.togglePlay}
                activeOpacity={0.85}
              >
                <View style={styles.videoPlayBtn}>
                  <Ionicons name={player.isPlaying ? "pause" : "play"} size={32} color="white" style={!player.isPlaying ? { marginLeft: 4 } : undefined} />
                </View>
                {!player.isPlaying && (
                  <Text style={styles.videoInstallHint}>
                    {hasMedia ? "Toque para reproduzir" : "URL de média não definido"}
                  </Text>
                )}
              </TouchableOpacity>
              {/* Fullscreen button */}
              <TouchableOpacity style={styles.fullscreenBtn} activeOpacity={0.8}>
                <Ionicons name="expand-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoPlayer}>
              <View style={styles.videoThumbnailFallback} />
              <View style={styles.videoPlayOverlay}>
                <Text style={styles.noMediaText}>URL de média não configurado</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <HeaderBar
        title={isVideo ? "" : isAudio ? "Áudio" : "Média"}
        style={isVideo ? styles.headerOverVideo : undefined}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Player de áudio ── */}
        {isAudio && (
          <View style={styles.audioBlock}>
            {doc.cover_image_url ? (
              <Image source={{ uri: doc.cover_image_url }} style={styles.audioCover} resizeMode="cover" />
            ) : (
              <View style={[styles.audioCover, styles.audioCoverFallback]}>
                <Ionicons name="musical-notes" size={48} color={appTheme.colors.primary} />
              </View>
            )}

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressTime}>{formatDuration(player.position)}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: player.duration > 0 ? `${(player.position / player.duration) * 100}%` : "0%" },
                  ]}
                />
              </View>
              <Text style={styles.progressTime}>{formatDuration(player.duration)}</Text>
            </View>

            {/* Controls */}
            <View style={styles.audioControls}>
              <TouchableOpacity onPress={() => player.seek(Math.max(0, player.position - 15))} style={styles.skipBtn}>
                <Ionicons name="play-back" size={26} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={player.togglePlay} style={styles.playBtnAudio} activeOpacity={0.85}>
                <Ionicons name={player.isPlaying ? "pause" : "play"} size={30} color="white" style={!player.isPlaying ? { marginLeft: 4 } : undefined} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => player.seek(player.position + 30)} style={styles.skipBtn}>
                <Ionicons name="play-forward" size={26} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Secondary controls */}
            <View style={styles.audioSecondary}>
              <TouchableOpacity onPress={cycleSpeed} style={styles.secondaryBtn}>
                <Text style={styles.speedLabel}>{playbackSpeed}x</Text>
                <Text style={styles.secondaryBtnLabel}>Velocidade</Text>
              </TouchableOpacity>
            </View>

            {!hasMedia && (
              <Text style={styles.noMediaHint}>URL de média não configurado neste documento.</Text>
            )}
          </View>
        )}

        {/* ── Informações ── */}
        <View style={styles.infoBlock}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{isVideo ? "VÍDEO" : "ÁUDIO"}</Text>
            </View>
            {doc.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{doc.category.name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{doc.title}</Text>

          {/* Autor + meta */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitials}>{doc.author.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{doc.author}</Text>
              <Text style={styles.authorMeta}>
                {doc.institution ? `${doc.institution} · ` : ""}
                {formatDate(doc.publication_date ?? doc.published_at)}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={15} color={appTheme.colors.textMuted} />
              <Text style={styles.statText}>{doc.views_count.toLocaleString()} visualizações</Text>
            </View>
            {doc.comments_count > 0 && (
              <View style={styles.stat}>
                <Ionicons name="chatbubble-outline" size={15} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{doc.comments_count} comentários</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Acções: Like + Favoritar ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleLike} style={[styles.actionBtn, isLiked && styles.actionBtnActive]}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? appTheme.colors.danger : appTheme.colors.textSecondary}
            />
            <Text style={[styles.actionBtnText, isLiked && { color: appTheme.colors.danger }]}>
              {likesCount > 0 ? likesCount : "Gosto"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFavorite} style={[styles.actionBtn, isFavorited && styles.actionBtnActive]}>
            <Ionicons
              name={isFavorited ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isFavorited ? appTheme.colors.primary : appTheme.colors.textSecondary}
            />
            <Text style={[styles.actionBtnText, isFavorited && { color: appTheme.colors.primary }]}>
              {isFavorited ? "Guardado" : "Guardar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("CreateTopic", {
              initialTitle: doc.title,
            })}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={appTheme.colors.textSecondary} />
            <Text style={styles.actionBtnText}>Debater</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Descrição ── */}
        {summary.length > 0 && (
          <View style={styles.descBlock}>
            <Text style={styles.sectionLabel}>DESCRIÇÃO</Text>
            <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 4}>
              {summary}
            </Text>
            {summaryNeedsExpansion && (
              <TouchableOpacity onPress={() => setDescExpanded((v) => !v)} style={styles.seeMoreBtn}>
                <Text style={styles.seeMoreText}>{descExpanded ? "Ver menos" : "Ver mais"}</Text>
                <Feather
                  name={descExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={appTheme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Tags ── */}
        {doc.tags && doc.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {doc.tags.map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Conteúdos relacionados ── */}
        {relatedDocs.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.relatedBlock}>
              <Text style={styles.sectionLabel}>
                {isVideo ? "MAIS VÍDEOS" : "MAIS ÁUDIOS"}
              </Text>
              {relatedDocs.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => navigateToDocument(navigation, item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.relatedThumb}>
                    {item.cover_image_url ? (
                      <Image source={{ uri: item.cover_image_url }} style={styles.relatedThumbImage} />
                    ) : (
                      <View style={styles.relatedThumbFallback}>
                        <Ionicons
                          name={item.document_type === "video" ? "play-circle-outline" : "musical-notes-outline"}
                          size={24}
                          color={appTheme.colors.textMuted}
                        />
                      </View>
                    )}
                    <View style={styles.relatedTypeTag}>
                      <Ionicons
                        name={item.document_type === "video" ? "play" : "musical-note"}
                        size={8}
                        color="white"
                      />
                    </View>
                  </View>
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.relatedMeta}>{item.author}</Text>
                    <Text style={styles.relatedViews}>{item.views_count.toLocaleString()} visualizações</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── Fóruns relacionados ── */}
        {relatedTopics.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.relatedBlock}>
              <Text style={styles.sectionLabel}>DISCUSSÕES RELACIONADAS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsList}>
                {relatedTopics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicCard}
                    onPress={() => navigation.navigate("TopicDiscussion", { id: topic.id })}
                    activeOpacity={0.8}
                  >
                    {topic.category?.color_bg && (
                      <View style={[styles.topicCatBar, { backgroundColor: topic.category.color_bg }]} />
                    )}
                    <Text style={styles.topicTitle} numberOfLines={3}>{topic.title}</Text>
                    <View style={styles.topicMeta}>
                      <Ionicons name="chatbubble-outline" size={12} color={appTheme.colors.textMuted} />
                      <Text style={styles.topicMetaText}>{topic.replies_count} respostas</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── [Mini Player — Arquitectura] ────────────────────────────────────────────
// Para implementar o Mini Player global:
// 1. Criar AudioPlayerContext em src/contexts/AudioPlayerContext.tsx
// 2. Envolver o MainNavigator com <AudioPlayerProvider>
// 3. Adicionar <MiniPlayer /> acima do <BottomTabBar /> no layout
// 4. Usar expo-av com Audio.setAudioModeAsync({ staysActiveInBackground: true })
// 5. O contexto expõe: track, isPlaying, play(), pause(), seek(), clearTrack()
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textMuted,
    marginTop: 8,
  },

  // ── Vídeo ──
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: "#000",
    zIndex: 1,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoThumbnailFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a2e",
  },
  videoPlayOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    gap: 12,
  },
  videoPlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  videoInstallHint: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  fullscreenBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  noMediaText: {
    fontFamily: "Source_Sans_3",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  headerOverVideo: {
    // Quando há vídeo, o header está por baixo da área de vídeo, sem sobreposição
    backgroundColor: appTheme.colors.surface,
  },

  // ── Áudio ──
  audioBlock: {
    backgroundColor: appTheme.colors.surface,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  audioCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    ...appTheme.shadow.lg,
  },
  audioCoverFallback: {
    backgroundColor: appTheme.colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: appTheme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: appTheme.colors.primary,
    borderRadius: 2,
  },
  progressTime: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
    letterSpacing: 0.8,
    minWidth: 36,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    marginBottom: 20,
  },
  skipBtn: {
    padding: 8,
  },
  playBtnAudio: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...appTheme.shadow.md,
  },
  audioSecondary: {
    flexDirection: "row",
    gap: 32,
  },
  secondaryBtn: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  speedLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  secondaryBtnLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 9,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noMediaHint: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },

  // ── Scroll content ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  infoBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.background,
  },
  typeBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: appTheme.colors.primary + "18",
  },
  categoryBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 28,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: appTheme.colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitials: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  authorName: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  authorMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },

  // ── Acções ──
  divider: {
    height: 1,
    backgroundColor: appTheme.colors.border,
    marginHorizontal: 20,
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnActive: {
    backgroundColor: appTheme.colors.background,
  },
  actionBtnText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },

  // ── Descrição ──
  descBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  descText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    lineHeight: 23,
  },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  seeMoreText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  tagText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },

  // ── Relacionados ──
  relatedBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  relatedCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  relatedThumb: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: appTheme.colors.border,
    position: "relative",
    overflow: "hidden",
  },
  relatedThumbImage: {
    width: "100%",
    height: "100%",
  },
  relatedThumbFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: appTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  relatedTypeTag: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 4,
    padding: 3,
  },
  relatedInfo: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 3,
  },
  relatedTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
  },
  relatedMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  relatedViews: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },

  // ── Tópicos ──
  topicsList: {
    gap: 12,
    paddingBottom: 4,
  },
  topicCard: {
    width: 190,
    backgroundColor: appTheme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 14,
    minHeight: 100,
    justifyContent: "space-between",
  },
  topicCatBar: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  topicTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  topicMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  topicMetaText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
});
