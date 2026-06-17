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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

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
        initialCategory: "História Monetária",
      });
    } else {
      navigation.navigate("LoginPrompt", { type: "create-topic" });
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#8B1E2D" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Feather name="arrow-left" size={20} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>A REPRODUZIR</Text>
          <Text style={styles.headerTitle}>Economia com História</Text>
        </View>

        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="more-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

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
            <Ionicons name="mic-outline" size={14} color="rgba(255,255,255,0.8)" />
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
            <Feather name="shuffle" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <View style={styles.playCenterRow}>
            <TouchableOpacity style={styles.skipBtn}>
              <Ionicons name="play-back" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playBtn}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color={appTheme.colors.primary}
                style={!isPlaying && { marginLeft: 3 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn}>
              <Ionicons name="play-forward" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.controlIconBtn}>
            <Feather name="volume-2" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControlsContainer}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.speedText}>1.25x</Text>
            <Text style={styles.secondaryBtnLabel}>Velocidade</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowTranscript(!showTranscript)}>
            <Feather name="file-text" size={16} color="white" />
            <Text style={styles.secondaryBtnLabel}>Transcrição</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Feather name="wifi" size={16} color="white" />
            <Text style={styles.secondaryBtnLabel}>Dispositivos</Text>
          </TouchableOpacity>
        </View>

        {/* Transcript Section */}
        {showTranscript && (
          <View style={styles.transcriptCard}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptLabel}>Transcrição em Tempo Real</Text>
              <TouchableOpacity onPress={() => setShowTranscript(false)}>
                <Feather name="x" size={14} color="white" />
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

        {/* Action Buttons - Quiz and Forum */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.activitiesLabel}>Atividades</Text>
          <View style={styles.activitiesRow}>
            <TouchableOpacity
              onPress={handleStartQuiz}
              style={styles.activityButton}
            >
              <Text style={styles.activityButtonText}>Realizar Quiz</Text>
              <Ionicons name="trophy" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDebate}
              style={styles.activityButton}
            >
              <Text style={styles.activityButtonText}>Debater no Fórum</Text>
              <Ionicons name="people" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: appTheme.colors.primaryDark || "#6D1522",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
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
    backgroundColor: "black",
    borderRadius: 14,
    opacity: 0.3,
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
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 8,
  },
  narratorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.8,
  },
  trackNarrator: {
    fontSize: 14,
    color: "white",
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "white",
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
    backgroundColor: "white",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  secondaryBtn: {
    alignItems: "center",
    gap: 4,
  },
  speedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },
  secondaryBtnLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  transcriptCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  transcriptBody: {
    gap: 12,
  },
  transcriptActiveText: {
    fontSize: 17,
    color: "white",
    lineHeight: 24,
  },
  highlightText: {
    color: "#ff9da0",
  },
  transcriptInactiveText: {
    fontSize: 17,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 24,
  },
  activitiesContainer: {
    marginHorizontal: 24,
  },
  activitiesLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
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
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activityButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});