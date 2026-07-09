import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";
import { CategoryGroup, CategoryOption } from "../types/room";

interface CategorySelectProps {
  groups: CategoryGroup[];
  selectedCategory: CategoryOption | null;
  onSelect: (option: CategoryOption) => void;
  placeholder?: string;
}

export function CategorySelect({
  groups,
  selectedCategory,
  onSelect,
  placeholder = "Selecione a categoria",
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen, animation]);

  const label = useMemo(
    () => selectedCategory?.label ?? placeholder,
    [selectedCategory, placeholder]
  );

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  const handleSelect = (option: CategoryOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.control}
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.controlContent}>
          <View>
            <Text style={styles.controlLabel}>Categoria</Text>
            <Text style={[styles.controlValue, selectedCategory && styles.controlValueSelected]}>
              {label}
            </Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={22} color={appTheme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalWrapper} pointerEvents="box-none">
          <Animated.View style={[styles.modalCard, animatedStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha a categoria</Text>
              <Text style={styles.modalSubtitle}>Categorias agrupadas para navegação rápida.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.groupList}>
              {groups.map((group) => (
                <View key={group.title} style={styles.groupBlock}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.categories.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionCard}
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.75}
                    >
                      <View>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        {option.description ? (
                          <Text style={styles.optionDescription}>{option.description}</Text>
                        ) : null}
                      </View>
                      {selectedCategory?.id === option.id ? (
                        <Ionicons name="checkmark-circle" size={20} color={appTheme.colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  control: {
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...appTheme.shadow.sm,
  },
  controlContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlLabel: {
    fontFamily: appTheme.fontFamily.body,
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  controlValue: {
    fontFamily: appTheme.fontFamily.body,
    color: appTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  controlValueSelected: {
    color: appTheme.colors.textPrimary,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    padding: appTheme.spacing.lg,
  },
  modalCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.spacing.lg,
    maxHeight: "78%",
    ...appTheme.shadow.lg,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: appTheme.fontFamily.body,
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  groupList: {
    paddingBottom: 16,
  },
  groupBlock: {
    marginBottom: appTheme.spacing.lg,
  },
  groupTitle: {
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: appTheme.colors.background,
    borderRadius: appTheme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  optionLabel: {
    fontFamily: appTheme.fontFamily.heading,
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  optionDescription: {
    fontFamily: appTheme.fontFamily.body,
    marginTop: 4,
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
