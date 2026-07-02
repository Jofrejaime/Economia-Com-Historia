import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, AuthUser, SignInInput, SignUpInput } from "../types/auth";
import { setAuthToken } from "../services/http/tokenManager";
import { httpClient, setUnauthorizedHandler } from "../services/http/client";
import { API_ENDPOINTS } from "../constants/api";

interface AuthContextValue extends AuthState {
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  status: "loading",
  token: null,
  user: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapMeResponseToAuthUser(data: any): AuthUser {
  return {
    id: data.id,
    email: data.email,
    role: data.role ?? 'estudante',
    display_name: data.profile?.display_name ?? data.email.split('@')[0],
    full_name: data.profile?.full_name ?? null,
    province: data.profile?.province ?? null,
    avatar_url: data.profile?.avatar_url ?? null,
    institution: data.profile?.institution ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Register a handler so any 401 response auto-clears the session.
  // setState is stable across renders (React guarantee), safe in empty-deps effect.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      void AsyncStorage.removeItem("@auth_token");
      void AsyncStorage.removeItem("@auth_user");
      setState({ status: "unauthenticated", token: null, user: null });
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem("@auth_token");
        const userJson = await AsyncStorage.getItem("@auth_user");
        if (token && userJson) {
          const user = JSON.parse(userJson) as AuthUser;
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

  const refreshUser = async () => {
    try {
      const { data } = await httpClient.get(API_ENDPOINTS.ME.SHOW);
      const payload = data.data ?? data;
      // GET /me returns { user: {...}, profile: {...}, user_level: {...}, badges: [...] }
      // merge top-level user fields with profile so mapMeResponseToAuthUser can read them
      const merged = { ...(payload.user ?? payload), profile: payload.profile ?? null };
      const user = mapMeResponseToAuthUser(merged);
      await AsyncStorage.setItem("@auth_user", JSON.stringify(user));
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.warn("Erro ao actualizar utilizador", error);
    }
  };

  const signIn = async ({ email, password }: SignInInput) => {
    const { data } = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const payload = data.data ?? data;
    const token: string = payload.token;
    // login returns user + profile as separate fields — merge them for mapMeResponseToAuthUser
    const userWithProfile = { ...(payload.user ?? payload), profile: payload.profile ?? null };
    const user = mapMeResponseToAuthUser(userWithProfile);

    setAuthToken(token);
    await AsyncStorage.setItem("@auth_token", token);
    await AsyncStorage.setItem("@auth_user", JSON.stringify(user));
    setState({ status: "authenticated", token, user });
  };

  const signUp = async ({ fullName, email, password }: SignUpInput) => {
    const { data } = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      display_name: fullName,
      email,
      password,
      password_confirmation: password,
    });
    const payload = data.data ?? data;
    const token: string = payload.token;
    // register returns user without profile — inject display_name directly
    const userWithProfile = { ...(payload.user ?? payload), profile: { display_name: fullName } };
    const user = mapMeResponseToAuthUser(userWithProfile);

    setAuthToken(token);
    await AsyncStorage.setItem("@auth_token", token);
    await AsyncStorage.setItem("@auth_user", JSON.stringify(user));
    setState({ status: "authenticated", token, user });
  };

  const signOut = async () => {
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // ignore logout errors — clear session regardless
    }
    setAuthToken(null);
    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@auth_user");
    setState({ status: "unauthenticated", token: null, user: null });
  };

  const value = useMemo(
    () => ({ ...state, signIn, signUp, signOut, refreshUser }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
