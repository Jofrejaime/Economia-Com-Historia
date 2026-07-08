import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { appTheme } from "../constants/theme";

interface DividerProps {
  text?: string;
}

export function Divider({ text = "ou" }: DividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: appTheme.colors.border,
  },
  text: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.textMuted,
    fontSize: 14,
  },
});