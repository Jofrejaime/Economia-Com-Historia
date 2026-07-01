import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { appTheme } from "../constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export function AppButton({ label, onPress, disabled = false, variant = "primary" }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "ghost" && styles.buttonGhost,
        disabled && variant === "primary" && styles.buttonDisabled,
        disabled && variant === "secondary" && styles.buttonSecondaryDisabled,
        disabled && variant === "ghost" && styles.buttonGhostDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[
        styles.label,
        (variant === "secondary" || variant === "ghost") && styles.labelSecondary,
        disabled && styles.labelDisabled,
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: appTheme.spacing.md,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: appTheme.colors.primary,
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: appTheme.colors.border,
  },
  buttonSecondaryDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
  },
  buttonGhostDisabled: {
    backgroundColor: "transparent",
  },
  label: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: appTheme.typography.body.fontSize,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  labelSecondary: {
    color: appTheme.colors.primary,
  },
  labelDisabled: {
    color: appTheme.colors.textMuted,
  },
});
