import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { appTheme } from "../constants/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ children, style }: ScreenContainerProps) {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: appTheme.spacing.md,
  },
});
