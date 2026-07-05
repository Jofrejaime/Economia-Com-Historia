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

export interface AccessGrant {
  id: string;
  user_id: string;
  access_level_id: string;
  granted_at: string;
  access_level_name: string;
  access_level_description: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  color_hex: string | null;
  category: string | null;
  earned_at: string;
}

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  quizzes_completed: number;
  documents_read: number;
  topics_created: number;
  replies_posted: number;
  updated_at: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  min_points: number;
  max_points: number | null;
  color_hex: string | null;
  icon_url: string | null;
  perks: unknown;
}

export interface InterestAreaRef {
  id: string;
  name: string;
  slug: string;
}

export interface MeResponse {
  user?: unknown;
  profile?: ApiProfile | null;
  access_grants?: AccessGrant[];
  user_level?: UserLevel | null;
  level_definition?: LevelDefinition | null;
  badges?: Badge[];
  interest_areas?: InterestAreaRef[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Garante que a URL do avatar é completa e acessível
   */
  private ensureCompleteAvatarUrl(url: string | null | undefined): string | null | undefined {
    if (!url) return null;
    
    // Se já começa com http, é uma URL completa
    if (url.startsWith('http')) return url;
    
    // Se é um caminho relativo, construir URL completa
    if (url.startsWith('/')) {
      return `${environment.apiBaseUrl}${url}`;
    }
    
    // Caso especial: se começa com "avatars/", adicionar /storage/
    if (url.startsWith('avatars/')) {
      return `${environment.apiBaseUrl}/storage/${url}`;
    }
    
    // Fallback: assumir que é um caminho relativo no storage
    return `${environment.apiBaseUrl}/storage/${url}`;
  }

  /**
   * Processa uma resposta de profile para garantir URLs completas
   */
  private processProfile(profile: ApiProfile | null | undefined): ApiProfile | undefined {
    if (!profile) return undefined;
    
    return {
      ...profile,
      avatar_url: this.ensureCompleteAvatarUrl(profile.avatar_url) as string | null | undefined
    };
  }

  async getMe(): Promise<MeResponse> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      const response = await firstValueFrom(
        this.http.get<MeResponse>(`${environment.apiBaseUrl}/api/me`, {
          headers: this.auth.getAuthHeaders(token),
        })
      );
      
      // Processar profile para garantir URLs completas
      if (response.profile) {
        response.profile = this.processProfile(response.profile) ?? (response.profile || undefined);
      }
      
      return response;
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
      const response = await firstValueFrom(
        this.http.get<{ profile: ApiProfile }>(`${environment.apiBaseUrl}/api/profile`, {
          headers: this.auth.getAuthHeaders(token),
        })
      );
      
      // Processar profile para garantir URLs completas
      if (response.profile) {
        const processed = this.processProfile(response.profile);
        response.profile = processed as ApiProfile;
      }
      
      return response;
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
    interest_area_ids?: string[] | null;
  }): Promise<{ message?: string; profile?: ApiProfile; interest_areas?: InterestAreaRef[] }> {
    const token = this.auth.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      const response = await firstValueFrom(
        this.http.put<{ message?: string; profile?: ApiProfile; interest_areas?: InterestAreaRef[] }>(
          `${environment.apiBaseUrl}/api/profile`,
          payload,
          { headers: this.auth.getAuthHeaders(token) }
        )
      );
      
      // Processar profile para garantir URLs completas
      if (response.profile) {
        const processed = this.processProfile(response.profile);
        response.profile = processed as ApiProfile | undefined;
      }
      
      return response;
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
      const response = await firstValueFrom(
        this.http.post<{ message?: string; avatar_url?: string }>(
          `${environment.apiBaseUrl}/api/profile/avatar`,
          formData,
          { headers: this.auth.getAuthHeaders(token) }
        )
      );
      
      // Processar URL para garantir que é completa
      if (response.avatar_url) {
        const completeUrl = this.ensureCompleteAvatarUrl(response.avatar_url);
        response.avatar_url = (completeUrl ?? undefined) as string | undefined;
      }
      
      return response;
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
      const normalized = new Error(error.error?.message || error.message || `HTTP ${error.status}`);
      // Preserva status e erros de validação por campo — sem isto, quem apanha
      // este Error perde por completo a distinção entre 401/404/422/500 e as
      // mensagens específicas que o Laravel devolve em error.error.errors.
      return Object.assign(normalized, {
        status: error.status,
        errors: error.error?.errors as Record<string, string[]> | undefined,
      });
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(fallback);
  }
}
