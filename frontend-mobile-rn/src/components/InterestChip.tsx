import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface InterestChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function InterestChip({ label, selected, onPress }: InterestChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    borderRadius: appTheme.radius.pill,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: appTheme.colors.surface,
  },
  chipSelected: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.primary,
  },
  text: {
    fontFamily: "IBM_Plex_Sans",
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  textSelected: {
    color: appTheme.colors.surface,
    fontWeight: "600",
  },
  pressed: { opacity: 0.85 },
});
