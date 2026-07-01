import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  Badge,
  BadgePayload,
} from '../models/badge-admin.models';

@Injectable({ providedIn: 'root' })
export class BadgeAdminService {
  constructor(private http: HttpClient) {}

  getBadges(): Observable<ApiResult<Badge[]>> {
    return this.http.get<ApiEnvelope<Badge[]>>(`${environment.apiBaseUrl}/api/badges`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
        stats: response.body?.stats,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Badge[]>(error, 'Erro ao carregar badges')))
    );
  }

  createBadge(payload: BadgePayload): Observable<ApiResult<Badge>> {
    return this.http.post<ApiEnvelope<Badge>>(`${environment.apiBaseUrl}/api/badges`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Badge>(error, 'Erro ao criar badge')))
    );
  }

  updateBadge(id: string, payload: BadgePayload): Observable<ApiResult<Badge>> {
    return this.http.patch<ApiEnvelope<Badge>>(`${environment.apiBaseUrl}/api/badges/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Badge>(error, 'Erro ao atualizar badge')))
    );
  }

  toggleStatus(id: string): Observable<ApiResult<Badge>> {
    return this.http.patch<ApiEnvelope<Badge>>(`${environment.apiBaseUrl}/api/badges/${id}/toggle`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Badge>(error, 'Erro ao alternar estado do badge')))
    );
  }

  deleteBadge(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/badges/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar badge')))
    );
  }

  private toFailureResult<T>(error: unknown, fallbackMessage: string): ApiResult<T> {
    if (error instanceof TimeoutError) {
      return { ok: false, message: 'O servidor demorou demasiado a responder. Tente novamente em instantes.' };
    }

    if (error instanceof HttpErrorResponse) {
      return {
        ok: false,
        status: error.status,
        message: this.extractHttpErrorMessage(error) || error.message || `HTTP ${error.status}`,
      };
    }

    return { ok: false, message: error instanceof Error ? error.message : fallbackMessage };
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