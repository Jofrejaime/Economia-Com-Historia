import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  Category,
  CategoryCreatePayload,
  DiscussionTopic,
  DiscussionTopicPayload,
  TopicReply,
  TopicReplyPayload,
} from '../models/community-admin.models';

@Injectable({ providedIn: 'root' })
export class CommunityAdminService {
  constructor(private http: HttpClient) {}

  // ── Admin Categories (via /api/admin/community/categories) ──────────────

  getAdminCategories(): Observable<ApiResult<Category[]>> {
    return this.http.get<ApiEnvelope<Category[]>>(`${environment.apiBaseUrl}/api/admin/community/categories`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<Category[]>(error, 'Erro ao carregar categorias (admin)')))
    );
  }

  createAdminCategory(payload: CategoryCreatePayload): Observable<ApiResult<Category>> {
    return this.http.post<ApiEnvelope<Category>>(`${environment.apiBaseUrl}/api/admin/community/categories`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Category>(error, 'Erro ao criar categoria')))
    );
  }

  updateAdminCategory(id: string, payload: Partial<CategoryCreatePayload>): Observable<ApiResult<Category>> {
    return this.http.patch<ApiEnvelope<Category>>(`${environment.apiBaseUrl}/api/admin/community/categories/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Category>(error, 'Erro ao atualizar categoria')))
    );
  }

  deleteAdminCategory(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/community/categories/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar categoria')))
    );
  }

  // ── Admin Topics (via /api/admin/topics) ──────────────────────────────────

  getTopics(params?: { search?: string; category_id?: string; status?: string; locked?: boolean; pinned?: boolean; page?: number; per_page?: number }): Observable<ApiResult<DiscussionTopic[]>> {
    const httpParams = this.cleanParams(params);
    const options = httpParams ? { observe: 'response' as const, params: httpParams } : { observe: 'response' as const };

    return this.http.get<ApiEnvelope<DiscussionTopic[]>>(`${environment.apiBaseUrl}/api/admin/topics`, options).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: (response.body?.data ?? []).map((topic) => this.normalizeTopic(topic)),
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic[]>(error, 'Erro ao carregar tópicos')))
    );
  }

  getTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.get<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/admin/topics/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao carregar tópico')))
    );
  }

  updateTopic(id: string, payload: DiscussionTopicPayload): Observable<ApiResult<DiscussionTopic>> {
    return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/admin/topics/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao actualizar tópico')))
    );
  }

  deleteTopic(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/topics/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar tópico')))
    );
  }

  pinTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/admin/topics/${id}/pin`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao fixar tópico')))
    );
  }

  lockTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/admin/topics/${id}/lock`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao bloquear tópico')))
    );
  }

  unlockTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/admin/topics/${id}/unlock`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao desbloquear tópico')))
    );
  }

  getReplies(topicId: string): Observable<ApiResult<TopicReply[]>> {
    return this.http.get<ApiEnvelope<TopicReply[]>>(`${environment.apiBaseUrl}/api/topics/${topicId}/replies`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply[]>(error, 'Erro ao carregar respostas')))
    );
  }

  updateReply(id: string, payload: TopicReplyPayload): Observable<ApiResult<TopicReply>> {
    return this.http.patch<ApiEnvelope<TopicReply>>(`${environment.apiBaseUrl}/api/replies/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply>(error, 'Erro ao actualizar resposta')))
    );
  }

  deleteReply(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/replies/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar resposta')))
    );
  }

  acceptReply(id: string): Observable<ApiResult<TopicReply>> {
    return this.http.post<ApiEnvelope<TopicReply>>(`${environment.apiBaseUrl}/api/replies/${id}/accept`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply>(error, 'Erro ao aceitar resposta')))
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

  private normalizeTopic(topic: DiscussionTopic): DiscussionTopic {
    return {
      ...topic,
      visibility: this.normalizeVisibility(topic.visibility),
    };
  }

  private normalizeVisibility(value: string | null | undefined): 'PUBLIC' | 'INVITE_ONLY' {
    switch ((value ?? '').toUpperCase()) {
      case 'INVITE_ONLY':
      case 'PRIVATE':
        return 'INVITE_ONLY';
      case 'PUBLIC':
      default:
        return 'PUBLIC';
    }
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
