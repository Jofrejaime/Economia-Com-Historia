import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

export function ArticleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { type } = route.params as { type: "jindungo" | "micro" };
  const { user } = useAuth();

  const [liked, setLiked] = useState<boolean | null>(null);

  const isJindungo = type === "jindungo";

  const handleStartQuiz = () => {
    if (user) {
      navigation.navigate("Quiz");
    } else {
      navigation.navigate("LoginPrompt", { type: "quiz" });
    }
  };

  const handleDebate = () => {
    if (user) {
      navigation.navigate("CreateTopic", {
        initialTitle: isJindungo
          ? "A Riqueza do Subsolo Angolano: Do Café ao Crude"
          : "O que foi o Acordo de Bicesse?",
        initialCategory: isJindungo ? "Petróleo e Reforma" : "História Monetária",
      });
    } else {
      navigation.navigate("LoginPrompt", { type: "create-topic" });
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={appTheme.colors.primary} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.appTitle}>Economia com História</Text>

          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-vertical" size={20} color={appTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="bookmark" size={16} color={appTheme.colors.textSecondary} />
            <Text style={styles.actionBtnText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="share-2" size={16} color={appTheme.colors.textSecondary} />
            <Text style={styles.actionBtnText}>Partilhar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Badge */}
        <View style={styles.badgeContainer}>
          {isJindungo ? (
            <View style={styles.badgeJindungo}>
              <Ionicons name="flame" size={12} color="white" />
              <Text style={styles.badgeText}>JINDUNGO</Text>
            </View>
          ) : (
            <View style={styles.badgeMicro}>
              <Ionicons name="flash" size={12} color="white" />
              <Text style={styles.badgeText}>MICRO TEXTO</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.articleTitle}>
          {isJindungo
            ? "A Riqueza do Subsolo Angolano: Do Café ao Crude"
            : "O que foi o Acordo de Bicesse?"}
        </Text>

        {/* Author Info */}
        <View style={styles.authorRow}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80",
            }}
            style={styles.authorImage}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {isJindungo ? "Dr. Carlos Neto" : "Luís Ferreira"}
            </Text>
            <Text style={styles.authorMeta}>
              {isJindungo ? "18 min de leitura" : "3 min de leitura"} • Há 3 dias
            </Text>
          </View>
        </View>

        {/* Featured Image */}
        <Image
          source={{
            uri: isJindungo
              ? "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80"
              : "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
          }}
          style={styles.featuredImage}
        />

        {/* Article Body */}
        <View style={styles.articleBody}>
          {isJindungo ? (
            <>
              <Text style={styles.paragraph}>
                A história do subsolo angolano é tão rica quanto controversa. Desde os tempos coloniais até aos dias de hoje, os recursos naturais moldaram profundamente a economia e a sociedade angolanas.
              </Text>
              <Text style={styles.paragraph}>
                Esta narrativa de transformação, da economia cafeeira à dependência petrolífera, levanta questões fundamentais sobre o desenvolvimento económico sustentável.
              </Text>

              <Text style={styles.heading2}>O Café: O Primeiro Ouro Negro</Text>
              <Text style={styles.paragraph}>
                Durante décadas, o café angolano era considerado um dos melhores do mundo. A economia colonial dependia fortemente desta exportação, que empregava milhares de trabalhadores nas regiões montanhosas.
              </Text>
              <Text style={styles.paragraph}>
                Com a independência em 1975, a produção cafeeira enfrentou desafios sem precedentes, incluindo a guerra civil e a falta de investimento.
              </Text>

              {/* Academic Note */}
              <View style={styles.academicNote}>
                <Text style={styles.academicNoteTitle}>
                  Nota Académica: A Relação Café-Petróleo
                </Text>
                <Text style={styles.academicNoteDesc}>
                  A transição de uma economia agrícola (café) para uma economia extractiva (petróleo) representa um caso clássico da "maldição dos recursos naturais".
                </Text>
                <Text style={styles.academicNoteSub}>
                  Economistas argumentam que a dependência excessiva de um único recurso pode prejudicar o desenvolvimento de outros sectores produtivos.
                </Text>
              </View>

              {/* Vocabulary Section */}
              <View style={styles.vocabularyCard}>
                <Text style={styles.vocabularyLabel}>VOCABULÁRIO</Text>
                <View style={styles.vocabularyItem}>
                  <Text style={styles.vocabularyTerm}>Crude (Petróleo Bruto)</Text>
                  <Text style={styles.vocabularyDef}>
                    Petróleo não refinado, tal como é extraído do subsolo
                  </Text>
                </View>
                <View style={styles.vocabularyItem}>
                  <Text style={styles.vocabularyTerm}>Economia Extractiva</Text>
                  <Text style={styles.vocabularyDef}>
                    Sistema económico baseado na extração de recursos naturais
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.paragraph}>
                O Acordo de Bicesse foi um tratado de paz assinado em 31 de maio de 1991, em Estoril, Portugal, entre o governo angolano (MPLA) e a UNITA.
              </Text>
              <Text style={styles.paragraph}>
                Este acordo pôs fim a 16 anos de guerra civil e estabeleceu as bases para as primeiras eleições multipartidárias em Angola.
              </Text>
              <Text style={styles.paragraph}>
                Apesar das expectativas, o acordo falhou quando a UNITA rejeitou os resultados eleitorais de 1992, levando à retoma do conflito armado.
              </Text>
            </>
          )}
        </View>

        {/* Action Buttons - Quiz and Forum */}
        <View style={styles.sectionDivider} />
        <View style={styles.actionsBlock}>
          <Text style={styles.sectionHeader}>ATIVIDADES</Text>
          <TouchableOpacity onPress={handleStartQuiz} style={styles.quizBtn}>
            <Text style={styles.actionBtnLabel}>Realizar Quiz</Text>
            <Ionicons name="trophy-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDebate} style={styles.forumBtn}>
            <Text style={styles.actionBtnLabel}>Debater no Fórum</Text>
            <Ionicons name="people-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View style={styles.sectionDivider} />
        <View style={styles.feedbackBlock}>
          <Text style={styles.feedbackTitle}>Gostaste deste conteúdo?</Text>
          <View style={styles.feedbackButtonsRow}>
            <TouchableOpacity
              onPress={() => setLiked(true)}
              style={[
                styles.feedbackBtn,
                liked === true && styles.feedbackBtnLikeActive,
              ]}
            >
              <Feather
                name="thumbs-up"
                size={18}
                color={liked === true ? "white" : appTheme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.feedbackBtnText,
                  liked === true && styles.feedbackBtnTextActive,
                ]}
              >
                Sim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLiked(false)}
              style={[
                styles.feedbackBtn,
                liked === false && styles.feedbackBtnDislikeActive,
              ]}
            >
              <Feather
                name="thumbs-down"
                size={18}
                color={liked === false ? "white" : appTheme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.feedbackBtnText,
                  liked === false && styles.feedbackBtnTextActive,
                ]}
              >
                Não
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Articles */}
        <View style={styles.sectionDivider} />
        <View style={styles.relatedBlock}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Artigos Relacionados</Text>
            <TouchableOpacity>
              <View style={styles.seeAllRow}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Feather name="chevron-right" size={16} color={appTheme.colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.relatedList}>
            <TouchableOpacity style={styles.relatedCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80",
                }}
                style={styles.relatedCardImage}
              />
              <View style={styles.relatedCardBody}>
                <Text style={styles.relatedCardTitle} numberOfLines={2}>
                  Independência e Reconstrução Económica (1975–1985)
                </Text>
                <Text style={styles.relatedCardMeta}>8 min de leitura</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relatedCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&q=80",
                }}
                style={styles.relatedCardImage}
              />
              <View style={styles.relatedCardBody}>
                <Text style={styles.relatedCardTitle} numberOfLines={2}>
                  Kwanza: História e Desafios da Moeda Nacional
                </Text>
                <Text style={styles.relatedCardMeta}>14 min · áudio disponível</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Button */}
        <View style={styles.sectionDivider} />
        <View style={styles.commentsBlock}>
          <View style={styles.commentsHeader}>
            <Feather name="message-circle" size={20} color={appTheme.colors.primary} />
            <Text style={styles.commentsTitle}>Comentários (12)</Text>
          </View>
          <TouchableOpacity style={styles.commentsBtn}>
            <Text style={styles.commentsBtnText}>Ver comentários</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButtonText: {
    color: appTheme.colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    fontFamily: "IBM_Plex_Sans",
  },
  moreButton: {
    padding: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 48,
  },
  badgeContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 16,
  },
  badgeJindungo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeMicro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  articleTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 26,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  authorImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  authorMeta: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  featuredImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    marginBottom: 24,
  },
  articleBody: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    color: appTheme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  heading2: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginTop: 12,
    marginBottom: 12,
  },
  academicNote: {
    backgroundColor: "#FDF3F4",
    borderLeftWidth: 4,
    borderLeftColor: appTheme.colors.primary,
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  academicNoteTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 8,
  },
  academicNoteDesc: {
    fontSize: 14,
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  academicNoteSub: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 20,
  },
  vocabularyCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  vocabularyLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  vocabularyItem: {
    marginBottom: 12,
  },
  vocabularyTerm: {
    fontSize: 15,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    marginBottom: 2,
  },
  vocabularyDef: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: "#F5F5F5",
    width: "100%",
  },
  actionsBlock: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  quizBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  forumBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#047857",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnLabel: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  feedbackBlock: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    fontFamily: "IBM_Plex_Sans",
    marginBottom: 16,
  },
  feedbackButtonsRow: {
    flexDirection: "row",
    gap: 16,
  },
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "white",
  },
  feedbackBtnLikeActive: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  feedbackBtnDislikeActive: {
    backgroundColor: appTheme.colors.danger,
    borderColor: appTheme.colors.danger,
  },
  feedbackBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textSecondary,
  },
  feedbackBtnTextActive: {
    color: "white",
  },
  relatedBlock: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  relatedTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.primary,
  },
  relatedList: {
    gap: 12,
  },
  relatedCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 8,
  },
  relatedCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  relatedCardBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  relatedCardTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
  },
  relatedCardMeta: {
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
  commentsBlock: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  commentsTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  commentsBtn: {
    width: "100%",
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  commentsBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
  },
});