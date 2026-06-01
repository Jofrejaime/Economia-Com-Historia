import React, { createContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../services/storage/keys";
import { getSecureItem, removeSecureItem, setSecureItem } from "../services/storage/secureStorage";
import { getLocalItem, removeLocalItem, setLocalItem } from "../services/storage/localStorage";
import { setAuthToken } from "../services/http/tokenManager";
import { AuthState, AuthUser, SignInInput, SignUpInput } from "../types/auth";

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

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, user] = await Promise.all([
          getSecureItem(STORAGE_KEYS.token),
          getLocalItem<AuthUser>(STORAGE_KEYS.user),
        ]);

        if (token && user) {
          setAuthToken(token);
          setState({ status: "authenticated", token, user });
          return;
        }
      } catch {
        // Keep unauthenticated state if persisted data is unavailable.
      }

      setAuthToken(null);
      setState({ status: "unauthenticated", token: null, user: null });
    };

    void bootstrap();
  }, []);

  const signIn = async ({ email }: SignInInput) => {
    // Placeholder auth flow for migration foundation.
    const mockToken = "migration-foundation-token";
    const mockUser: AuthUser = {
      id: "local-user",
      name: "Utilizador",
      email,
    };

    await Promise.all([
      setSecureItem(STORAGE_KEYS.token, mockToken),
      setLocalItem(STORAGE_KEYS.user, mockUser),
    ]);

    setAuthToken(mockToken);
    setState({ status: "authenticated", token: mockToken, user: mockUser });
  };

  const signUp = async ({ fullName, email }: SignUpInput) => {
    const mockToken = "migration-foundation-token";
    const mockUser: AuthUser = {
      id: "local-user",
      name: fullName,
      email,
    };

    await Promise.all([
      setSecureItem(STORAGE_KEYS.token, mockToken),
      setLocalItem(STORAGE_KEYS.user, mockUser),
    ]);

    setAuthToken(mockToken);
    setState({ status: "authenticated", token: mockToken, user: mockUser });
  };

  const signOut = async () => {
    await Promise.all([
      removeSecureItem(STORAGE_KEYS.token),
      removeLocalItem(STORAGE_KEYS.user),
    ]);
    setAuthToken(null);
    setState({ status: "unauthenticated", token: null, user: null });
  };

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
