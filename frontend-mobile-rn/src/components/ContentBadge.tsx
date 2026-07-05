import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

type BadgeVariant = "type" | "access" | "state" | "category";
type BadgeSize = "sm" | "md";

interface ContentBadgeProps {
  variant: BadgeVariant;
  value: string;
  /** Usado em variant="category" para cor de fundo personalizada */
  categoryBg?: string | null;
  /** Usado em variant="category" para cor de texto personalizada */
  categoryText?: string | null;
  size?: BadgeSize;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  video:      { label: "Vídeo",      color: appTheme.colors.videoColor,       icon: "play-circle" },
  audio:      { label: "Áudio",      color: appTheme.colors.audioColor,       icon: "headphones" },
  article:    { label: "Artigo",     color: appTheme.colors.articleColor,     icon: "file-text" },
  thesis:     { label: "Tese",       color: appTheme.colors.warning,          icon: "book-open" },
  report:     { label: "Relatório",  color: appTheme.colors.secondary,        icon: "file" },
  manuscript: { label: "Manuscrito", color: appTheme.colors.rankingCardGray,  icon: "edit-3" },
  archive:    { label: "Arquivo",    color: appTheme.colors.rankingCardGray,  icon: "archive" },
};

const ACCESS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: keyof typeof Feather.glyphMap }> = {
  public:     { label: "Público",  bg: appTheme.colors.success + "20", color: appTheme.colors.success },
  jindungo:   { label: "Jindungo", bg: appTheme.colors.warning + "22", color: appTheme.colors.badgeYellowText, icon: "zap" },
  restricted: { label: "Restrito", bg: appTheme.colors.danger  + "20", color: appTheme.colors.danger, icon: "lock" },
};

const STATE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  new:         { label: "Novo",           bg: appTheme.colors.badgeLightBg,       color: appTheme.colors.badgeLightText },
  popular:     { label: "Popular",        bg: appTheme.colors.warning + "22",     color: appTheme.colors.badgeYellowText },
  recommended: { label: "Recomendado",    bg: appTheme.colors.primary + "18",     color: appTheme.colors.primary },
  premium:     { label: "Premium",        bg: appTheme.colors.warning + "22",     color: appTheme.colors.badgeYellowText },
  completed:   { label: "Concluído",      bg: appTheme.colors.success + "20",     color: appTheme.colors.success },
  in_progress: { label: "Em progresso",   bg: appTheme.colors.videoColor + "20",  color: appTheme.colors.videoColor },
};

export function ContentBadge({ variant, value, categoryBg, categoryText, size = "sm" }: ContentBadgeProps) {
  const px = size === "md" ? 9 : 6;
  const py = size === "md" ? 4 : 2;
  const fs = size === "md" ? 11 : 10;
  const iconSize = size === "md" ? 11 : 10;

  if (variant === "type") {
    const config = TYPE_CONFIG[value];
    if (!config) return null;
    return (
      <View style={[styles.badge, { backgroundColor: config.color + "18", paddingHorizontal: px, paddingVertical: py }]}>
        <Feather name={config.icon} size={iconSize} color={config.color} />
        <Text style={[styles.text, { color: config.color, fontSize: fs }]}>{config.label.toUpperCase()}</Text>
      </View>
    );
  }

  if (variant === "access") {
    const config = ACCESS_CONFIG[value] ?? ACCESS_CONFIG.public;
    return (
      <View style={[styles.badge, { backgroundColor: config.bg, paddingHorizontal: px, paddingVertical: py }]}>
        {config.icon && <Feather name={config.icon} size={iconSize} color={config.color} />}
        <Text style={[styles.text, { color: config.color, fontSize: fs }]}>{config.label.toUpperCase()}</Text>
      </View>
    );
  }

  if (variant === "state") {
    const config = STATE_CONFIG[value];
    if (!config) return null;
    return (
      <View style={[styles.badge, { backgroundColor: config.bg, paddingHorizontal: px, paddingVertical: py }]}>
        <Text style={[styles.text, { color: config.color, fontSize: fs }]}>{config.label.toUpperCase()}</Text>
      </View>
    );
  }

  if (variant === "category") {
    const bg = categoryBg ?? appTheme.colors.primary + "18";
    const color = categoryText ?? appTheme.colors.primary;
    return (
      <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: px, paddingVertical: py }]}>
        <Text style={[styles.text, { color, fontSize: fs }]}>{value.toUpperCase()}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: appTheme.radius.sm,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Source_Sans_3",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
