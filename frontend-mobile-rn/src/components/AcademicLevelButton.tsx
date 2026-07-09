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
    minHeight: 52,
    borderRadius: appTheme.radius.button,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: appTheme.colors.surface,
  },
  buttonSelected: {
    backgroundColor: appTheme.colors.debateHighlightBg,
    borderColor: appTheme.colors.primary,
  },
  text: {
    ...appTheme.typography.label,
    color: appTheme.colors.textSecondary,
  },
  textSelected: {
    color: appTheme.colors.primary,
  },
  pressed: { opacity: 0.85 },
});
