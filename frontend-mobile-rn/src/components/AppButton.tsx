import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { appTheme } from "../constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AppButton({ label, onPress, disabled = false }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
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
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: appTheme.colors.border,
  },
  label: {
    color: appTheme.colors.surface,
    fontSize: appTheme.typography.body.fontSize,
    fontWeight: "700",
  },
  labelDisabled: {
    color: appTheme.colors.textMuted,
  },
});
