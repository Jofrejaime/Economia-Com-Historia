import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api/userService";
import { leaderboardService } from "../../services/api/leaderboardService";
import type { UserLevel, UserBadge, LeaderboardEntry } from "../../types/api";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  const [level, setLevel] = useState<UserLevel | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [rankEntry, setRankEntry] = useState<LeaderboardEntry | null>(null);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [attemptsRes, leaderboardRes] = await Promise.allSettled([
          userService.quizAttempts({ status: "completed", page: 1 }),
          leaderboardService.national({ per_page: 100 }),
        ]);

        if (attemptsRes.status === "fulfilled") {
          setQuizzesCompleted(attemptsRes.value.meta.total);
        }
        if (leaderboardRes.status === "fulfilled" && user) {
          const entry = leaderboardRes.value.find((e) => e.user_id === user.id) ?? null;
          setRankEntry(entry);
        }
      } catch (error) {
        console.warn("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

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
          <View style={styles.photoContainer}>
            {user?.avatar_url ? (
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            ) : (
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

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
            {rankEntry && (
              <View style={[styles.bentoCard, styles.scoreCard]}>
                <Text style={styles.bentoCardLabel}>PONTUAÇÃO TOTAL</Text>
                <Text style={styles.scoreValue}>{rankEntry.total_points.toLocaleString()}</Text>
                {rankEntry.weekly_points > 0 && (
                  <Text style={styles.scoreMeta}>+{rankEntry.weekly_points} esta semana</Text>
                )}
              </View>
            )}

            {/* Quizzes Completed */}
            <View style={[styles.bentoCard, styles.quizCard]}>
              <Text style={[styles.bentoCardLabel, styles.textWhite]}>QUIZZES CONCLUÍDOS</Text>
              <Text style={[styles.quizValue, styles.textWhite]}>{quizzesCompleted}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((quizzesCompleted / 50) * 100, 100)}%` }]} />
              </View>
            </View>

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
              <Text style={styles.sectionTitle}>Méritos e Distinções</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.meritsGrid}>
              {badges.slice(0, 4).map((ub) => (
                <View key={ub.id} style={styles.meritCard}>
                  <View style={styles.meritIconWrap}>
                    <Feather name="award" size={24} color="#6B0119" />
                  </View>
                  <Text style={styles.meritLabel}>{ub.badge?.name ?? "Badge"}</Text>
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
                <Feather name="user" size={16} color="#6B0119" />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Informação Pessoal</Text>
                <Text style={styles.settingsItemDesc}>Gerir dados da conta e identificação</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#DEBFBF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("Notifications")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="bell" size={16} color="#6B0119" />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Notificações</Text>
                <Text style={styles.settingsItemDesc}>Ver todas as notificações recebidas</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#DEBFBF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("Privacy")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="shield" size={16} color="#6B0119" />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Privacidade e Segurança</Text>
                <Text style={styles.settingsItemDesc}>Alterar palavra-passe e acessos</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#DEBFBF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("Support")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="help-circle" size={16} color="#6B0119" />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Suporte e Ajuda</Text>
                <Text style={styles.settingsItemDesc}>Contactar a equipa editorial</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#DEBFBF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutItem} onPress={() => void signOut()}>
            <Feather name="log-out" size={18} color="#BA1A1A" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8F9FF",
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
    borderRadius: 16,
    backgroundColor: appTheme.colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(107, 1, 25, 0.1)",
  },
  avatarInitials: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 40,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  userDetailsWrap: {
    alignItems: "center",
    gap: 4,
  },
  userName: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 26,
    fontWeight: "700",
    color: "#6B0119",
    textAlign: "center",
    lineHeight: 32,
  },
  userOccupation: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: "#574142",
    textAlign: "center",
  },
  userProvince: {
    fontFamily: "Source_Sans_3",
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
    backgroundColor: "#DEE9FC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pillBadgeText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "700",
    color: "#6B0119",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 40,
  },
  bentoCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bentoCardLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
    color: "#574142",
  },
  scoreCard: { backgroundColor: "#EFF4FF" },
  scoreValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: "#121C2A",
    letterSpacing: -1.2,
  },
  scoreMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: "#574142",
    marginTop: 4,
  },
  quizCard: { backgroundColor: "#8B1E2D" },
  quizValue: {
    fontFamily: "IBM_Plex_Sans",
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
    backgroundColor: "white",
  },
  rankCard: { backgroundColor: "#EFF4FF" },
  rankValue: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 32,
    fontWeight: "700",
    color: "#121C2A",
    letterSpacing: -1.2,
  },
  rankMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: "#574142",
    marginTop: 4,
  },
  textWhite: { color: "white" },
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
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#121C2A",
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "700",
    color: "#6B0119",
  },
  meritsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  meritCard: {
    backgroundColor: "white",
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  meritIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#DEE9FC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  meritLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "700",
    color: "#121C2A",
    textAlign: "center",
    lineHeight: 13,
  },
  settingsPanel: {
    backgroundColor: "#EFF4FF",
    borderRadius: 12,
    padding: 8,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsItemTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: "#121C2A",
    marginBottom: 2,
  },
  settingsItemDesc: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: "#574142",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(222, 191, 191, 0.2)",
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
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    fontWeight: "700",
    color: "#BA1A1A",
  },
});
