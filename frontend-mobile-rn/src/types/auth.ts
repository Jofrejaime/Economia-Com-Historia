export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUserAccessGrant {
  id: string;
  access_level_id: string;
  granted_at: string;
  access_level_name: string;
  access_level_description: string | null;
}

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
  access_grants: AuthUserAccessGrant[];
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
