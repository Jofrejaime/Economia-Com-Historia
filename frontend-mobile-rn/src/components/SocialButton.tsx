import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";
import { GoogleLogo } from "./GoogleLogo";

interface SocialButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export function SocialButton({ label, onPress }: SocialButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <GoogleLogo size={22} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    backgroundColor: appTheme.colors.surface,
  },
  label: {
    ...appTheme.typography.bodySemiBold,
    fontSize: 15,
    color: appTheme.colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
    backgroundColor: appTheme.colors.background,
  },
});
