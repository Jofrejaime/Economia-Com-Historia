import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResult } from '../models/document-admin.models';

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CANCELLED';

/** Um pedido de subscrição, como devolvido por GET /admin/document-subscriptions. */
export interface AdminSubscription {
  id: string;
  user_id: string;
  document_id: string;
  status: SubscriptionStatus;
  started_at: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  cancelled_by: string | null;
  document_title: string;
  category_id: string | null;
  category_name: string | null;
  user_email: string;
  user_display_name: string | null;
  created_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionAdminService {
  private readonly base = `${environment.apiBaseUrl}/api/admin/document-subscriptions`;

  constructor(private http: HttpClient) {}

  /** Lista os pedidos de subscrição (paginação server-side; usamos per_page alto). */
  list(params?: { status?: string; search?: string; per_page?: number }): Observable<ApiResult<AdminSubscription[]>> {
    let httpParams = new HttpParams().set('per_page', String(params?.per_page ?? 100));
    if (params?.status && params.status !== 'todos') httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<{ data: AdminSubscription[] }>(this.base, { observe: 'response', params: httpParams }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<AdminSubscription[]>(error, 'Erro ao carregar pedidos de subscrição')))
    );
  }

  approve(id: string): Observable<ApiResult<void>> {
    return this.transition(`${this.base}/${id}/approve`, 'Erro ao aprovar o pedido');
  }

  reject(id: string): Observable<ApiResult<void>> {
    return this.transition(`${this.base}/${id}/reject`, 'Erro ao rejeitar o pedido');
  }

  cancel(id: string): Observable<ApiResult<void>> {
    return this.transition(`${this.base}/${id}/cancel`, 'Erro ao cancelar a subscrição');
  }

  private transition(url: string, fallback: string): Observable<ApiResult<void>> {
    return this.http.patch<{ message?: string }>(url, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
      })),
      catchError((error: unknown) => of(this.toFailureResult<void>(error, fallback)))
    );
  }

  private toFailureResult<T>(error: unknown, fallbackMessage: string): ApiResult<T> {
    if (error instanceof TimeoutError) {
      return { ok: false, message: 'O servidor demorou demasiado a responder. Tente novamente em instantes.' };
    }
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      const msg = typeof body === 'string' ? body : (body?.message as string | undefined);
      return { ok: false, status: error.status, message: msg || error.message || `HTTP ${error.status}` };
    }
    return { ok: false, message: error instanceof Error ? error.message : fallbackMessage };
  }
}
