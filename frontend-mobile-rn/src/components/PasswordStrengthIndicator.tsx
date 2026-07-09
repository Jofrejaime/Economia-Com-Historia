import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface PasswordStrengthIndicatorProps {
  strength: number; // 0, 1, 2, 3
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  if (strength === 0) return null;

  const getLabel = () => {
    if (strength === 1) return "Fraca";
    if (strength === 2) return "Média";
    return "Forte";
  };

  const getLabelStyle = () => {
    if (strength === 1) return styles.textWeak;
    if (strength === 2) return styles.textMedium;
    return styles.textStrong;
  };

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <View style={[styles.bar, strength >= 1 && styles.barWeak]} />
        <View style={[styles.bar, strength >= 2 && styles.barMedium]} />
        <View style={[styles.bar, strength >= 3 && styles.barStrong]} />
      </View>
      <Text style={[styles.label, getLabelStyle()]}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 20,
  },
  barRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.border,
  },
  barWeak: { backgroundColor: appTheme.colors.danger },
  barMedium: { backgroundColor: appTheme.colors.warning },
  barStrong: { backgroundColor: appTheme.colors.success },
  label: {
    ...appTheme.typography.microSemiBold,
  },
  textWeak: { color: appTheme.colors.danger },
  textMedium: { color: appTheme.colors.warning },
  textStrong: { color: appTheme.colors.success },
});
