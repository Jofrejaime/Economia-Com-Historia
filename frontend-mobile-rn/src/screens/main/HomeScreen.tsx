import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
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
          <Text style={styles.headerLead}>Aprende a história económica do teu país com conteúdo académico sério e acessível</Text>
        </View>

        {/* Featured Card (Jindungo) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Em Destaque</Text>
          <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80' }}
              style={styles.featuredImage}
              imageStyle={{ borderRadius: 14 }}
            >
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredBody}>
                <Text style={styles.featuredTag}>JINDUNGO</Text>
                <Text style={styles.featuredTitle}>A Economia do Petróleo em Angola: Riqueza, Dependência e Perspectivas</Text>
                <TouchableOpacity style={styles.featuredButton} onPress={() => navigation.navigate('Content', { category: 'jindungo' })}>
                  <Text style={styles.featuredButtonText}>Explorar mais Jindungo</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Recent content list (simplified) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleSmall}>Conteúdos Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Content')}>
              <Text style={styles.linkText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Content')}>
            <View style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTag}>Introdução</Text>
              <Text style={styles.cardTitle}>Independência e Reconstrução Económica (1975–1985)</Text>
              <Text style={styles.cardMeta}>8 min de leitura</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Content')}>
            <View style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTag}>Intermédio</Text>
              <Text style={styles.cardTitle}>Kwanza: História e Desafios da Moeda Nacional</Text>
              <Text style={styles.cardMeta}>14 min · áudio disponível</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Explore by Format Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Explorar por Formato</Text>
          
          <TouchableOpacity 
            style={styles.formatCard} 
            onPress={() => navigation.navigate('Content', { category: 'jindungo' })}
          >
            <View style={[styles.formatIcon, { backgroundColor: '#FF6B6B' }]}>
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
            onPress={() => navigation.navigate('Content', { category: 'micro' })}
          >
            <View style={[styles.formatIcon, { backgroundColor: '#FFD93D' }]}>
              <Ionicons name="flash" size={24} color="white" />
            </View>
            <View style={styles.formatBody}>
              <Text style={styles.formatTitle}>Micro Textos</Text>
              <Text style={styles.formatDesc}>Leitura rápida</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.formatCard} 
            onPress={() => navigation.navigate('Content', { category: 'podcast' })}
          >
            <View style={[styles.formatIcon, { backgroundColor: '#6BCB77' }]}>
              <Ionicons name="headset" size={24} color="white" />
            </View>
            <View style={styles.formatBody}>
              <Text style={styles.formatTitle}>Podcasts</Text>
              <Text style={styles.formatDesc}>Aprende ouvindo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.formatCard} 
            onPress={() => navigation.navigate('Content', { category: 'video' })}
          >
            <View style={[styles.formatIcon, { backgroundColor: '#4D96FF' }]}>
              <Ionicons name="videocam" size={24} color="white" />
            </View>
            <View style={styles.formatBody}>
              <Text style={styles.formatTitle}>Vídeos</Text>
              <Text style={styles.formatDesc}>Conteúdo em vídeo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.formatCard} 
            onPress={() => navigation.navigate('Content', { category: 'series' })}
          >
            <View style={[styles.formatIcon, { backgroundColor: '#A78BFA' }]}>
              <Ionicons name="book" size={24} color="white" />
            </View>
            <View style={styles.formatBody}>
              <Text style={styles.formatTitle}>Séries</Text>
              <Text style={styles.formatDesc}>Conteúdo em série</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={appTheme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 48,
  },
  header: {
    backgroundColor: appTheme.colors.primary,
    padding: 20,
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
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  headerLead: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 180,
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  featuredBody: {
    padding: 14,
  },
  featuredTag: {
    color: appTheme.colors.surface,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredTitle: {
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuredButton: {
    alignSelf: 'flex-end',
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  featuredButtonText: {
    color: appTheme.colors.primary,
    fontWeight: '700',
  },
  sectionTitleSmall: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 10,
    backgroundColor: appTheme.colors.border,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTag: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  cardTitle: {
    color: appTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  cardMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  formatBody: {
    flex: 1,
  },
  formatTitle: {
    color: appTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  formatDesc: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  }
});
