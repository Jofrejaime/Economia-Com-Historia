import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appTheme } from "../constants/theme";

type DifficultyType = string;

interface ContentCardProps {
  title: string;
  image: string;
  duration: string;
  difficulty?: DifficultyType;
  onPress?: () => void;
}

function getDifficultyColors(difficulty?: string): { bg: string; text: string } | null {
  if (!difficulty) return null;
  const lower = difficulty.toLowerCase();
  if (lower === "intermédio" || lower === "popular") {
    return { bg: appTheme.colors.badgeYellowBg, text: appTheme.colors.badgeYellowText };
  }
  if (lower === "avançado") {
    return { bg: appTheme.colors.dangerLight, text: appTheme.colors.danger };
  }
  return { bg: appTheme.colors.badgeLightBg, text: appTheme.colors.badgeLightText };
}

export function ContentCard({ title, image, duration, difficulty, onPress }: ContentCardProps) {
  const diffColors = getDifficultyColors(difficulty);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        {diffColors && difficulty && (
          <View style={[styles.tag, { backgroundColor: diffColors.bg }]}>
            <Text style={[styles.tagText, { color: diffColors.text }]}>{difficulty}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.meta}>{duration}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: appTheme.colors.border,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 6,
  },
  tagText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  meta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
});
