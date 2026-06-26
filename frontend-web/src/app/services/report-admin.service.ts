import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  PaginatedReports,
  Report,
  ReportActionPayload,
  ReportFilters,
  ReportUpdatePayload,
} from '../models/report-admin.models';

@Injectable({ providedIn: 'root' })
export class ReportAdminService {
  constructor(private http: HttpClient) {}

  getReports(_filters?: ReportFilters): Observable<ApiResult<PaginatedReports>> {
    return this.http.get<ApiEnvelope<Report[]>>(`${environment.apiBaseUrl}/api/reports/pending`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: {
          data: response.body?.data ?? [],
        },
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedReports>(error, 'Erro ao carregar denÃºncias')))
    );
  }

  getPending(): Observable<ApiResult<Report[]>> {
    return this.http.get<ApiEnvelope<Report[]>>(`${environment.apiBaseUrl}/api/reports/pending`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report[]>(error, 'Erro ao carregar denÃºncias pendentes')))
    );
  }

  getReport(id: string): Observable<ApiResult<Report>> {
    return this.http.get<ApiEnvelope<Report>>(`${environment.apiBaseUrl}/api/reports/${id}`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report>(error, 'Erro ao carregar denúncia')))
    );
  }

  updateReport(id: string, payload: ReportUpdatePayload): Observable<ApiResult<Report>> {
    return this.http.patch<ApiEnvelope<Report>>(`${environment.apiBaseUrl}/api/reports/${id}`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Report>(error, 'Erro ao actualizar denúncia')))
    );
  }

  executeAction(id: string, payload: ReportActionPayload): Observable<ApiResult<{ action: string }>> {
    return this.http.post<ApiEnvelope<{ action: string }>>(`${environment.apiBaseUrl}/api/reports/${id}/action`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<{ action: string }>(error, 'Erro ao executar a acção de moderação')))
    );
  }

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
