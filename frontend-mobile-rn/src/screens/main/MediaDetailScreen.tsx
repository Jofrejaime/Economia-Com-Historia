import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio, AVPlaybackStatus } from "expo-av";
import WebView from "react-native-webview";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";
import { documentService } from "../../services/api/documentService";
import { AccessRequestModal } from "../../components/AccessRequestModal";
import type { Document, DocumentQuizPreview, DocumentTopicPreview } from "../../types/api";

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

// Extrai o ID de um URL do YouTube (formato watch ou youtu.be)
function difficultyColor(d: string): string {
  if (d === "Básico") return appTheme.colors.success;
  if (d === "Intermédio") return appTheme.colors.warning;
  if (d === "Avançado") return appTheme.colors.danger;
  return appTheme.colors.textSecondary;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

// Player de áudio com expo-av — carrega e toca URLs directos (mp3, m4a, etc.)
function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(Math.floor((status.positionMillis ?? 0) / 1000));
    if (status.durationMillis) setDuration(Math.floor(status.durationMillis / 1000));
    if (status.didJustFinish) {
      void soundRef.current?.setPositionAsync(0);
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  useEffect(() => {
    return () => { void soundRef.current?.unloadAsync(); };
  }, []);

  const togglePlay = useCallback(async (mediaUrl: string) => {
    try {
      if (!soundRef.current) {
        setIsLoading(true);
        setError(null);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: mediaUrl },
          { shouldPlay: true },
          onStatusUpdate
        );
        soundRef.current = sound;
        setIsLoading(false);
        return;
      }
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch {
      setError("Não foi possível carregar o áudio. Verifica a tua ligação.");
      setIsLoading(false);
    }
  }, [isPlaying, onStatusUpdate]);

  const seek = useCallback(async (seconds: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(Math.max(0, seconds * 1000));
    setPosition(Math.max(0, Math.floor(seconds)));
  }, []);

  const setSpeed = useCallback(async (rate: number) => {
    await soundRef.current?.setRateAsync(rate, true);
  }, []);

  return { isPlaying, position, duration, isLoading, error, togglePlay, seek, setSpeed };
}

export function MediaDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { user } = useAuth();

  const audioPlayer = useAudioPlayer();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<"not_found" | "access_denied" | "subscription_required" | "network_error" | null>(null);
  const [requiredAccessLevel, setRequiredAccessLevel] = useState<string>("restricted");
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Dados embebidos no documento — sem chamadas extra
  const relatedQuizzes: DocumentQuizPreview[] = doc?.quizzes ?? [];
  const relatedTopics: DocumentTopicPreview[] = doc?.topics_preview ?? [];

  const loadDocument = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const data = await documentService.detail(id);
      setDoc(data);
      setIsLiked(data.is_liked ?? false);
      setIsFavorited(data.is_favorited ?? false);
      setLikesCount(data.likes_count);

      if (data.category_id) {
        documentService.list({
          category_id: data.category_id,
          document_type: data.document_type,
          per_page: 6,
        })
          .then((res) => setRelatedDocs(res.data.filter((d) => d.id !== id)))
          .catch(() => {});
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        const subscriptionRequired = err.response?.data?.subscription_required;
        const levelId = err.response?.data?.required_access_level_id
          ?? (subscriptionRequired ? "jindungo" : "restricted");
        setRequiredAccessLevel(levelId);
        setErrorType(subscriptionRequired ? "subscription_required" : "access_denied");
      } else if (status === 404) {
        setErrorType("not_found");
      } else {
        setErrorType("network_error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocument();
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
    void audioPlayer.setSpeed(next);
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

  if (errorType) {
    const errorConfig = {
      not_found: {
        icon: "x-circle" as const,
        title: "Conteúdo não encontrado",
        message: "Este conteúdo pode ter sido removido ou o link está incorrecto.",
      },
      access_denied: {
        icon: "lock" as const,
        title: "Acesso Restrito",
        message: "Este conteúdo requer acesso especial aprovado.",
      },
      subscription_required: {
        icon: "zap" as const,
        title: "Conteúdo Jindungo",
        message: "Este conteúdo é exclusivo para membros Jindungo. Solicita acesso e o administrador aprovará o teu pedido.",
      },
      network_error: {
        icon: "wifi-off" as const,
        title: "Falha de ligação",
        message: "Não foi possível carregar o conteúdo. Verifica a tua ligação.",
      },
    }[errorType];

    return (
      <ScreenContainer style={styles.screen}>
        <HeaderBar title="" />
        <View style={styles.centered}>
          <Feather name={errorConfig.icon} size={40} color={appTheme.colors.textMuted} />
          <Text style={styles.errorTitle}>{errorConfig.title}</Text>
          <Text style={styles.errorText}>{errorConfig.message}</Text>
          {(errorType === "access_denied" || errorType === "subscription_required") && (
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => {
                if (!user) {
                  navigation.navigate("LoginPrompt", { type: "comment" });
                } else {
                  setAccessModalVisible(true);
                }
              }}
            >
              <Feather name="send" size={15} color={appTheme.colors.surface} style={{ marginRight: 6 }} />
              <Text style={styles.errorButtonText}>Solicitar Acesso</Text>
            </TouchableOpacity>
          )}
          {errorType === "network_error" && (
            <TouchableOpacity style={styles.errorButton} onPress={() => void loadDocument()}>
              <Text style={styles.errorButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorLink}>
            <Text style={styles.errorLinkText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <AccessRequestModal
          visible={accessModalVisible}
          documentId={id}
          accessLevelId={requiredAccessLevel}
          onClose={() => setAccessModalVisible(false)}
        />
      </ScreenContainer>
    );
  }

  if (!doc) return null;

  const isVideo = doc.document_type === "video";
  const isAudio = doc.document_type === "audio";
  const hasMedia = !!doc.media_url;
  const summary = doc.summary ?? "";
  const SUMMARY_LIMIT = 180;
  const summaryNeedsExpansion = summary.length > SUMMARY_LIMIT;

  return (
    <ScreenContainer style={styles.screen}>
      {/* ── Área de vídeo (topo, fora do ScrollView) ── */}
      {isVideo && (
        <View style={styles.videoWrapper}>
          {hasMedia ? (
            (() => {
              const ytId = getYouTubeId(doc.media_url!);
              if (ytId) {
                return (
                  <WebView
                    source={{ uri: `https://www.youtube.com/embed/${ytId}?playsinline=1&rel=0&modestbranding=1` }}
                    style={styles.videoPlayer}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    allowsFullscreenVideo
                  />
                );
              }
              // URL directa (mp4) — thumbnail com fallback
              return (
                <View style={styles.videoPlayer}>
                  {doc.cover_image_url ? (
                    <Image source={{ uri: doc.cover_image_url }} style={styles.videoThumbnail} resizeMode="cover" />
                  ) : (
                    <View style={styles.videoThumbnailFallback} />
                  )}
                  <View style={styles.videoPlayOverlay}>
                    <Text style={styles.noMediaText}>Formato de vídeo não suportado no player</Text>
                  </View>
                </View>
              );
            })()
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

      <HeaderBar title={isVideo ? "" : isAudio ? "Áudio" : "Média"} />

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
              <Text style={styles.progressTime}>{formatDuration(audioPlayer.position)}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: audioPlayer.duration > 0 ? `${Math.min(100, (audioPlayer.position / audioPlayer.duration) * 100)}%` : "0%" },
                  ]}
                />
              </View>
              <Text style={styles.progressTime}>{formatDuration(audioPlayer.duration)}</Text>
            </View>

            {/* Erro de carregamento */}
            {audioPlayer.error && (
              <Text style={styles.noMediaHint}>{audioPlayer.error}</Text>
            )}

            {/* Controls */}
            <View style={styles.audioControls}>
              <TouchableOpacity
                onPress={() => void audioPlayer.seek(audioPlayer.position - 15)}
                style={styles.skipBtn}
                disabled={!doc.media_url}
              >
                <Ionicons name="play-back" size={26} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => doc.media_url && void audioPlayer.togglePlay(doc.media_url)}
                style={[styles.playBtnAudio, !doc.media_url && { opacity: 0.4 }]}
                activeOpacity={0.85}
                disabled={!doc.media_url || audioPlayer.isLoading}
              >
                {audioPlayer.isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name={audioPlayer.isPlaying ? "pause" : "play"}
                    size={30}
                    color="white"
                    style={!audioPlayer.isPlaying ? { marginLeft: 4 } : undefined}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => void audioPlayer.seek(audioPlayer.position + 30)}
                style={styles.skipBtn}
                disabled={!doc.media_url}
              >
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
            {(doc.comments_count ?? 0) > 0 && (
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

        {/* ── Quizzes relacionados ── */}
        {relatedQuizzes.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.relatedBlock}>
              <Text style={styles.sectionLabel}>QUIZZES RELACIONADOS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quizList}>
                {relatedQuizzes.slice(0, 5).map((quiz) => (
                  <TouchableOpacity
                    key={quiz.id}
                    style={styles.quizCard}
                    onPress={() => {
                      if (!user) {
                        navigation.navigate("LoginPrompt", { type: "quiz" });
                      } else {
                        navigation.navigate("Quiz", { quizId: quiz.id });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.quizCardTop}>
                      <View style={[styles.diffDot, { backgroundColor: difficultyColor(quiz.difficulty) }]} />
                      <Text style={[styles.quizDiff, { color: difficultyColor(quiz.difficulty) }]}>
                        {quiz.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.quizCardTitle} numberOfLines={3}>{quiz.title}</Text>
                    <View style={styles.quizCardFooter}>
                      <Ionicons name="star-outline" size={12} color={appTheme.colors.textMuted} />
                      <Text style={styles.quizCardMeta}>{quiz.base_points} pts</Text>
                      <Feather name="arrow-right" size={14} color={appTheme.colors.primary} style={{ marginLeft: "auto" }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                    {topic.category_color_bg && (
                      <View style={[styles.topicCatBar, { backgroundColor: topic.category_color_bg }]} />
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
  errorTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  errorText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  errorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: appTheme.radius.button,
    marginTop: 4,
  },
  errorButtonText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.surface,
  },
  errorLink: {
    marginTop: 4,
    padding: 8,
  },
  errorLinkText: {
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: appTheme.colors.primary,
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
    backgroundColor: appTheme.colors.jindungoCardBg,
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
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: appTheme.spacing.md,
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
    marginBottom: appTheme.spacing.md,
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
    paddingHorizontal: appTheme.spacing.lg,
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
    borderRadius: appTheme.radius.button,
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
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.userAvatarBg,
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
    backgroundColor: appTheme.colors.userAvatarBg,
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
    paddingHorizontal: appTheme.spacing.lg,
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
    paddingHorizontal: appTheme.spacing.lg,
    paddingBottom: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appTheme.radius.pill,
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
    paddingHorizontal: appTheme.spacing.lg,
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

  // ── Quizzes ──
  quizList: {
    gap: 12,
    paddingBottom: 4,
  },
  quizCard: {
    width: 180,
    backgroundColor: appTheme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 14,
    justifyContent: "space-between",
    minHeight: 130,
  },
  quizCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  diffDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  quizDiff: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    fontWeight: "700",
  },
  quizCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  quizCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  quizCardMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
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
    borderRadius: appTheme.radius.sm,
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
