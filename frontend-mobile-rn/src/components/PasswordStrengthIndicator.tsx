import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface PasswordStrengthIndicatorProps {
  strength: number; // 0,1,2,3
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  if (strength === 0) return null;

  const getStrengthText = () => {
    if (strength === 1) return "Fraca";
    if (strength === 2) return "Média";
    return "Forte";
  };

  const getStrengthColor = () => {
    if (strength === 1) return styles.strengthWeak;
    if (strength === 2) return styles.strengthMedium;
    return styles.strengthStrong;
  };

  const getTextColor = () => {
    if (strength === 1) return styles.strengthWeakText;
    if (strength === 2) return styles.strengthMediumText;
    return styles.strengthStrongText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <View style={[styles.bar, strength >= 1 && styles.strengthWeak]} />
        <View style={[styles.bar, strength >= 2 && styles.strengthMedium]} />
        <View style={[styles.bar, strength >= 3 && styles.strengthStrong]} />
      </View>
      <Text style={[styles.text, getTextColor()]}>{getStrengthText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  barRow: { flexDirection: "row", gap: 4, marginBottom: 4 },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.border,
  },
  strengthWeak: { backgroundColor: appTheme.colors.danger },
  strengthMedium: { backgroundColor: appTheme.colors.warning },
  strengthStrong: { backgroundColor: appTheme.colors.success },
  text: { fontSize: 12 },
  strengthWeakText: { color: appTheme.colors.danger },
  strengthMediumText: { color: appTheme.colors.warning },
  strengthStrongText: { color: appTheme.colors.success },
});