import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNetwork } from "../context/NetworkContext";
import { appTheme } from "../constants/theme";

export function OfflineBanner() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Feather name="wifi-off" size={12} color={appTheme.colors.surface} />
      <Text style={styles.text}>Sem ligação — a mostrar conteúdo guardado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 7,
    backgroundColor: appTheme.colors.textSecondary,
    marginHorizontal: -appTheme.spacing.md,
  },
  text: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.surface,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
