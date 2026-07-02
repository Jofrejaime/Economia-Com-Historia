import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import type {
  ApiEnvelope,
  ApiResult,
  CommunityCategory,
  DiscussionTopic,
  PaginatedTopicResponse,
  ReplyPayload,
  TopicReply,
  TopicVisibility,
} from '../models/community.models';

export type {
  ApiEnvelope,
  ApiResult,
  CommunityCategory,
  DiscussionTopic,
  PaginatedTopicResponse,
  ReplyPayload,
  TopicReply,
  TopicVisibility,
} from '../models/community.models';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): Record<string, string> {
    const token = this.auth.getToken();
    return token ? this.auth.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  getCategories(): Observable<ApiResult<CommunityCategory[]>> {
    return this.http.get<ApiEnvelope<CommunityCategory[]>>(`${this.base}/community/categories`, {
      observe: 'response',
      headers: this.headers,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<CommunityCategory[]>(error, 'Erro ao carregar categorias')))
    );
  }

  getTopics(params?: {
    search?: string;
    category_id?: string;
    status?: string;
    visibility?: TopicVisibility;
    page?: number;
    per_page?: number;
  }): Observable<ApiResult<PaginatedTopicResponse>> {
    const httpParams = this.cleanParams(params);

    return this.http.get<ApiEnvelope<DiscussionTopic[]>>(`${this.base}/topics`, {
      observe: 'response',
      headers: this.headers,
      params: httpParams,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
          data: {
            data: (response.body?.data ?? []).map((topic) => this.normalizeTopic(topic)),
            meta: response.body?.meta ? {
            current_page: response.body.meta['current_page'] ?? 1,
            per_page: response.body.meta['per_page'] ?? (response.body?.data ?? []).length,
            total: response.body.meta['total'] ?? (response.body?.data ?? []).length,
            last_page: response.body.meta['last_page'] ?? 1,
          } : undefined,
        },
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedTopicResponse>(error, 'Erro ao carregar tópicos')))
    );
  }

  getTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.get<ApiEnvelope<DiscussionTopic>>(`${this.base}/topics/${id}`, {
      observe: 'response',
      headers: this.headers,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao carregar tópico')))
    );
  }

  getReplies(topicId: string): Observable<ApiResult<TopicReply[]>> {
    return this.http.get<ApiEnvelope<TopicReply[]>>(`${this.base}/topics/${topicId}/replies`, {
      observe: 'response',
      headers: this.headers,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply[]>(error, 'Erro ao carregar respostas')))
    );
  }

  createReply(topicId: string, payload: ReplyPayload): Observable<ApiResult<TopicReply>> {
    return this.http.post<ApiEnvelope<TopicReply>>(`${this.base}/topics/${topicId}/replies`, payload, {
      observe: 'response',
      headers: this.headers,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply>(error, 'Erro ao criar resposta')))
    );
  }

  likeTopic(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/topics/${id}/like`, 'post', 'Erro ao gostar do tópico');
  }

  unlikeTopic(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/topics/${id}/like`, 'delete', 'Erro ao retirar gosto do tópico');
  }

  likeReply(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/replies/${id}/like`, 'post', 'Erro ao gostar da resposta');
  }

  unlikeReply(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/replies/${id}/like`, 'delete', 'Erro ao retirar gosto da resposta');
  }

  deleteTopic(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/topics/${id}`, 'delete', 'Erro ao eliminar tópico');
  }

  deleteReply(id: string): Observable<ApiResult<null>> {
    return this.simpleMutation(`${this.base}/replies/${id}`, 'delete', 'Erro ao eliminar resposta');
  }

  reportContent(payload: {
  content_type: 'document' | 'topic' | 'reply' | 'user';
  content_id: string;
  reason: 'spam' | 'inappropriate' | 'misinformation' | 'copyright' | 'off_topic' | 'other';
  description?: string;
}): Observable<ApiResult<{ id: string; status: string }>> {
  return this.http.post<{ message?: string; data?: { id: string; status: string } }>(
    `${environment.apiBaseUrl}/api/reports`,
    payload,
    { observe: 'response', headers: this.headers }
  ).pipe(
    timeout({ first: 15000 }),
    map((response) => ({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      message: response.body?.message,
      data: response.body?.data,
    })),
    catchError((error: unknown) => of(this.toFailureResult<{ id: string; status: string }>(error, 'Erro ao enviar denúncia')))
  );
}

  updateTopic(id: string, payload: {
  title?: string;
  content?: string;
  visibility?: TopicVisibility;
  members?: { user_id: string; role: string }[];
}): Observable<ApiResult<DiscussionTopic>> {
  return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${this.base}/topics/${id}`, payload, {
    observe: 'response',
    headers: this.headers,
  }).pipe(
    timeout({ first: 15000 }),
    map((response) => ({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      message: response.body?.message,
      data: response.body?.data ? this.normalizeTopic(response.body.data) : undefined,
    })),
    catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao atualizar tópico')))
  );
}

updateReply(id: string, payload: { content: string }): Observable<ApiResult<TopicReply>> {
  return this.http.patch<ApiEnvelope<TopicReply>>(`${this.base}/replies/${id}`, payload, {
    observe: 'response',
    headers: this.headers,
  }).pipe(
    timeout({ first: 15000 }),
    map((response) => ({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      message: response.body?.message,
      data: response.body?.data,
    })),
    catchError((error: unknown) => of(this.toFailureResult<TopicReply>(error, 'Erro ao atualizar resposta')))
  );
}

getTopicMembers(topicId: string): Observable<ApiResult<{ user_id: string; role: string; user?: { id: string; display_name: string | null } }[]>> {
  return this.http.get<ApiEnvelope<{ user_id: string; role: string; user?: { id: string; display_name: string | null } }[]>>(
    `${this.base}/topics/${topicId}/members`,
    { observe: 'response', headers: this.headers }
  ).pipe(
    timeout({ first: 15000 }),
    map((response) => ({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.body?.data ?? [],
    })),
    catchError((error: unknown) => of(this.toFailureResult<{ user_id: string; role: string; user?: { id: string; display_name: string | null } }[]>(error, 'Erro ao carregar membros')))
  );
}

  private simpleMutation(url: string, method: 'post' | 'delete', fallbackMessage: string): Observable<ApiResult<null>> {
    const request = method === 'post'
      ? this.http.post<ApiEnvelope<null>>(url, {}, { observe: 'response', headers: this.headers })
      : this.http.delete<ApiEnvelope<null>>(url, { observe: 'response', headers: this.headers });

    return request.pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, fallbackMessage)))
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

  private normalizeVisibility(value: string | null | undefined): TopicVisibility {
    switch ((value ?? '').toUpperCase()) {
      case 'PUBLIC':
        return 'PUBLIC';
      case 'INVITE_ONLY':
      case 'PRIVATE':
        return 'INVITE_ONLY';
      case 'CATEGORY':
      case 'RESTRICTED':
      default:
        return 'CATEGORY';
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
