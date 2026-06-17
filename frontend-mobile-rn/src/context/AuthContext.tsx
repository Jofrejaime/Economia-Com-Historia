import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, AuthUser, SignInInput, SignUpInput } from "../types/auth";
import { setAuthToken } from "../services/http/tokenManager";

interface AuthContextValue extends AuthState {
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const initialState: AuthState = {
  status: "loading",
  token: null,
  user: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Carrega sessão salva ao iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem("@auth_token");
        const userJson = await AsyncStorage.getItem("@auth_user");
        if (token && userJson) {
          const user = JSON.parse(userJson);
          // Sincroniza token em memória para o cliente HTTP
          setAuthToken(token);
          setState({ status: "authenticated", token, user });
          return;
        }
      } catch (error) {
        console.warn("Erro ao carregar sessão", error);
      }
      setState({ status: "unauthenticated", token: null, user: null });
    };
    loadSession();
  }, []);

  // Login (simula chamada API)
  const signIn = async ({ email, password }: SignInInput) => {
    // Mock – busca utilizador "existente" pelo email
    const mockToken = "mock-jwt-token-" + Date.now();
    const mockUser: AuthUser = {
      id: "user-" + email,
      name: email.split("@")[0], // nome baseado no email
      email,
    };
    try {
      const registeredEmailsRaw = await AsyncStorage.getItem("@registered_emails");
      const registeredEmails = registeredEmailsRaw ? JSON.parse(registeredEmailsRaw) : [];
      if (!registeredEmails.includes(email.toLowerCase())) {
        registeredEmails.push(email.toLowerCase());
        await AsyncStorage.setItem("@registered_emails", JSON.stringify(registeredEmails));
      }
    } catch (error) {
      console.warn("Erro ao salvar email registrado", error);
    }
    await AsyncStorage.setItem("@auth_token", mockToken);
    await AsyncStorage.setItem("@auth_user", JSON.stringify(mockUser));
    // Mantém token em memória para o interceptor HTTP
    setAuthToken(mockToken);
    setState({ status: "authenticated", token: mockToken, user: mockUser });
  };

  // Registo (simula criação de conta)
  const signUp = async ({ fullName, email, password }: SignUpInput) => {
    const mockToken = "mock-jwt-token-" + Date.now();
    const mockUser: AuthUser = {
      id: "user-" + email,
      name: fullName,
      email,
    };
    try {
      const registeredEmailsRaw = await AsyncStorage.getItem("@registered_emails");
      const registeredEmails = registeredEmailsRaw ? JSON.parse(registeredEmailsRaw) : [];
      if (!registeredEmails.includes(email.toLowerCase())) {
        registeredEmails.push(email.toLowerCase());
        await AsyncStorage.setItem("@registered_emails", JSON.stringify(registeredEmails));
      }
    } catch (error) {
      console.warn("Erro ao salvar email registrado", error);
    }
    await AsyncStorage.setItem("@auth_token", mockToken);
    await AsyncStorage.setItem("@auth_user", JSON.stringify(mockUser));
    setAuthToken(mockToken);
    setState({ status: "authenticated", token: mockToken, user: mockUser });
  };

  // Logout
  const signOut = async () => {
    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@auth_user");
    // Remove também o token mantido em memória
    setAuthToken(null);
    setState({ status: "unauthenticated", token: null, user: null });
  };

  const value = useMemo(
    () => ({ ...state, signIn, signUp, signOut }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}