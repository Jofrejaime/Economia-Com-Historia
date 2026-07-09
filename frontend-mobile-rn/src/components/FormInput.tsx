import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onBlur?: () => void;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  onBlur,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;
  const inputSecure = isPassword ? !showPassword : false;

  const borderColor = error
    ? appTheme.colors.danger
    : isFocused
    ? appTheme.colors.primary
    : appTheme.colors.border;

  const inputBg = error ? appTheme.colors.dangerLight : appTheme.colors.background;

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          { borderColor, backgroundColor: inputBg },
          isFocused && !error && styles.inputWrapFocused,
        ]}
      >
        <TextInput
          style={[styles.input, isPassword && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={appTheme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          secureTextEntry={inputSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {isPassword && (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={isFocused ? appTheme.colors.primary : appTheme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={appTheme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: appTheme.spacing.md,
  },
  label: {
    ...appTheme.typography.label,
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    borderWidth: 1,
    borderRadius: appTheme.radius.button,
    backgroundColor: appTheme.colors.background,
  },
  inputWrapFocused: {
    shadowColor: appTheme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: appTheme.spacing.md,
    ...appTheme.typography.body,
    color: appTheme.colors.textPrimary,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    ...appTheme.typography.caption,
    color: appTheme.colors.danger,
    fontWeight: "500",
  },
});
