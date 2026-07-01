import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { documentService } from "../services/api/documentService";
import { appTheme } from "../constants/theme";

interface Props {
  onPressVideo: () => void;
  onPressAudio: () => void;
}

export function MediaFormatCards({ onPressVideo, onPressAudio }: Props) {
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [audioCount, setAudioCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.allSettled([
      documentService.list({ document_type: "video", per_page: 1 }),
      documentService.list({ document_type: "audio", per_page: 1 }),
    ]).then(([videoRes, audioRes]) => {
      if (videoRes.status === "fulfilled") setVideoCount(videoRes.value.meta.total);
      if (audioRes.status === "fulfilled") setAudioCount(audioRes.value.meta.total);
    });
  }, []);

  const countLabel = (n: number | null) =>
    n === null ? "..." : `${n} ${n === 1 ? "conteúdo" : "conteúdos"}`;

  return (
    <View style={styles.row}>
      {/* Vídeos card */}
      <TouchableOpacity style={[styles.card, styles.cardVideo]} onPress={onPressVideo} activeOpacity={0.85}>
        <Svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={styles.svg}>
          <Circle cx="22" cy="22" r="22" fill="rgba(255,255,255,0.12)" />
          <Path d="M18 14L34 22L18 30V14Z" fill="white" />
        </Svg>
        <Text style={styles.label}>Vídeos</Text>
        <Text style={styles.count}>{countLabel(videoCount)}</Text>
      </TouchableOpacity>

      {/* Áudios card */}
      <TouchableOpacity style={[styles.card, styles.cardAudio]} onPress={onPressAudio} activeOpacity={0.85}>
        <Svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={styles.svg}>
          <Path
            d="M10 26V22C10 15.373 15.373 10 22 10C28.627 10 34 15.373 34 22V26"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Rect x="8" y="24" width="7" height="12" rx="3.5" fill="white" />
          <Rect x="29" y="24" width="7" height="12" rx="3.5" fill="white" />
        </Svg>
        <Text style={styles.label}>Áudios</Text>
        <Text style={styles.count}>{countLabel(audioCount)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: appTheme.radius.md,
    paddingVertical: 20,
    paddingHorizontal: 18,
    minHeight: 130,
  },
  cardVideo: {
    backgroundColor: appTheme.colors.textPrimary,
  },
  cardAudio: {
    backgroundColor: appTheme.colors.primary,
  },
  svg: {
    marginBottom: 14,
  },
  label: {
    fontFamily: "IBM_Plex_Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  count: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});
