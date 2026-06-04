import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { appTheme } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export function SupportScreen() {
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Suporte</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Central de ajuda (em breve)</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: "700", color: appTheme.colors.textPrimary },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: appTheme.colors.textMuted, fontSize: 16 },
});