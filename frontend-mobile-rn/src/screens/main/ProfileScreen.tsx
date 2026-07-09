import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { SectionAccentLine } from "../../components/SectionAccentLine";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api/userService";
import { leaderboardService } from "../../services/api/leaderboardService";
import type { UserLevel, LeaderboardEntry, MeResponse } from "../../types/api";

export function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const navigation = useNavigation<any>();

  const [level, setLevel] = useState<UserLevel | null>(null);
  const [badges, setBadges] = useState<MeResponse["badges"]>([]);
  const [rankEntry, setRankEntry] = useState<LeaderboardEntry | null>(null);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [leaderboardRes, meRes] = await Promise.allSettled([
        leaderboardService.national({ per_page: 200 }),
        userService.me(),
      ]);

      if (leaderboardRes.status === "fulfilled") {
        const entry = leaderboardRes.value.find((e) => e.user_id === user.id) ?? null;
        setRankEntry(entry);
      }
      if (meRes.status === "fulfilled") {
        setLevel(meRes.value.user_level);
        setBadges(meRes.value.badges ?? []);
        if (meRes.value.user_level) {
          setQuizzesCompleted(meRes.value.user_level.quizzes_completed ?? 0);
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar perfil", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleEditAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permite o acesso à galeria para alterar a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const ext = asset.mimeType?.split("/")[1] ?? "jpg";
    const formData = new FormData();

    if (Platform.OS === "web") {
      // On web: fetch the blob URI (contains the cropped version when allowsEditing=true)
      try {
        const blobResp = await fetch(asset.uri);
        const rawBlob = await blobResp.blob();
        // Ensure a valid MIME type — blob.type may be empty on some browsers
        const mimeType =
          rawBlob.type && rawBlob.type !== "application/octet-stream"
            ? rawBlob.type
            : asset.mimeType ?? "image/jpeg";
        const finalExt = mimeType.split("/")[1] ?? "jpg";
        const finalBlob =
          rawBlob.type && rawBlob.type !== "application/octet-stream"
            ? rawBlob
            : new Blob([await rawBlob.arrayBuffer()], { type: mimeType });
        formData.append("avatar", finalBlob, `avatar.${finalExt}`);
      } catch {
        Alert.alert("Erro", "Não foi possível ler a imagem seleccionada.");
        return;
      }
    } else {
      // Native: React Native multipart file descriptor (passed through RN XHR)
      formData.append("avatar", {
        uri: asset.uri,
        type: asset.mimeType ?? "image/jpeg",
        name: `avatar.${ext}`,
      } as unknown as Blob);
    }

    setUploadingAvatar(true);
    try {
      await userService.updateAvatar(formData);
      await refreshUser();
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.avatar?.[0] ??
        err?.response?.data?.message ??
        "Não foi possível actualizar a foto de perfil.";
      Alert.alert("Erro", msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = (user?.display_name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Economia com História" showBackButton={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity */}
        <View style={styles.userIdentity}>
          <TouchableOpacity style={styles.photoContainer} onPress={() => void handleEditAvatar()} activeOpacity={0.85}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar
                ? <ActivityIndicator size="small" color="white" />
                : <Feather name="camera" size={14} color="white" />
              }
            </View>
          </TouchableOpacity>

          <View style={styles.userDetailsWrap}>
            <Text style={styles.userName}>{user?.display_name ?? "Utilizador"}</Text>
            {user?.institution && (
              <Text style={styles.userOccupation}>{user.institution}</Text>
            )}
            {user?.province && (
              <Text style={styles.userProvince}>{user.province}</Text>
            )}
            <View style={styles.badgeContainer}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>{user?.role ?? "estudante"}</Text>
              </View>
              {rankEntry && (
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>Nível {rankEntry.current_level}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={appTheme.colors.primary} style={{ marginBottom: 32 }} />
        ) : (
          <View style={styles.bentoGrid}>
            {/* Total Points */}
            {(rankEntry || level) && (
              <View style={[styles.bentoCard, styles.scoreCard]}>
                <Text style={styles.bentoCardLabel}>PONTUAÇÃO TOTAL</Text>
                <Text style={styles.scoreValue}>{(rankEntry?.total_points ?? level?.total_points ?? 0).toLocaleString()}</Text>
                {rankEntry && rankEntry.weekly_points > 0 && (
                  <Text style={styles.scoreMeta}>+{rankEntry.weekly_points} esta semana</Text>
                )}
              </View>
            )}

            {/* Quizzes Completed */}
            <LinearGradient
              colors={[appTheme.colors.primary, appTheme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bentoCard, styles.quizCard]}
            >
              <Text style={[styles.bentoCardLabel, styles.textWhite]}>QUIZZES CONCLUÍDOS</Text>
              <Text style={[styles.quizValue, styles.textWhite]}>{quizzesCompleted}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((quizzesCompleted / 50) * 100, 100)}%` }]} />
              </View>
            </LinearGradient>

            {/* Global Ranking */}
            {rankEntry && (
              <View style={[styles.bentoCard, styles.rankCard]}>
                <Text style={styles.bentoCardLabel}>POSIÇÃO GLOBAL</Text>
                <Text style={styles.rankValue}>#{rankEntry.rank_position}</Text>
                {rankEntry.prev_rank > 0 && rankEntry.prev_rank !== rankEntry.rank_position && (
                  <Text style={styles.rankMeta}>
                    {rankEntry.rank_position < rankEntry.prev_rank ? "▲" : "▼"}{" "}
                    {Math.abs(rankEntry.rank_position - rankEntry.prev_rank)} posições
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Badges section — shown only when available */}
        {badges.length > 0 && (
          <View style={styles.meritsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Méritos e Distinções</Text>
                <SectionAccentLine marginBottom={0} />
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.meritsGrid}>
              {badges.slice(0, 4).map((ub) => (
                <View key={ub.id} style={styles.meritCard}>
                  <View style={styles.meritIconWrap}>
                    <Feather name="award" size={24} color={appTheme.colors.primaryDark} />
                  </View>
                  <Text style={styles.meritLabel}>{ub.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings & Navigation */}
        <View style={styles.settingsPanel}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("PersonalInfo")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="user" size={16} color={appTheme.colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Informação Pessoal</Text>
                <Text style={styles.settingsItemDesc}>Gerir dados da conta e identificação</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={appTheme.colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("Privacy")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="shield" size={16} color={appTheme.colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Privacidade e Segurança</Text>
                <Text style={styles.settingsItemDesc}>Alterar palavra-passe e acessos</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={appTheme.colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("Support")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="help-circle" size={16} color={appTheme.colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Suporte e Ajuda</Text>
                <Text style={styles.settingsItemDesc}>Contactar a equipa editorial</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={appTheme.colors.border} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutItem} onPress={() => void signOut()}>
            <Feather name="log-out" size={18} color={appTheme.colors.danger} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  userIdentity: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40,
    gap: 24,
  },
  photoContainer: {
    position: "relative",
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(107, 1, 25, 0.1)",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: appTheme.radius.lg,
    borderWidth: 4,
    borderColor: "rgba(107, 1, 25, 0.1)",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: appTheme.colors.background,
  },
  avatarInitials: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 40,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  userDetailsWrap: {
    alignItems: "center",
    gap: 4,
  },
  userName: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    textAlign: "center",
    lineHeight: 32,
  },
  userOccupation: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
  },
  userProvince: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    color: appTheme.colors.textMuted,
    textAlign: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  pillBadge: {
    backgroundColor: appTheme.colors.userAvatarBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appTheme.radius.pill,
  },
  pillBadgeText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 40,
  },
  bentoCard: {
    borderRadius: appTheme.radius.md,
    padding: 20,
    ...appTheme.shadow.sm,
  },
  bentoCardLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
    color: appTheme.colors.textSecondary,
  },
  scoreCard: { backgroundColor: appTheme.colors.badgeLightBg },
  scoreValue: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 32,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -1.2,
  },
  scoreMeta: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    marginTop: 4,
  },
  quizCard: {},
  quizValue: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: appTheme.colors.surface,
  },
  rankCard: { backgroundColor: appTheme.colors.badgeLightBg },
  rankValue: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 32,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -1.2,
  },
  rankMeta: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    marginTop: 4,
  },
  textWhite: { color: appTheme.colors.surface },
  meritsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primaryDark,
  },
  meritsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  meritCard: {
    backgroundColor: appTheme.colors.surface,
    flex: 1,
    minWidth: "45%",
    borderRadius: appTheme.radius.md,
    padding: appTheme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  meritIconWrap: {
    width: 56,
    height: 56,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.userAvatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  meritLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 13,
  },
  settingsPanel: {
    backgroundColor: appTheme.colors.badgeLightBg,
    borderRadius: appTheme.radius.md,
    padding: 8,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: appTheme.spacing.md,
    borderRadius: appTheme.radius.sm,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  settingsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: appTheme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsItemTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 2,
  },
  settingsItemDesc: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 11,
    color: appTheme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: appTheme.colors.border,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutIcon: { marginRight: 16 },
  logoutText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.danger,
  },
});
