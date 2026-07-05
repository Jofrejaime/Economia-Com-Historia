import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { appTheme } from "../constants/theme";
import { accessService } from "../services/api/accessService";
import { documentService } from "../services/api/documentService";

interface AccessRequestModalProps {
  visible: boolean;
  // Omitir quando o pedido não está associado a um documento (ex: quiz) —
  // o backend usa então accessLevelId directamente.
  documentId?: string;
  accessLevelId: string;
  documentTitle?: string;
  onClose: () => void;
  /**
   * "subscription": a categoria do documento tem requires_subscription=true —
   * o pedido correcto é POST /documents/{id}/subscribe (DocumentSubscriptionService),
   * não /access-requests (que trata do gate por access_level_id e nunca
   * desbloqueia conteúdo com subscrição, já que canReadDocument() trata os
   * dois mecanismos como mutuamente exclusivos). Requer documentId.
   * "access-level" (default): fluxo actual via accessService.createRequest.
   */
  mode?: "subscription" | "access-level";
}

type ModalState = "idle" | "submitting" | "success" | "already_requested" | "error";

export function AccessRequestModal({
  visible,
  documentId,
  accessLevelId,
  documentTitle,
  onClose,
  mode = "access-level",
}: AccessRequestModalProps) {
  const [justification, setJustification] = useState("");
  const [modalState, setModalState] = useState<ModalState>("idle");

  const handleClose = () => {
    setJustification("");
    setModalState("idle");
    onClose();
  };

  const handleSubmit = async () => {
    setModalState("submitting");
    try {
      if (mode === "subscription") {
        if (!documentId) {
          setModalState("error");
          return;
        }
        // POST /documents/{id}/subscribe nunca devolve 409 — responde 200 com
        // already_exists=true quando já há um pedido ACTIVE/PENDING.
        const result = await documentService.subscribe(documentId);
        setModalState(result.already_exists ? "already_requested" : "success");
        return;
      }

      await accessService.createRequest(
        documentId
          ? { document_id: documentId, justification: justification.trim() || undefined }
          : { access_level_id: accessLevelId, justification: justification.trim() || undefined }
      );
      setModalState("success");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setModalState("already_requested");
      } else {
        setModalState("error");
      }
    }
  };

  const renderBody = () => {
    if (modalState === "success") {
      return (
        <>
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: appTheme.colors.successLight }]}>
              <Feather name="check" size={28} color={appTheme.colors.success} />
            </View>
          </View>
          <Text style={styles.title}>Pedido Enviado!</Text>
          <Text style={styles.description}>
            O teu pedido foi enviado com sucesso. A nossa equipa irá analisá-lo e serás notificado quando for revisto.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Fechar</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (modalState === "already_requested") {
      return (
        <>
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: appTheme.colors.badgeYellowBg }]}>
              <Feather name="clock" size={28} color={appTheme.colors.badgeYellowText} />
            </View>
          </View>
          <Text style={styles.title}>Pedido em Análise</Text>
          <Text style={styles.description}>
            Já tens um pedido pendente para este nível de acesso. Aguarda a revisão da nossa equipa — serás notificado assim que for processado.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Fechar</Text>
          </TouchableOpacity>
        </>
      );
    }

    const isJindungo = accessLevelId === "jindungo";
    const modalTitle = isJindungo ? "Conteúdo Jindungo" : "Acesso Restrito";
    const modalDescription = isJindungo
      ? (documentTitle
          ? `"${documentTitle}" é exclusivo para membros Jindungo.`
          : "Este conteúdo é exclusivo para membros Jindungo.")
      : (documentTitle
          ? `"${documentTitle}" está disponível apenas para utilizadores com acesso aprovado.`
          : "Este conteúdo está disponível apenas para utilizadores com acesso aprovado.");

    return (
      <>
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: isJindungo ? appTheme.colors.badgeYellowBg : appTheme.colors.debateHighlightBg }]}>
            <Feather name={isJindungo ? "zap" : "lock"} size={28} color={isJindungo ? appTheme.colors.badgeYellowText : appTheme.colors.primary} />
          </View>
        </View>
        <Text style={styles.title}>{modalTitle}</Text>
        <Text style={styles.description}>
          {modalDescription}
          {"\n\n"}
          Submete um pedido de acesso e a nossa equipa irá analisar a tua solicitação em breve.
        </Text>

        <Text style={styles.inputLabel}>Justificação (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Descreve o motivo do pedido de acesso..."
          placeholderTextColor={appTheme.colors.textMuted}
          value={justification}
          onChangeText={setJustification}
          multiline
          numberOfLines={4}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{justification.length}/1000</Text>

        {modalState === "error" && (
          <Text style={styles.errorText}>
            Não foi possível enviar o pedido. Verifica a tua ligação e tenta novamente.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            modalState === "submitting" && styles.primaryButtonLoading,
          ]}
          onPress={() => void handleSubmit()}
          disabled={modalState === "submitting"}
          activeOpacity={0.8}
        >
          {modalState === "submitting" ? (
            <ActivityIndicator size="small" color={appTheme.colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Solicitar Acesso</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.backdropTap} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color={appTheme.colors.textSecondary} />
          </TouchableOpacity>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {renderBody()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    backgroundColor: appTheme.colors.surface,
    borderTopLeftRadius: appTheme.radius.lg,
    borderTopRightRadius: appTheme.radius.lg,
    paddingHorizontal: appTheme.spacing.lg,
    paddingBottom: 40,
    maxHeight: "85%",
    ...appTheme.shadow.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.border,
    marginTop: appTheme.spacing.sm,
    marginBottom: appTheme.spacing.sm,
  },
  scrollContent: {
    paddingBottom: appTheme.spacing.md,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appTheme.spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: appTheme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: appTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.textPrimary,
    textAlign: "center",
    marginBottom: appTheme.spacing.sm,
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: appTheme.spacing.lg,
  },
  inputLabel: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    fontFamily: "Source_Sans_3",
    fontSize: 15,
    color: appTheme.colors.textPrimary,
    backgroundColor: appTheme.colors.background,
    borderWidth: 1.5,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.md,
    padding: appTheme.spacing.md,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: "Source_Sans_3",
    fontSize: 11,
    color: appTheme.colors.textMuted,
    textAlign: "right",
    marginTop: 4,
    marginBottom: appTheme.spacing.lg,
  },
  errorText: {
    fontFamily: "Source_Sans_3",
    fontSize: 13,
    color: appTheme.colors.danger,
    textAlign: "center",
    marginBottom: appTheme.spacing.md,
    lineHeight: 20,
  },
  primaryButton: {
    height: 52,
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 16,
    fontWeight: "700",
    color: appTheme.colors.surface,
    letterSpacing: 0.1,
  },
});
