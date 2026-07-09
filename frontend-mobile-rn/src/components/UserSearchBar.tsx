import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

interface UserSearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export function UserSearchBar({
  value,
  onChangeText,
  placeholder = "Procurar utilizadores por nome ou @username",
  loading = false,
}: UserSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons name="search-outline" size={20} color={appTheme.colors.textMuted} />
      <TextInput
  value={value}
  onChangeText={onChangeText}
  placeholder={placeholder}
  placeholderTextColor={appTheme.colors.textMuted}
  style={[
    styles.input,
    {
      outlineWidth: 0,
      outlineStyle: "none",
    } as any,
  ]}
  autoCapitalize="none"
  returnKeyType="search"
  underlineColorAndroid="transparent"
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>
      {loading ? (
        <ActivityIndicator size="small" color={appTheme.colors.primary} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...appTheme.shadow.sm,
  },
  containerFocused: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    ...appTheme.typography.bodySemiBold,
    color: appTheme.colors.textPrimary,
  },
});
