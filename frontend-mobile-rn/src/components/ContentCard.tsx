import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appTheme } from "../constants/theme";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  article: "Artigo",
  thesis: "Tese",
  report: "Relatório",
  manuscript: "Manuscrito",
  archive: "Arquivo",
  video: "Vídeo",
  audio: "Áudio",
};

function accessBadge(id?: string): { label: string; bg: string; color: string } | null {
  if (!id) return null;
  if (id === "jindungo") return { label: "Jindungo", bg: appTheme.colors.warning + "20", color: appTheme.colors.warning };
  if (id === "restricted") return { label: "Restrito", bg: appTheme.colors.danger + "20", color: appTheme.colors.danger };
  return { label: "Público", bg: appTheme.colors.success + "20", color: appTheme.colors.success };
}

interface ContentCardProps {
  title: string;
  image?: string;
  duration: string;
  documentType?: string;
  accessLevelId?: string;
  onPress?: () => void;
}

export function ContentCard({ title, image, duration, documentType, accessLevelId, onPress }: ContentCardProps) {
  const badge = accessBadge(accessLevelId);
  const typeLabel = documentType ? DOCUMENT_TYPE_LABELS[documentType] ?? documentType.toUpperCase() : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.content}>
        {(typeLabel || badge) && (
          <View style={styles.badgeRow}>
            {typeLabel && (
              <View style={styles.typeChip}>
                <Text style={styles.typeChipText}>{typeLabel.toUpperCase()}</Text>
              </View>
            )}
            {badge && (
              <View style={[styles.accessChip, { backgroundColor: badge.bg }]}>
                <Text style={[styles.accessChipText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            )}
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
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: appTheme.colors.border,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  typeChip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "600",
    color: appTheme.colors.primary,
    letterSpacing: 0.4,
  },
  accessChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accessChipText: {
    fontFamily: "Source_Sans_3",
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
  },
  meta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },
});
