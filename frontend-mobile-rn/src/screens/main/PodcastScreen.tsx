import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { HeaderBar } from "../../components/HeaderBar";

export function PodcastScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);

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
        initialTitle: "Kwanza: História e Desafios da Moeda Nacional",
      });
    } else {
      navigation.navigate("LoginPrompt", { type: "create-topic" });
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Podcast" />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <View style={styles.artworkShadow} />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80" }}
            style={styles.artworkImage}
          />
        </View>

        {/* Track Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.trackTitle}>
            Kwanza: História e Desafios da Moeda Nacional
          </Text>
          <View style={styles.narratorRow}>
            <Ionicons name="mic-outline" size={14} color={appTheme.colors.textSecondary} />
            <Text style={styles.trackNarrator}>
              Narrado por Prof. Dr. Arnaldo Santos
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={styles.progressFill} />
            <View style={styles.progressThumb} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>12:45</Text>
            <Text style={styles.timeText}>28:10</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlIconBtn}>
            <Feather name="shuffle" size={18} color={appTheme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.playCenterRow}>
            <TouchableOpacity style={styles.skipBtn}>
              <Ionicons name="play-back" size={28} color={appTheme.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playBtn}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color="white"
                style={!isPlaying && { marginLeft: 3 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn}>
              <Ionicons name="play-forward" size={28} color={appTheme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.controlIconBtn}>
            <Feather name="volume-2" size={18} color={appTheme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControlsContainer}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.speedText}>1.25x</Text>
            <Text style={styles.secondaryBtnLabel}>Velocidade</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowTranscript(!showTranscript)}>
            <Feather name="file-text" size={16} color={appTheme.colors.textSecondary} />
            <Text style={styles.secondaryBtnLabel}>Transcrição</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Feather name="wifi" size={16} color={appTheme.colors.textSecondary} />
            <Text style={styles.secondaryBtnLabel}>Dispositivos</Text>
          </TouchableOpacity>
        </View>

        {/* Transcript Section */}
        {showTranscript && (
          <View style={styles.transcriptCard}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptLabel}>Transcrição em Tempo Real</Text>
              <TouchableOpacity onPress={() => setShowTranscript(false)}>
                <Feather name="x" size={14} color={appTheme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.transcriptBody}>
              <Text style={styles.transcriptActiveText}>
                "...a introdução do <Text style={styles.highlightText}>Kwanza</Text> em 1977 não foi apenas uma mudança monetária, mas um símbolo de soberania económica..."
              </Text>
              <Text style={styles.transcriptInactiveText}>
                Neste capítulo, analisamos como as flutuações cambiais impactaram o mercado de Luanda durante a década de 90...
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.activitiesLabel}>Atividades</Text>
          <View style={styles.activitiesRow}>
            <TouchableOpacity onPress={handleStartQuiz} style={styles.activityButton}>
              <Text style={styles.activityButtonText}>Realizar Quiz</Text>
              <Ionicons name="trophy" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDebate} style={[styles.activityButton, styles.activityButtonSecondary]}>
              <Text style={styles.activityButtonText}>Debater na Comunidade</Text>
              <Ionicons name="people" size={18} color="white" />
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  artworkContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  artworkShadow: {
    position: "absolute",
    bottom: -16,
    width: "80%",
    height: 40,
    backgroundColor: appTheme.colors.jindungoCardBg,
    borderRadius: 14,
    opacity: 0.15,
  },
  artworkImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  trackTitle: {
    fontFamily: appTheme.fontFamily.heading,
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 28,
    letterSpacing: -0.44,
    marginBottom: 8,
  },
  narratorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackNarrator: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: appTheme.colors.border,
    borderRadius: 2,
    position: "relative",
    marginBottom: 8,
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "42%",
    backgroundColor: appTheme.colors.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    left: "42%",
    top: -4,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: appTheme.colors.primary,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 11,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  controlIconBtn: {
    padding: 8,
  },
  playCenterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  skipBtn: {
    padding: 8,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...appTheme.shadow.md,
  },
  secondaryControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    paddingTop: 16,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  secondaryBtn: {
    alignItems: "center",
    gap: 4,
  },
  speedText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
  },
  secondaryBtnLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  transcriptCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.sm,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 32,
    ...appTheme.shadow.sm,
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transcriptLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  transcriptBody: {
    gap: 12,
  },
  transcriptActiveText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 17,
    color: appTheme.colors.textPrimary,
    lineHeight: 26,
  },
  highlightText: {
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  transcriptInactiveText: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 17,
    color: appTheme.colors.textMuted,
    lineHeight: 26,
  },
  activitiesContainer: {
    marginHorizontal: 24,
  },
  activitiesLabel: {
    fontFamily: appTheme.fontFamily.body,
    fontSize: 11,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  activitiesRow: {
    gap: 12,
  },
  activityButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activityButtonSecondary: {
    backgroundColor: appTheme.colors.textPrimary,
  },
  activityButtonText: {
    fontFamily: appTheme.fontFamily.body,
    color: appTheme.colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
});
