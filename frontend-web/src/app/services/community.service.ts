import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  CommunityCategory,
  CreateTopicPayload,
  DiscussionTopic,
  PaginatedTopicResponse,
  ReplyPayload,
  TopicMember,
  TopicMemberPayload,
  TopicReply,
  UpdateTopicPayload,
  UserLookupResult,
} from '../models/community.models';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<ApiResult<CommunityCategory[]>> {
    return this.http.get<ApiEnvelope<CommunityCategory[]>>(`${environment.apiBaseUrl}/api/community/categories`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<CommunityCategory[]>(error, 'Erro ao carregar categorias')))
    );
  }

  getTopics(params?: Record<string, string | number | undefined>): Observable<ApiResult<PaginatedTopicResponse>> {
    return this.http.get<ApiEnvelope<DiscussionTopic[]>>(`${environment.apiBaseUrl}/api/topics`, {
      observe: 'response',
      params: this.cleanParams(params),
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: {
          data: response.body?.data ?? [],
          meta: (response.body as ApiEnvelope<DiscussionTopic[]> & { meta?: PaginatedTopicResponse['meta'] })?.meta,
        },
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedTopicResponse>(error, 'Erro ao carregar tópicos')))
    );
  }

  getTopic(id: string): Observable<ApiResult<DiscussionTopic>> {
    return this.http.get<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/topics/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao carregar tópico')))
    );
  }

  createTopic(payload: CreateTopicPayload): Observable<ApiResult<DiscussionTopic>> {
    return this.http.post<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/topics`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao criar tópico')))
    );
  }

  updateTopic(id: string, payload: UpdateTopicPayload): Observable<ApiResult<DiscussionTopic>> {
    return this.http.patch<ApiEnvelope<DiscussionTopic>>(`${environment.apiBaseUrl}/api/topics/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DiscussionTopic>(error, 'Erro ao actualizar tópico')))
    );
  }

  deleteTopic(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/topics/${id}`, { observe: 'response' }).pipe(
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

  createReply(topicId: string, payload: ReplyPayload): Observable<ApiResult<TopicReply>> {
    return this.http.post<ApiEnvelope<TopicReply>>(`${environment.apiBaseUrl}/api/topics/${topicId}/replies`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicReply>(error, 'Erro ao publicar resposta')))
    );
  }

  updateReply(id: string, payload: ReplyPayload): Observable<ApiResult<TopicReply>> {
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

  likeTopic(id: string): Observable<ApiResult<null>> {
    return this.http.post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/topics/${id}/like`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao gostar do tópico')))
    );
  }

  unlikeTopic(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/topics/${id}/like`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao remover gosto do tópico')))
    );
  }

  likeReply(id: string): Observable<ApiResult<null>> {
    return this.http.post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/replies/${id}/like`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao gostar da resposta')))
    );
  }

  unlikeReply(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/replies/${id}/like`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao remover gosto da resposta')))
    );
  }

  getTopicMembers(topicId: string): Observable<ApiResult<TopicMember[]>> {
    return this.http.get<ApiEnvelope<TopicMember[]>>(`${environment.apiBaseUrl}/api/topics/${topicId}/members`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicMember[]>(error, 'Erro ao carregar membros')))
    );
  }

  inviteTopicMember(topicId: string, payload: TopicMemberPayload): Observable<ApiResult<TopicMember>> {
    return this.http.post<ApiEnvelope<TopicMember>>(`${environment.apiBaseUrl}/api/topics/${topicId}/members`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicMember>(error, 'Erro ao convidar membro')))
    );
  }

  updateTopicMember(topicId: string, userId: string, payload: TopicMemberPayload): Observable<ApiResult<TopicMember>> {
    return this.http.patch<ApiEnvelope<TopicMember>>(`${environment.apiBaseUrl}/api/topics/${topicId}/members/${userId}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicMember>(error, 'Erro ao actualizar membro')))
    );
  }

  removeTopicMember(topicId: string, userId: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/topics/${topicId}/members/${userId}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao remover membro')))
    );
  }

  joinTopic(topicId: string): Observable<ApiResult<TopicMember>> {
    return this.http.post<ApiEnvelope<TopicMember>>(`${environment.apiBaseUrl}/api/topics/${topicId}/join`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TopicMember>(error, 'Erro ao aceitar convite')))
    );
  }

  leaveTopic(topicId: string): Observable<ApiResult<null>> {
    return this.http.post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/topics/${topicId}/leave`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao sair do tópico')))
    );
  }

  searchUsers(search: string, limit = 10): Observable<ApiResult<UserLookupResult[]>> {
    return this.http.get<UserLookupResult[]>(`${environment.apiBaseUrl}/api/users/search`, {
      observe: 'response',
      params: this.cleanParams({ q: search, limit }),
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<UserLookupResult[]>(error, 'Erro ao pesquisar utilizadores')))
    );
  }

  private cleanParams(params?: Record<string, string | number | undefined>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
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
