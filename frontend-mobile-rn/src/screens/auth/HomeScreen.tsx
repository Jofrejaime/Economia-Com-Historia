import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { appTheme } from '../../constants/theme';

interface HomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onViewJindungo?: () => void;
  onViewArticle?: () => void;
  onViewPodcast?: () => void;
  onViewCommunity?: () => void;
  onViewContent?: () => void;
  onViewQuiz?: () => void;
}

export function HomeScreen({
  onLogin,
  onRegister,
  onViewJindungo,
  onViewArticle,
  onViewPodcast,
  onViewCommunity,
  onViewContent,
  onViewQuiz,
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <Ionicons name="book-outline" size={24} color="white" />
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

        {/* Featured Content - Jindungo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="flame" size={20} color={appTheme.colors.danger} />
            <Text style={styles.sectionTitle}>EM DESTAQUE</Text>
          </View>

          <TouchableOpacity style={styles.featuredCard} onPress={onViewJindungo} activeOpacity={0.9}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80' }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredTags}>
              <View style={styles.tagIntermédio}>
                <Text style={styles.tagIntermédioText}>Intermédio</Text>
              </View>
              <View style={styles.tagJindungo}>
                <Feather name="flame" size={12} color="#fff" />
                <Text style={styles.tagJindungoText}>JINDUNGO</Text>
              </View>
            </View>
            <View style={styles.featuredBottom}>
              <Text style={styles.featuredTitle}>
                A Economia do Petróleo em Angola: Riqueza, Dependência e Perspectivas
              </Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>
                Como a descoberta do petróleo transformou a estrutura económica de Angola e quais os desafios actuais
              </Text>
              <View style={styles.featuredFooter}>
                <View style={styles.featuredMeta}>
                  <Text style={styles.metaText}>📖 12 min de leitura</Text>
                  <Text style={styles.metaText}>🎥 1 vídeo</Text>
                </View>
                <TouchableOpacity style={styles.readButton} onPress={onViewJindungo}>
                  <Text style={styles.readButtonText}>Ler</Text>
                  <Feather name="arrow-right" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Content */}
        <View style={styles.section}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Conteúdos Recentes</Text>
            <TouchableOpacity onPress={onViewContent}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.contentCard} onPress={onViewArticle}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80' }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTagIntro}>
                <Text style={styles.cardTagIntroText}>Introdução</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                Independência e Reconstrução Económica (1975–1985)
              </Text>
              <Text style={styles.cardMeta}>8 min de leitura</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contentCard} onPress={onViewPodcast}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80' }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTagIntermédio}>
                <Text style={styles.cardTagIntermédioText}>Intermédio</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                Kwanza: História e Desafios da Moeda Nacional
              </Text>
              <Text style={styles.cardMeta}>14 min · áudio disponível</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Debates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="message-circle" size={20} color={appTheme.colors.primary} />
            <Text style={styles.smallSectionTitle}>DEBATES ACTIVOS</Text>
          </View>

          <View style={styles.debateItem}>
            <View style={[styles.debateBorder, styles.debateActiveBorder]} />
            <View style={styles.debateContent}>
              <Text style={styles.debateTitle}>O petróleo foi uma bênção ou uma maldição para Angola?</Text>
              <Text style={styles.debateMeta}>💬 47 respostas • Activo há 2h</Text>
            </View>
          </View>

          <View style={styles.debateItem}>
            <View style={[styles.debateBorder, styles.debateInactiveBorder]} />
            <View style={styles.debateContent}>
              <Text style={styles.debateTitle}>Kwanza e inflação: podemos aprender com o passado?</Text>
              <Text style={styles.debateMeta}>💬 11 respostas • Activo há 1 dia</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.debateButton} onPress={onViewCommunity}>
            <Text style={styles.debateButtonText}>Ver todos os debates</Text>
          </TouchableOpacity>
        </View>

        {/* Ranking */}
        <View style={styles.section}>
          <Text style={styles.rankingTitle}>Ranking</Text>

          {/* #1 */}
          <View style={styles.rankCardFirst}>
            <View style={styles.rankLeft}>
              <View style={styles.rankNumberFirst}>
                <Text style={styles.rankNumberTextFirst}>#1</Text>
              </View>
              <View style={styles.avatarFirst}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankNameFirst}>Ana Domingos</Text>
                <Text style={styles.rankTitleFirst}>Estudante de Economia</Text>
              </View>
            </View>
            <View style={styles.rankPointsFirst}>
              <Text style={styles.rankPointsValueFirst}>980</Text>
              <Text style={styles.rankPointsLabelFirst}>pontos</Text>
            </View>
          </View>

          {/* #2 */}
          <View style={styles.rankCard}>
            <View style={styles.rankLeft}>
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>#2</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>CN</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>Carlos Neto</Text>
                <Text style={styles.rankTitle}>Professor</Text>
              </View>
            </View>
            <View style={styles.rankPoints}>
              <Text style={styles.rankPointsValue}>870</Text>
              <Text style={styles.rankPointsLabel}>pontos</Text>
            </View>
          </View>

          {/* #3 */}
          <View style={styles.rankCard}>
            <View style={styles.rankLeft}>
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>#3</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>LF</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>Luís Ferreira</Text>
                <Text style={styles.rankTitle}>Estudante</Text>
              </View>
            </View>
            <View style={styles.rankPoints}>
              <Text style={styles.rankPointsValue}>760</Text>
              <Text style={styles.rankPointsLabel}>pontos</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.rankingButton} onPress={onLogin}>
            <Text style={styles.rankingButtonText}>Ver ranking completo</Text>
            <Feather name="arrow-right" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Pronto para aprender?</Text>
          <Text style={styles.ctaSubtitle}>
            Cria a tua conta e começa a explorar a história económica de Angola
          </Text>
          <TouchableOpacity style={styles.ctaRegisterButton} onPress={onRegister}>
            <Text style={styles.ctaRegisterText}>Criar conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaLoginButton} onPress={onLogin}>
            <Text style={styles.ctaLoginText}>Já tenho conta · Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onViewContent}>
          <Ionicons name="home-outline" size={24} color={appTheme.colors.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Início</Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onViewContent}>
          <Feather name="trending-up" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Conteúdos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onViewCommunity}>
          <Feather name="message-circle" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Comunidade</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onViewQuiz}>
          <Feather name="trophy" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  header: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    lineHeight: 28,
  },
  appSubtitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  headerLead: {
    fontFamily: 'Source_Sans_3',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 11,
    fontWeight: '700',
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  smallSectionTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 11,
    fontWeight: '700',
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  featuredCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.debateHighlightBg,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredTags: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  tagIntermédio: {
    backgroundColor: appTheme.colors.badgeYellowBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagIntermédioText: {
    fontSize: 11,
    fontWeight: '500',
    color: appTheme.colors.badgeYellowText,
  },
  tagJindungo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagJindungoText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  featuredDesc: {
    fontFamily: 'Source_Sans_3',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  readButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 11,
    fontWeight: '700',
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  seeAll: {
    color: appTheme.colors.primary,
    fontSize: 14,
    fontFamily: 'Source_Sans_3',
  },
  contentCard: {
    flexDirection: 'row',
    backgroundColor: appTheme.colors.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTagIntro: {
    backgroundColor: appTheme.colors.badgeLightBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 6,
  },
  cardTagIntroText: {
    fontSize: 11,
    fontWeight: '500',
    color: appTheme.colors.badgeLightText,
  },
  cardTagIntermédio: {
    backgroundColor: appTheme.colors.badgeYellowBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 6,
  },
  cardTagIntermédioText: {
    fontSize: 11,
    fontWeight: '500',
    color: appTheme.colors.badgeYellowText,
  },
  cardTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  debateItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  debateBorder: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  debateActiveBorder: {
    backgroundColor: appTheme.colors.primary,
  },
  debateInactiveBorder: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  debateContent: {
    flex: 1,
  },
  debateTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 15,
    fontWeight: '600',
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
  },
  debateMeta: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  debateButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  debateButtonText: {
    color: appTheme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  rankingTitle: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 28,
    fontWeight: '700',
    color: appTheme.colors.textPrimary,
    marginBottom: 24,
  },
  rankCardFirst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appTheme.colors.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNumberFirst: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberTextFirst: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  avatarFirst: {
    width: 56,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  rankInfo: {
    flex: 1,
  },
  rankNameFirst: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
  },
  rankTitleFirst: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  rankPointsFirst: {
    alignItems: 'flex-end',
  },
  rankPointsValueFirst: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  rankPointsLabelFirst: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  rankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: appTheme.colors.textMuted,
  },
  rankNumber: {
    width: 48,
    height: 48,
    backgroundColor: appTheme.colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.rankingCardGray,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: appTheme.colors.userAvatarBg,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.primary,
  },
  rankName: {
    fontWeight: '700',
    fontSize: 16,
    color: appTheme.colors.textPrimary,
  },
  rankTitle: {
    fontSize: 13,
    color: appTheme.colors.rankingCardGray,
  },
  rankPoints: {
    alignItems: 'flex-end',
  },
  rankPointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: appTheme.colors.textSecondary,
  },
  rankPointsLabel: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: appTheme.colors.background,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  rankingButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: appTheme.colors.textSecondary,
  },
  ctaContainer: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaRegisterButton: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  ctaRegisterText: {
    color: appTheme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  ctaLoginButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 16,
    borderRadius: 10,
  },
  ctaLoginText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  navLabelActive: {
    color: appTheme.colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: appTheme.colors.primary,
    marginTop: 2,
  },
});