import type { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function parseApiError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Algo correu mal. Tenta novamente.";
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (!axiosError.response) {
    return "Sem ligação à internet. Verifica a tua rede.";
  }

  const { status, data } = axiosError.response;

  // Laravel validation errors — first field message takes priority
  if (data?.errors && typeof data.errors === "object") {
    const firstField = Object.keys(data.errors)[0];
    const firstMessage = data.errors[firstField]?.[0];
    if (firstField && firstMessage) {
      return translateValidationError(firstField, firstMessage);
    }
  }

  // Backend plain message
  if (data?.message) {
    return translateMessage(data.message);
  }

  // Fallback by HTTP status
  if (status === 401) return "Sessão expirada. Inicia sessão novamente.";
  if (status === 403) return "Não tens permissão para esta ação.";
  if (status === 404) return "Recurso não encontrado.";
  if (status !== undefined && status >= 500) return "Erro no servidor. Tenta mais tarde.";

  return "Algo correu mal. Tenta novamente.";
}

/** Returns true if the error is specifically about the email field */
export function isEmailError(error: unknown): boolean {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return Boolean(axiosError?.response?.data?.errors?.email);
}

function translateMessage(message: string): string {
  const map: Record<string, string> = {
    "Invalid credentials.": "Email ou palavra-passe incorretos.",
    "This account has been deactivated.": "Esta conta foi desativada. Contacta o suporte.",
    "Please verify your email before logging in.": "Verifica o teu email antes de iniciar sessão.",
    "Attempt already in progress.": "Já tens uma tentativa em curso para este quiz.",
    "Attempt is not in progress.": "Esta tentativa já foi concluída.",
    "Attempt not found.": "Tentativa não encontrada.",
    "Quiz is not published.": "Este quiz ainda não está disponível.",
    "Quiz not found.": "Quiz não encontrado.",
    "Access denied.": "Não tens acesso a este conteúdo.",
    "Token missing.": "Sessão inválida. Inicia sessão novamente.",
    "Invalid token.": "Sessão inválida. Inicia sessão novamente.",
    "Session expired.": "Sessão expirada. Inicia sessão novamente.",
  };
  return map[message] ?? message;
}

function translateValidationError(field: string, message: string): string {
  const msg = message.toLowerCase();

  if (field === "email") {
    if (msg.includes("already been taken")) return "Este email já está registado.";
    if (msg.includes("valid email") || msg.includes("must be a valid")) return "Introduz um email válido.";
    if (msg.includes("required")) return "O email é obrigatório.";
  }

  if (field === "password") {
    if (msg.includes("confirmed")) return "As palavras-passe não coincidem.";
    if (msg.includes("uppercase") || msg.includes("lowercase") || msg.includes("mixed")) {
      return "A palavra-passe deve conter letras maiúsculas e minúsculas.";
    }
    if (msg.includes("number")) return "A palavra-passe deve conter pelo menos um número.";
    if (msg.includes("symbol") || msg.includes("special")) {
      return "A palavra-passe deve conter pelo menos um símbolo (ex: @, !, #).";
    }
    if (msg.includes("8") || msg.includes("characters")) {
      return "A palavra-passe deve ter pelo menos 8 caracteres.";
    }
    if (msg.includes("compromised") || msg.includes("leaked")) {
      return "Esta palavra-passe é conhecida e não é segura. Escolhe outra.";
    }
  }

  if (field === "display_name") {
    if (msg.includes("required")) return "O nome é obrigatório.";
    if (msg.includes("max")) return "O nome não pode ultrapassar 100 caracteres.";
  }

  return message;
}
