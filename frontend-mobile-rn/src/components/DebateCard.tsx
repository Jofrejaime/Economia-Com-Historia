import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appTheme } from "../constants/theme";

interface DebateCardProps {
  title: string;
  replies: number;
  activeSince: string;
  isHighlight?: boolean;
  onPress?: () => void;
}

export function DebateCard({ title, replies, activeSince, isHighlight = false, onPress }: DebateCardProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.border, isHighlight ? styles.borderActive : styles.borderInactive]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>💬 {replies} respostas • {activeSince}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    marginBottom: 16,
  },
  border: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    minHeight: 44,
  },
  borderActive: {
    backgroundColor: appTheme.colors.primary,
  },
  borderInactive: {
    backgroundColor: appTheme.colors.rankingCardSecondary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  meta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
});
