import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  GamificationDashboard,
  Leaderboard,
  LeaderboardSnapshot,
  PointTransaction,
  QuizAttempt,
  PaginatedResult,
} from '../models/gamification-admin.models';
import { ApiEnvelope, ApiResult } from '../models/badge-admin.models';

@Injectable({ providedIn: 'root' })
export class GamificationAdminService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResult<GamificationDashboard>> {
    return this.http.get<ApiEnvelope<GamificationDashboard>>(`${environment.apiBaseUrl}/api/admin/gamification/dashboard`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<GamificationDashboard>(error, 'Erro ao carregar dashboard de gamificação')))
    );
  }

  getLeaderboard(filters?: any): Observable<ApiResult<Leaderboard>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/leaderboard`, { params, observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body, // Leaderboard returns scope, entries, last_updated etc directly
      })),
      catchError((error: unknown) => of(this.toFailureResult<Leaderboard>(error, 'Erro ao carregar leaderboard')))
    );
  }

  adjustPoints(userId: string, points: number, description?: string): Observable<ApiResult<any>> {
    return this.http.post<ApiEnvelope<any>>(
      `${environment.apiBaseUrl}/api/admin/gamification/adjust-points`,
      { user_id: userId, points, description: description || null },
      { observe: 'response' }
    ).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao ajustar pontos')))
    );
  }

  refreshLeaderboard(): Observable<ApiResult<null>> {
    return this.http.post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/leaderboard/refresh`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao atualizar cache do leaderboard')))
    );
  }

  getSnapshots(limit?: number): Observable<ApiResult<LeaderboardSnapshot[]>> {
    let params: any = {};
    if (limit) {
      params['limit'] = limit.toString();
    }
    return this.http.get<ApiEnvelope<LeaderboardSnapshot[]>>(`${environment.apiBaseUrl}/api/admin/leaderboard/snapshots`, { params, observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<LeaderboardSnapshot[]>(error, 'Erro ao carregar snapshots do leaderboard')))
    );
  }

  getPointTransactions(filters?: any): Observable<ApiResult<PaginatedResult<PointTransaction>>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/point-transactions`, { params, observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body, // Paginated wrapper returns data, stats, meta
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedResult<PointTransaction>>(error, 'Erro ao carregar transações de pontos')))
    );
  }

  getPointTransaction(id: string): Observable<ApiResult<PointTransaction>> {
    return this.http.get<ApiEnvelope<PointTransaction>>(`${environment.apiBaseUrl}/api/admin/point-transactions/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<PointTransaction>(error, 'Erro ao carregar transação de pontos')))
    );
  }

  exportPointTransactions(filters?: any): Observable<ApiResult<{ csv: string }>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/point-transactions/export`, { params, observe: 'response' }).pipe(
      timeout({ first: 30000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body,
      })),
      catchError((error: unknown) => of(this.toFailureResult<{ csv: string }>(error, 'Erro ao exportar transações')))
    );
  }

  getQuizAttempts(filters?: any): Observable<ApiResult<PaginatedResult<QuizAttempt>>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/quiz-attempts`, { params, observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body,
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedResult<QuizAttempt>>(error, 'Erro ao carregar tentativas de quiz')))
    );
  }

  getQuizAttempt(id: string): Observable<ApiResult<QuizAttempt>> {
    return this.http.get<ApiEnvelope<QuizAttempt>>(`${environment.apiBaseUrl}/api/admin/quiz-attempts/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<QuizAttempt>(error, 'Erro ao carregar tentativa de quiz')))
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
