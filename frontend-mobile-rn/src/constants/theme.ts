import { DefaultTheme as NavigationDefaultTheme } from "@react-navigation/native";
import { colors } from "./colors";

/** Nomes canónicos das famílias tipográficas do projeto. */
export const fontFamily = {
  /** IBM Plex Sans — títulos, labels, botões, pesos 600–700 */
  heading: "IBM_Plex_Sans",
  /** Source Sans 3 — corpo de texto, meta, pesos 400–600 */
  body: "Source_Sans_3",
} as const;

export const appTheme = {
  colors,
  fontFamily,
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
    /** Título principal de ecrã — 26 / IBM / 700 */
    heading: {
      fontFamily: fontFamily.heading,
      fontSize: 26,
      fontWeight: "700" as const,
      letterSpacing: -0.52,
      lineHeight: 34,
    },
    /** Subtítulo destacado — 22 / IBM / 700 */
    subheading: {
      fontFamily: fontFamily.heading,
      fontSize: 22,
      fontWeight: "700" as const,
      letterSpacing: -0.44,
      lineHeight: 29,
    },
    /** Título de secção ou card — 20 / IBM / 700 */
    title: {
      fontFamily: fontFamily.heading,
      fontSize: 20,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
      lineHeight: 26,
    },
    /** Título menor — 18 / IBM / 700 */
    titleSmall: {
      fontFamily: fontFamily.heading,
      fontSize: 18,
      fontWeight: "700" as const,
      letterSpacing: -0.36,
      lineHeight: 24,
    },
    /** Corpo de texto padrão — 16 / Source / 400 */
    body: {
      fontFamily: fontFamily.body,
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 27,
    },
    /** Corpo semi-bold (subtítulos de item) — 16 / Source / 600 */
    bodySemiBold: {
      fontFamily: fontFamily.body,
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 24,
    },
    /** Texto secundário / legenda — 14 / Source / 400 */
    caption: {
      fontFamily: fontFamily.body,
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    /** Label de campo ou botão — 14 / IBM / 600 */
    label: {
      fontFamily: fontFamily.heading,
      fontSize: 14,
      fontWeight: "600" as const,
      lineHeight: 20,
    },
    /** Label negrito — 14 / IBM / 700 */
    labelBold: {
      fontFamily: fontFamily.heading,
      fontSize: 14,
      fontWeight: "700" as const,
      lineHeight: 20,
    },
    /** Texto auxiliar pequeno — 12 / Source / 400 */
    micro: {
      fontFamily: fontFamily.body,
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 18,
    },
    /** Texto micro semi-bold (badges, chips) — 12 / Source / 600 */
    microSemiBold: {
      fontFamily: fontFamily.body,
      fontSize: 12,
      fontWeight: "600" as const,
      lineHeight: 18,
    },
    /** Texto mínimo (11px) — etiquetas internas */
    tiny: {
      fontFamily: fontFamily.body,
      fontSize: 11,
      fontWeight: "400" as const,
      lineHeight: 16,
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
