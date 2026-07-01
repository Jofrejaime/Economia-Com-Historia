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
    xxl: 48,
    xxxl: 64,
  },
  radius: {
    button: 4,
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  typography: {
    heading: {
      fontFamily: "IBM_Plex_Sans",
      fontSize: 26,
      fontWeight: "700" as const,
      letterSpacing: -0.52,
      lineHeight: 34,
    },
    title: {
      fontFamily: "IBM_Plex_Sans",
      fontSize: 20,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
      lineHeight: 26,
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
      lineHeight: 24,
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
