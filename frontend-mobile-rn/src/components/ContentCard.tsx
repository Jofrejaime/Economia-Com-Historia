import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appTheme } from "../constants/theme";
import { ContentBadge } from "./ContentBadge";
import { CoverImage } from "./CoverImage";

type CardVariant = "compact" | "list" | "hero";

export interface ContentCardProps {
  variant?: CardVariant;
  title: string;
  author: string;
  image?: string | null;
  documentType?: string;
  accessLevelId?: string;
  categoryName?: string;
  categoryColorBg?: string | null;
  categoryColorText?: string | null;
  summary?: string | null;
  viewsCount?: number;
  likesCount?: number;
  publishedAt?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}

function relativeDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Há ${weeks} sem.`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Há ${months} ${months === 1 ? "mês" : "meses"}`;
  return `Há ${Math.floor(days / 365)} ${Math.floor(days / 365) === 1 ? "ano" : "anos"}`;
}

function fmtCount(n?: number): string {
  if (!n) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Compact ────────────────────────────────────────────────────────────────

function CompactCard({
  title, author, image, documentType, accessLevelId,
  categoryColorBg, viewsCount, likesCount, onPress, style,
}: ContentCardProps) {
  const showStats = viewsCount !== undefined || likesCount !== undefined;

  return (
    <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.8}>
      <CoverImage
        uri={image}
        documentType={documentType}
        categoryColorBg={categoryColorBg}
        width={80}
        height={80}
        borderRadius={appTheme.radius.md}
      />
      <View style={styles.compactContent}>
        <View style={styles.badgeRow}>
          {documentType && <ContentBadge variant="type" value={documentType} />}
          {accessLevelId && accessLevelId !== "public" && (
            <ContentBadge variant="access" value={accessLevelId} />
          )}
        </View>
        <Text style={styles.compactTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.compactMeta} numberOfLines={1}>{author}</Text>
        {showStats && (
          <View style={styles.statsRow}>
            {viewsCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="eye" size={11} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{fmtCount(viewsCount)}</Text>
              </View>
            )}
            {likesCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="heart" size={11} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{fmtCount(likesCount)}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── List ───────────────────────────────────────────────────────────────────

function ListCard({
  title, author, image, documentType, accessLevelId,
  categoryName, categoryColorBg, categoryColorText,
  summary, viewsCount, likesCount, publishedAt, onPress, style,
}: ContentCardProps) {
  const dateLabel = relativeDate(publishedAt);

  return (
    <TouchableOpacity style={[styles.listCard, style]} onPress={onPress} activeOpacity={0.8}>
      <CoverImage
        uri={image}
        documentType={documentType}
        categoryColorBg={categoryColorBg}
        width={96}
        height={72}
        borderRadius={appTheme.radius.md}
      />
      <View style={styles.listContent}>
        <View style={styles.badgeRow}>
          {categoryName ? (
            <ContentBadge
              variant="category"
              value={categoryName}
              categoryBg={categoryColorBg}
              categoryText={categoryColorText}
            />
          ) : documentType ? (
            <ContentBadge variant="type" value={documentType} />
          ) : null}
          {accessLevelId && accessLevelId !== "public" && (
            <ContentBadge variant="access" value={accessLevelId} />
          )}
        </View>
        <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
        {!!summary && (
          <Text style={styles.listSummary} numberOfLines={2}>{summary}</Text>
        )}
        <View style={styles.listFooter}>
          <Text style={styles.listAuthor} numberOfLines={1}>{author}</Text>
          <View style={styles.statsRow}>
            {viewsCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="eye" size={11} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{fmtCount(viewsCount)}</Text>
              </View>
            )}
            {likesCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="heart" size={11} color={appTheme.colors.textMuted} />
                <Text style={styles.statText}>{fmtCount(likesCount)}</Text>
              </View>
            )}
            {dateLabel && <Text style={styles.listDate}>{dateLabel}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function HeroCard({
  title, image, documentType, accessLevelId,
  categoryColorBg, viewsCount, likesCount, onPress, style,
}: ContentCardProps) {
  const isPremium = accessLevelId === "jindungo" || accessLevelId === "restricted";

  return (
    <TouchableOpacity style={[styles.heroWrapper, style]} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground
        source={image ? { uri: image } : undefined}
        style={[
          styles.heroImage,
          !image && { backgroundColor: categoryColorBg ?? appTheme.colors.primaryDark },
        ]}
        imageStyle={{ borderRadius: appTheme.radius.lg }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.78)"]}
          style={[StyleSheet.absoluteFill, { borderRadius: appTheme.radius.lg }]}
        />
        <View style={styles.heroTop}>
          {documentType && <ContentBadge variant="type" value={documentType} size="md" />}
          {isPremium && <ContentBadge variant="access" value={accessLevelId!} size="md" />}
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle} numberOfLines={3}>{title}</Text>
          <View style={styles.statsRow}>
            {viewsCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="eye" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>{fmtCount(viewsCount)}</Text>
              </View>
            )}
            {likesCount !== undefined && (
              <View style={styles.stat}>
                <Feather name="heart" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>{fmtCount(likesCount)}</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────

export function ContentCard({ variant = "compact", ...props }: ContentCardProps) {
  if (variant === "hero") return <HeroCard {...props} />;
  if (variant === "list") return <ListCard {...props} />;
  return <CompactCard {...props} />;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Compact
  compactCard: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.sm,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
    gap: 3,
  },
  compactTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 14,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 18,
  },
  compactMeta: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
  },

  // List
  listCard: {
    flexDirection: "row",
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.sm,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  listTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 15,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    lineHeight: 20,
  },
  listSummary: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    lineHeight: 18,
  },
  listFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  listAuthor: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    flex: 1,
  },
  listDate: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },

  // Hero
  heroWrapper: {
    borderRadius: appTheme.radius.lg,
    overflow: "hidden",
    ...appTheme.shadow.md,
  },
  heroImage: {
    height: 200,
    justifyContent: "space-between",
    overflow: "hidden",
    borderRadius: appTheme.radius.lg,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
  },
  heroBottom: {
    padding: 14,
    gap: 8,
  },
  heroTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  heroStatText: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  // Shared
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    fontWeight: "600",
  },
});
