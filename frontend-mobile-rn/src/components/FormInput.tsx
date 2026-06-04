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
  const isPassword = secureTextEntry;
  const inputType = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={isPassword ? styles.passwordWrap : undefined}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={appTheme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={inputType}
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
              color={appTheme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>⚠ {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.surface,
    minHeight: 48,
    paddingHorizontal: appTheme.spacing.md,
    color: appTheme.colors.textPrimary,
  },
  inputError: {
    borderColor: appTheme.colors.danger,
    backgroundColor: "#FEF2F2",
  },
  passwordWrap: { position: "relative" },
  eyeButton: { position: "absolute", right: 14, top: 14 },
  error: {
    color: appTheme.colors.danger,
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
});