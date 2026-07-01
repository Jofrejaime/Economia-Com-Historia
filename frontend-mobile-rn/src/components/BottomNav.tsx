import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";

interface BottomNavProps {
  activeTab?: "home" | "content" | "community" | "quiz";
  onNavPress?: (tab: "home" | "content" | "community" | "quiz") => void;
}

export function BottomNav({ activeTab = "home", onNavPress }: BottomNavProps) {
  const navItems = [
    { id: "home", label: "Início", icon: "home-outline" as const },
    { id: "content", label: "Conteúdos", icon: "trending-up" as const },
    { id: "community", label: "Comunidade", icon: "chatbubble-outline" as const },
    { id: "quiz", label: "Quiz", icon: "trophy-outline" as const },
  ];

  const handlePress = (tabId: string) => {
    if (onNavPress) {
      onNavPress(tabId as "home" | "content" | "community" | "quiz");
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => handlePress(item.id)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={activeTab === item.id ? appTheme.colors.primary : appTheme.colors.textMuted}
          />
          <Text style={[styles.navLabel, activeTab === item.id && styles.navLabelActive]}>
            {item.label}
          </Text>
          {activeTab === item.id && <View style={styles.activeDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: appTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    fontWeight: "500",
  },
  navLabelActive: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: appTheme.colors.primary,
    marginTop: 2,
  },
});
