import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ApiProfile {
  id?: string;
  user_id?: string;
  display_name?: string;
  full_name?: string | null;
  institution?: string | null;
  province?: string | null;
  bio?: string | null;
  website_url?: string | null;
  research_areas?: string[] | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MeResponse {
  user?: unknown;
  profile?: ApiProfile | null;
  access_grants?: unknown[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  async getMe(): Promise<MeResponse> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      return await firstValueFrom(
        this.http.get<MeResponse>(`${environment.apiBaseUrl}/api/me`, {
          headers: this.auth.getAuthHeaders(token),
        })
      );
    } catch (error) {
      throw this.normalizeError(error, 'Falha ao carregar o contexto do utilizador');
    }
  }

  async getProfile(): Promise<{ profile: ApiProfile }> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      return await firstValueFrom(
        this.http.get<{ profile: ApiProfile }>(`${environment.apiBaseUrl}/api/profile`, {
          headers: this.auth.getAuthHeaders(token),
        })
      );
    } catch (error) {
      throw this.normalizeError(error, 'Falha ao carregar o perfil');
    }
  }

  async updateProfile(payload: {
    display_name?: string;
    full_name?: string | null;
    institution?: string | null;
    province?: string | null;
    bio?: string | null;
    website_url?: string | null;
    research_areas?: string[] | null;
  }): Promise<{ message?: string; profile?: ApiProfile }> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      return await firstValueFrom(
        this.http.put<{ message?: string; profile?: ApiProfile }>(
          `${environment.apiBaseUrl}/api/profile`,
          payload,
          { headers: this.auth.getAuthHeaders(token) }
        )
      );
    } catch (error) {
      throw this.normalizeError(error, 'Falha ao atualizar o perfil');
    }
  }

  async updateAvatar(avatar: File): Promise<{ message?: string; avatar_url?: string }> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      return await firstValueFrom(
        this.http.post<{ message?: string; avatar_url?: string }>(
          `${environment.apiBaseUrl}/api/profile/avatar`,
          formData,
          { headers: this.auth.getAuthHeaders(token) }
        )
      );
    } catch (error) {
      throw this.normalizeError(error, 'Falha ao atualizar o avatar');
    }
  }

  async updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message?: string }> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      return await firstValueFrom(
        this.http.put<{ message?: string }>(
          `${environment.apiBaseUrl}/api/profile/password`,
          {
            current_password: payload.current_password,
            password: payload.password,
            password_confirmation: payload.password_confirmation,
          },
          { headers: this.auth.getAuthHeaders(token) }
        )
      );
    } catch (error) {
      throw this.normalizeError(error, 'Falha ao atualizar a palavra-passe');
    }
  }

  private normalizeError(error: unknown, fallback: string): Error {
    if (error instanceof HttpErrorResponse) {
      return new Error(error.error?.message || error.message || `HTTP ${error.status}`);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(fallback);
  }
}
