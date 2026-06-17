import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuth } from "../hooks/useAuth";
import { appTheme } from "../constants/theme";

export function RootNavigator() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
      </View>
    );
  }

  return <MainNavigator />;
}

export default RootNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.background,
  },
});