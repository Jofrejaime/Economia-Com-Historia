import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { FormInput } from "../../components/FormInput";
import { appTheme } from "../../constants/theme";
import { HeaderBar } from "../../components/HeaderBar";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api/userService";
import { Ionicons } from "@expo/vector-icons";

const ANGOLA_PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire",
];

export function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [province, setProvince] = useState(user?.province ?? "");
  const [provinceModal, setProvinceModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }
    setSaving(true);
    try {
      await userService.updateProfile({
        display_name: displayName.trim(),
        institution: institution.trim() || null,
        province: province || null,
      });
      await refreshUser();
      Alert.alert("Sucesso", "Perfil actualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível guardar as alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <HeaderBar title="Informação Pessoal" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Gerir dados da conta e identificação</Text>

        <View style={styles.formCard}>
          {/* Email — read only */}
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>Email</Text>
            <Text style={styles.readOnlyValue}>{user?.email ?? "—"}</Text>
            <Text style={styles.readOnlyHint}>O email não pode ser alterado nesta página.</Text>
          </View>

          <FormInput
            label="Nome de exibição"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="O teu nome"
          />

          <FormInput
            label="Instituição"
            value={institution}
            onChangeText={setInstitution}
            placeholder="Ex: ISPTEC, Universidade Agostinho Neto"
          />

          {/* Province picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Província</Text>
            <TouchableOpacity
              style={[styles.selectField, province ? styles.selectFieldFilled : null]}
              onPress={() => setProvinceModal(true)}
              activeOpacity={0.8}
            >
              <Text style={province ? styles.selectValue : styles.selectPlaceholder}>
                {province || "Seleccionar província..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color={appTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={() => void handleSave()}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.saveButtonText}>Guardar Alterações</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Province modal */}
      <Modal visible={provinceModal} transparent animationType="slide" onRequestClose={() => setProvinceModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProvinceModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Escolher Província</Text>
            <FlatList
              data={ANGOLA_PROVINCES}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => {
                const selected = item === province;
                return (
                  <TouchableOpacity
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => { setProvince(item); setProvinceModal(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>{item}</Text>
                    {selected && <Ionicons name="checkmark" size={18} color={appTheme.colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 0,
  },
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textSecondary,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.sm,
    gap: 4,
  },
  readOnlyField: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  readOnlyValue: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    backgroundColor: appTheme.colors.background,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  readOnlyHint: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    marginTop: 4,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textSecondary,
    marginBottom: 6,
  },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.sm,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectFieldFilled: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.surface,
  },
  selectValue: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
  },
  selectPlaceholder: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textMuted,
  },
  saveButton: {
    backgroundColor: appTheme.colors.primary,
    height: 48,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "Source_Sans_3",
    color: appTheme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  // Province modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: appTheme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appTheme.colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: appTheme.colors.background,
    marginHorizontal: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalOptionSelected: {
    backgroundColor: appTheme.colors.debateHighlightBg,
  },
  modalOptionText: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
  },
  modalOptionTextSelected: {
    color: appTheme.colors.primary,
    fontWeight: "700",
  },
});
