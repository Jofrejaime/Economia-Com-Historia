import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface SocialButtonProps {
  icon: string; // Texto do ícone (ex: "G")
  label: string;
  onPress: () => void;
}

export function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    backgroundColor: appTheme.colors.surface,
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#4285F4",
    fontWeight: "700",
    fontSize: 12,
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: { opacity: 0.9 },
});