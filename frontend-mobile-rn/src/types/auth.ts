export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}
