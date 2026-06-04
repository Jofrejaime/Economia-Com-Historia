import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface AcademicLevelButtonProps {
  level: string;
  selected: boolean;
  onPress: () => void;
}

export function AcademicLevelButton({ level, selected, onPress }: AcademicLevelButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.buttonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{level}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "48%",
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  buttonSelected: {
    backgroundColor: "#FDF3F4",
    borderColor: appTheme.colors.primary,
  },
  text: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  textSelected: {
    color: appTheme.colors.primary,
  },
  pressed: { opacity: 0.9 },
});