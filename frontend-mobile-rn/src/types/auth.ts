export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// Core user fields from the users + user_profiles tables
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  display_name: string;
  full_name: string | null;
  province: string | null;
  avatar_url: string | null;
  institution: string | null;
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
