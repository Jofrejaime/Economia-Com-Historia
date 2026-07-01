import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

interface Props {
  message: string | null;
  onDismiss?: () => void;
  style?: object;
}

export function ErrorBanner({ message, onDismiss, style }: Props) {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Feather name="alert-circle" size={16} color="#B91C1C" style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.dismiss}
        >
          <Feather name="x" size={16} color="#B91C1C" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: appTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: appTheme.radius.sm,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  icon: {
    marginTop: 1,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: "Source_Sans_3",
    fontSize: 14,
    color: "#B91C1C",
    lineHeight: 20,
  },
  dismiss: {
    marginTop: 1,
    flexShrink: 0,
  },
});
