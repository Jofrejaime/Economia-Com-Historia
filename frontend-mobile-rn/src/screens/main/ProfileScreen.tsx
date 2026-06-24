import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { HeaderBar } from "../../components/HeaderBar";
import { appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  // Fallback profile details matching the web mockup
  const userDetails = {
    name: user?.name || "José da Assunção A. Ndele",
    occupation: "Economista e Político Angolano",
    level: "Nível Académico V",
    membership: "Membro Titular",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    totalPoints: "14.850",
    monthlyDiff: "+12% este mês",
    quizzesCompleted: 42,
    quizzesProgress: 84, // 84%
    globalRank: "#12",
    rankPercentile: "Top 5% de Historiadores",
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Economia com História" showBackButton={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Section */}
        <View style={styles.userIdentity}>
          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <Image source={{ uri: userDetails.photo }} style={styles.profilePhoto} />
            <View style={styles.badgeIconOverlay}>
              <View style={styles.badgeIconInner}>
                <Feather name="check" size={12} color="white" />
              </View>
            </View>
          </View>

          {/* Name & Details */}
          <View style={styles.userDetailsWrap}>
            <Text style={styles.userName}>{userDetails.name}</Text>
            <Text style={styles.userOccupation}>{userDetails.occupation}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>{userDetails.level}</Text>
              </View>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>{userDetails.membership}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Academic Statistics - Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Total Score Card */}
          <View style={[styles.bentoCard, styles.scoreCard]}>
            <Text style={styles.bentoCardLabel}>PONTUAÇÃO TOTAL</Text>
            <Text style={styles.scoreValue}>{userDetails.totalPoints}</Text>
            <Text style={styles.scoreMeta}>{userDetails.monthlyDiff}</Text>
          </View>

          {/* Quizzes Completed Card */}
          <View style={[styles.bentoCard, styles.quizCard]}>
            <Text style={[styles.bentoCardLabel, styles.textWhite]}>QUIZZES CONCLUÍDOS</Text>
            <Text style={[styles.quizValue, styles.textWhite]}>{userDetails.quizzesCompleted}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${userDetails.quizzesProgress}%` }]} />
            </View>
          </View>

          {/* Global Ranking Card */}
          <View style={[styles.bentoCard, styles.rankCard]}>
            <Text style={styles.bentoCardLabel}>POSIÇÃO GLOBAL</Text>
            <Text style={styles.rankValue}>{userDetails.globalRank}</Text>
            <Text style={styles.rankMeta}>{userDetails.rankPercentile}</Text>
          </View>
        </View>

        {/* Merits & Certificates Section */}
        <View style={styles.meritsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Méritos e Distinções</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.meritsGrid}>
            {/* Badge 1 */}
            <View style={styles.meritCard}>
              <View style={styles.meritIconWrap}>
                <Feather name="archive" size={24} color="#6B0119" />
              </View>
              <Text style={styles.meritLabel}>ARQUIVISTA{"\n"}IMPERIAL</Text>
            </View>

            {/* Badge 2 */}
            <View style={styles.meritCard}>
              <View style={styles.meritIconWrap}>
                <Feather name="book-open" size={24} color="#6B0119" />
              </View>
              <Text style={styles.meritLabel}>CRÓNICAS DO{"\n"}KWANZA</Text>
            </View>

            {/* Badge 3 */}
            <View style={styles.meritCard}>
              <View style={styles.meritIconWrap}>
                <Feather name="award" size={24} color="#6B0119" />
              </View>
              <Text style={styles.meritLabel}>DIAMANTE{"\n"}ANGOLANO</Text>
            </View>

            {/* Badge 4 - Locked */}
            <View style={styles.meritCard}>
              <View style={[styles.meritIconWrap, styles.meritIconWrapLocked]}>
                <Feather name="lock" size={24} color="#574142" />
              </View>
              <Text style={[styles.meritLabel, styles.textMuted]}>PH.D HONORÁRIO</Text>
            </View>
          </View>
        </View>

        {/* Settings & Navigation */}
        <View style={styles.settingsPanel}>
          {/* Personal Info */}
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

          {/* Notifications */}
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

          {/* Notification Preferences */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate("NotificationPreferences")}
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <Feather name="settings" size={16} color="#6B0119" />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Preferências de Notificação</Text>
                <Text style={styles.settingsItemDesc}>Configurar alertas de novos conteúdos e desafios</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#DEBFBF" />
          </TouchableOpacity>

          {/* Privacy & Security */}
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

          {/* Support */}
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

          {/* Logout */}
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
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D",
    letterSpacing: -0.4,
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
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "rgba(107, 1, 25, 0.1)",
  },
  badgeIconOverlay: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#6B0119",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeIconInner: {
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 15,
    color: "#574142",
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  scoreCard: {
    backgroundColor: "#EFF4FF",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121C2A",
    letterSpacing: -1.2,
  },
  scoreMeta: {
    fontSize: 13,
    color: "#574142",
    marginTop: 4,
  },
  quizCard: {
    backgroundColor: "#8B1E2D",
  },
  quizValue: {
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
  rankCard: {
    backgroundColor: "#EFF4FF",
  },
  rankValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121C2A",
    letterSpacing: -1.2,
  },
  rankMeta: {
    fontSize: 13,
    color: "#574142",
    marginTop: 4,
  },
  textWhite: {
    color: "white",
  },
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
  meritIconWrapLocked: {
    opacity: 0.5,
  },
  meritLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#121C2A",
    textAlign: "center",
    lineHeight: 13,
  },
  textMuted: {
    color: "#574142",
    opacity: 0.6,
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
    fontSize: 14,
    fontWeight: "700",
    color: "#121C2A",
    marginBottom: 2,
  },
  settingsItemDesc: {
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
  logoutIcon: {
    marginRight: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#BA1A1A",
  },
});
