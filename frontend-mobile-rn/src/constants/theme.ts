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
    button: 4,
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  typography: {
    heading: {
      fontFamily: "IBM_Plex_Sans",
      fontSize: 26,
      fontWeight: "700" as const,
    },
    title: {
      fontFamily: "IBM_Plex_Sans",
      fontSize: 20,
      fontWeight: "700" as const,
    },
    body: {
      fontFamily: "Source_Sans_3",
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 27,
    },
    caption: {
      fontFamily: "Source_Sans_3",
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
