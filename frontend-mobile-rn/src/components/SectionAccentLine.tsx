import React from "react";
import { View, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface SectionAccentLineProps {
  marginBottom?: number;
}

export function SectionAccentLine({ marginBottom = appTheme.spacing.md }: SectionAccentLineProps) {
  return <View style={[styles.line, { marginBottom }]} />;
}

const styles = StyleSheet.create({
  line: {
    width: 40,
    height: 3,
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.button,
    marginTop: 6,
  },
});
