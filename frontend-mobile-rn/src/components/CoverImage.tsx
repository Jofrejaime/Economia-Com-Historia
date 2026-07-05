import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

const TYPE_ICON: Record<string, { icon: keyof typeof Feather.glyphMap; color: string }> = {
  video:      { icon: "play-circle", color: appTheme.colors.videoColor },
  audio:      { icon: "headphones",  color: appTheme.colors.audioColor },
  article:    { icon: "file-text",   color: appTheme.colors.articleColor },
  thesis:     { icon: "book-open",   color: appTheme.colors.warning },
  report:     { icon: "file",        color: appTheme.colors.secondary },
  manuscript: { icon: "edit-3",      color: appTheme.colors.rankingCardGray },
  archive:    { icon: "archive",     color: appTheme.colors.rankingCardGray },
};

interface CoverImageProps {
  uri?: string | null;
  documentType?: string | null;
  /** Cor de fundo da categoria para fallback colorido */
  categoryColorBg?: string | null;
  width: number;
  height: number;
  borderRadius?: number;
  /** Tamanho do ícone de fallback; calculado automaticamente se omitido */
  iconSize?: number;
}

export function CoverImage({
  uri,
  documentType,
  categoryColorBg,
  width,
  height,
  borderRadius = appTheme.radius.md,
  iconSize,
}: CoverImageProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width, height, borderRadius, backgroundColor: appTheme.colors.border }}
        resizeMode="cover"
      />
    );
  }

  const iconConfig = documentType ? (TYPE_ICON[documentType] ?? null) : null;
  const fallbackBg = categoryColorBg ?? appTheme.colors.primaryDark;
  const resolvedIconSize = iconSize ?? Math.round(Math.min(width, height) * 0.38);

  return (
    <View style={[styles.placeholder, { width, height, borderRadius, backgroundColor: fallbackBg }]}>
      <Feather
        name={iconConfig?.icon ?? "file"}
        size={resolvedIconSize}
        color="rgba(255,255,255,0.72)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
