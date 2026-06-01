import { DefaultTheme as NavigationDefaultTheme } from "@react-navigation/native";
import { colors } from "./colors";

export const appTheme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  typography: {
    heading: {
      fontSize: 26,
      fontWeight: "700" as const,
    },
    title: {
      fontSize: 20,
      fontWeight: "700" as const,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
    },
    caption: {
      fontSize: 14,
      fontWeight: "400" as const,
    },
  },
};

export const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

export type AppTheme = typeof appTheme;
