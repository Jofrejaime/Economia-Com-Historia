import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  Report,
  AccessRequest,
  AccessGrant,
  ModerationAction,
} from '../models/moderation-admin.models';

@Injectable({ providedIn: 'root' })
export class ModerationAdminService {
  constructor(private http: HttpClient) {}

  // ── Reports ──────────────────────────────────────────────────────────────

  getReports(params?: { status?: string; content_type?: string; search?: string; page?: number; per_page?: number }): Observable<ApiResult<Report[]>> {
    const httpParams = this.cleanParams(params);
    const options = httpParams ? { observe: 'response' as const, params: httpParams } : { observe: 'response' as const };

    return this.http.get<ApiEnvelope<Report[]>>(`${environment.apiBaseUrl}/api/admin/reports`, options).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report[]>(error, 'Erro ao carregar denúncias')))
    );
  }

  getReport(id: string): Observable<ApiResult<Report>> {
    return this.http.get<ApiEnvelope<Report>>(`${environment.apiBaseUrl}/api/admin/reports/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report>(error, 'Erro ao carregar detalhe da denúncia')))
    );
  }

  reviewReport(id: string, payload: { status: string; action_taken?: string }): Observable<ApiResult<Report>> {
    return this.http.patch<ApiEnvelope<Report>>(`${environment.apiBaseUrl}/api/admin/reports/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report>(error, 'Erro ao rever denúncia')))
    );
  }

  executeAction(id: string, action: string, reason?: string): Observable<ApiResult<ModerationAction>> {
    return this.http.post<ApiEnvelope<ModerationAction>>(`${environment.apiBaseUrl}/api/admin/reports/${id}/action`, { action, reason }, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<ModerationAction>(error, 'Erro ao executar acção de moderação')))
    );
  }

  // ── Access Requests ──────────────────────────────────────────────────────

  getAccessRequests(params?: { status?: string; search?: string; page?: number; per_page?: number }): Observable<ApiResult<AccessRequest[]>> {
    const httpParams = this.cleanParams(params);
    const options = httpParams ? { observe: 'response' as const, params: httpParams } : { observe: 'response' as const };

    return this.http.get<ApiEnvelope<AccessRequest[]>>(`${environment.apiBaseUrl}/api/admin/access-requests`, options).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequest[]>(error, 'Erro ao carregar solicitações de acesso')))
    );
  }

  getAccessRequest(id: string): Observable<ApiResult<AccessRequest>> {
    return this.http.get<ApiEnvelope<AccessRequest>>(`${environment.apiBaseUrl}/api/admin/access-requests/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequest>(error, 'Erro ao carregar detalhe do pedido')))
    );
  }

  createAccessRequest(payload: { user_id: string; access_level_id: string; justification?: string }): Observable<ApiResult<AccessRequest>> {
    return this.http.post<ApiEnvelope<AccessRequest>>(`${environment.apiBaseUrl}/api/admin/access-requests`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequest>(error, 'Erro ao criar solicitação de acesso')))
    );
  }

  approveAccessRequest(id: string, reviewNotes?: string): Observable<ApiResult<AccessRequest>> {
    return this.http.patch<ApiEnvelope<AccessRequest>>(`${environment.apiBaseUrl}/api/admin/access-requests/${id}/approve`, { review_notes: reviewNotes }, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequest>(error, 'Erro ao aprovar solicitação')))
    );
  }

  rejectAccessRequest(id: string, reviewNotes?: string): Observable<ApiResult<AccessRequest>> {
    return this.http.patch<ApiEnvelope<AccessRequest>>(`${environment.apiBaseUrl}/api/admin/access-requests/${id}/reject`, { review_notes: reviewNotes }, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessRequest>(error, 'Erro ao rejeitar solicitação')))
    );
  }

  // ── Access Grants ────────────────────────────────────────────────────────

  getAccessGrants(params?: { user_id?: string; access_level_id?: string; active?: boolean; page?: number; per_page?: number }): Observable<ApiResult<AccessGrant[]>> {
    const httpParams = this.cleanParams(params);
    const options = httpParams ? { observe: 'response' as const, params: httpParams } : { observe: 'response' as const };

    return this.http.get<ApiEnvelope<AccessGrant[]>>(`${environment.apiBaseUrl}/api/admin/access-grants`, options).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessGrant[]>(error, 'Erro ao carregar concessões de acesso')))
    );
  }

  revokeAccessGrant(id: string, reason?: string): Observable<ApiResult<AccessGrant>> {
    return this.http.post<ApiEnvelope<AccessGrant>>(`${environment.apiBaseUrl}/api/admin/access-grants/${id}/revoke`, { reason }, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessGrant>(error, 'Erro ao revogar concessão')))
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private cleanParams(params?: Record<string, string | number | boolean | null | undefined>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams.keys().length > 0 ? httpParams : undefined;
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
