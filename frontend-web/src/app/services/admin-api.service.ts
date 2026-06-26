import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminSummary {
  users: {
    total: number;
    active: number;
    new_today: number;
    admins: number;
  };
  access_requests: {
    pending: number;
    approved: number;
    rejected: number;
  };
  documents: {
    published: number;
    draft: number;
    review: number;
  };
  community: {
    topics_open: number;
    topics_locked: number;
    topics_archived: number;
    replies: number;
  };
  moderation: {
    reports_pending: number;
    reports_resolved: number;
    reports_dismissed: number;
  };
  recent_activity: Array<Record<string, unknown>>;
}

export interface AdminUser {
  id: string;
  email: string;
  email_verified: boolean;
  is_active: boolean;
  role: 'admin' | 'professor' | 'investigador' | 'estudante' | string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  display_name: string;
  full_name: string | null;
  institution: string | null;
  province: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  research_areas: string[] | null;
}

export interface AccessRequestRecord {
  id: string;
  user_id: string;
  access_level_id: string;
  access_level_name?: string;
  user_display_name?: string;
  user_email?: string;
  user_institution?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  justification: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export interface AccessGrantRecord {
  id: string;
  user_id: string;
  access_level_id: string;
  access_level_name?: string;
  granted_by: string | null;
  request_id: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
}

export interface ApiResult<T> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResult<AdminSummary>> {
    return this.http.get<ApiEnvelope<AdminSummary>>(`${environment.apiBaseUrl}/api/admin/dashboard/summary`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AdminSummary> => ({ ok: response.status >= 200 && response.status < 300, status: response.status, data: response.body?.data })),
      catchError((error: unknown) => of(this.toFailureResult<AdminSummary>(error, 'Erro ao carregar resumo administrativo')))
    );
  }

  listUsers(params?: { search?: string; role?: string; status?: string }): Observable<ApiResult<AdminUser[]>> {
    return this.http.get<ApiEnvelope<AdminUser[]>>(`${environment.apiBaseUrl}/api/admin/users`, {
      observe: 'response',
      params: this.cleanParams(params),
    }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AdminUser[]> => ({ ok: response.status >= 200 && response.status < 300, status: response.status, data: response.body?.data ?? [] })),
      catchError((error: unknown) => of(this.toFailureResult<AdminUser[]>(error, 'Erro ao carregar utilizadores')))
    );
  }

  updateUser(id: string, payload: Partial<AdminUser> & { research_areas?: string[] }): Observable<ApiResult<AdminUser>> {
    return this.http.patch<ApiEnvelope<AdminUser>>(`${environment.apiBaseUrl}/api/admin/users/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AdminUser> => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AdminUser>(error, 'Erro ao actualizar utilizador')))
    );
  }

  deleteUser(id: string): Observable<ApiResult<null>> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/admin/users/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<null> => ({ ok: response.status >= 200 && response.status < 300, status: response.status, data: null })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar utilizador')))
    );
  }

  listAccessRequests(params?: { scope?: 'mine' | 'all'; status?: string }): Observable<ApiResult<AccessRequestRecord[]>> {
    return this.http.get<ApiEnvelope<AccessRequestRecord[]>>(`${environment.apiBaseUrl}/api/access-requests`, {
      observe: 'response',
      params: this.cleanParams(params),
    }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AccessRequestRecord[]> => ({ ok: response.status >= 200 && response.status < 300, status: response.status, data: response.body?.data ?? [] })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequestRecord[]>(error, 'Erro ao carregar pedidos de acesso')))
    );
  }

  reviewAccessRequest(id: string, payload: { status: 'approved' | 'rejected'; review_notes?: string }): Observable<ApiResult<AccessRequestRecord>> {
    return this.http.patch<ApiEnvelope<AccessRequestRecord>>(`${environment.apiBaseUrl}/api/access-requests/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AccessRequestRecord> => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequestRecord>(error, 'Erro ao rever pedido de acesso')))
    );
  }

  listAccessGrants(params?: { scope?: 'mine' | 'all' }): Observable<ApiResult<AccessGrantRecord[]>> {
    return this.http.get<ApiEnvelope<AccessGrantRecord[]>>(`${environment.apiBaseUrl}/api/access-grants`, {
      observe: 'response',
      params: this.cleanParams(params),
    }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AccessGrantRecord[]> => ({ ok: response.status >= 200 && response.status < 300, status: response.status, data: response.body?.data ?? [] })),
      catchError((error: unknown) => of(this.toFailureResult<AccessGrantRecord[]>(error, 'Erro ao carregar concessões de acesso')))
    );
  }

  revokeAccessGrant(id: string): Observable<ApiResult<AccessGrantRecord>> {
    return this.http.post<ApiEnvelope<AccessGrantRecord>>(`${environment.apiBaseUrl}/api/access-grants/${id}/revoke`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response): ApiResult<AccessGrantRecord> => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessGrantRecord>(error, 'Erro ao revogar concessão de acesso')))
    );
  }

  private cleanParams(params?: Record<string, string | undefined>): Record<string, string> {
    const cleaned: Record<string, string> = {};

    if (!params) {
      return cleaned;
    }

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  private toFailureResult<T>(error: unknown, fallbackMessage: string): ApiResult<T> {
    if (error instanceof TimeoutError) {
      return {
        ok: false,
        message: 'O servidor demorou demasiado a responder. Tente novamente em instantes.',
      };
    }

    if (error instanceof HttpErrorResponse) {
      return {
        ok: false,
        status: error.status,
        message: this.extractHttpErrorMessage(error) || error.message || `HTTP ${error.status}`,
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : fallbackMessage,
    };
  }

  private extractHttpErrorMessage(error: HttpErrorResponse): string {
    const body = error.error;

    if (typeof body === 'string') {
      return body;
    }

    if (body && typeof body === 'object') {
      if (typeof body.message === 'string') {
        return body.message;
      }

      if (body.errors && typeof body.errors === 'object') {
        const firstError = Object.values(body.errors as Record<string, unknown>)[0];

        if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
          return firstError[0];
        }
      }
    }

    return '';
  }
}


