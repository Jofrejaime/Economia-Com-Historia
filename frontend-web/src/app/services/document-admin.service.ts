import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiEnvelope,
  ApiResult,
  AccessLevel,
  Document,
  DocumentCategory,
  DocumentListFilters,
  DocumentUpdatePayload,
  PaginatedDocumentResponse,
} from '../models/document-admin.models';

export interface TagRecord {
  id: string;
  name: string;
  slug: string;
  documents_count?: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentAdminService {
  constructor(private http: HttpClient) {}

  getDocuments(filters?: DocumentListFilters): Observable<ApiResult<any>> {
    const params = this.cleanParams(filters);
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/documents`, {
      observe: 'response',
      params,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao carregar documentos')))
    );
  }

  getDocument(id: string): Observable<ApiResult<Document>> {
    // Para ver detalhes, podemos usar a rota pública ou a administrativa. Rota pública /api/documents/{id} já tem contagem, likes, tags, etc.
    return this.http.get<ApiEnvelope<Document> & { tags?: Document['tags']; is_liked?: boolean; is_favorited?: boolean }>(`${environment.apiBaseUrl}/api/documents/${id}`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ? { ...response.body.data, tags: response.body.tags, is_liked: response.body.is_liked, is_favorited: response.body.is_favorited } : undefined,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Document>(error, 'Erro ao carregar documento')))
    );
  }

  createDocument(payload: DocumentUpdatePayload & { tags?: string[] }): Observable<ApiResult<Document>> {
    return this.http.post<ApiEnvelope<Document>>(`${environment.apiBaseUrl}/api/admin/documents`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Document>(error, 'Erro ao criar documento')))
    );
  }

  updateDocument(id: string, payload: DocumentUpdatePayload & { tags?: string[] }): Observable<ApiResult<Document>> {
    return this.http.patch<ApiEnvelope<Document>>(`${environment.apiBaseUrl}/api/admin/documents/${id}`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Document>(error, 'Erro ao actualizar documento')))
    );
  }

  deleteDocument(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/documents/${id}`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar documento')))
    );
  }

  publishDocument(id: string): Observable<ApiResult<Document>> {
    return this.http.patch<ApiEnvelope<Document>>(`${environment.apiBaseUrl}/api/admin/documents/${id}/publish`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Document>(error, 'Erro ao publicar documento')))
    );
  }

  unpublishDocument(id: string): Observable<ApiResult<Document>> {
    return this.http.patch<ApiEnvelope<Document>>(`${environment.apiBaseUrl}/api/admin/documents/${id}/unpublish`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Document>(error, 'Erro ao despublicar documento')))
    );
  }

  pinDocument(id: string): Observable<ApiResult<any>> {
    return this.http.patch<any>(`${environment.apiBaseUrl}/api/admin/documents/${id}/pin`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao fixar documento')))
    );
  }

  unpinDocument(id: string): Observable<ApiResult<any>> {
    return this.http.patch<any>(`${environment.apiBaseUrl}/api/admin/documents/${id}/unpin`, {}, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao desafixar documento')))
    );
  }

  getCategories(): Observable<ApiResult<DocumentCategory[]>> {
    return this.http.get<ApiEnvelope<DocumentCategory[]>>(`${environment.apiBaseUrl}/api/admin/document-categories`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<DocumentCategory[]>(error, 'Erro ao carregar categorias')))
    );
  }

  createCategory(payload: Partial<DocumentCategory>): Observable<ApiResult<DocumentCategory>> {
    return this.http.post<ApiEnvelope<DocumentCategory>>(`${environment.apiBaseUrl}/api/admin/document-categories`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DocumentCategory>(error, 'Erro ao criar categoria')))
    );
  }

  updateCategory(id: string, payload: Partial<DocumentCategory>): Observable<ApiResult<DocumentCategory>> {
    return this.http.patch<ApiEnvelope<DocumentCategory>>(`${environment.apiBaseUrl}/api/admin/document-categories/${id}`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<DocumentCategory>(error, 'Erro ao actualizar categoria')))
    );
  }

  deleteCategory(id: string): Observable<ApiResult<null>> {
    return this.http.delete<any>(`${environment.apiBaseUrl}/api/admin/document-categories/${id}`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar categoria')))
    );
  }

  getTags(params?: { q?: string; page?: number; per_page?: number; sort_by?: string; sort_direction?: string }): Observable<ApiResult<any>> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/admin/tags`, {
      observe: 'response',
      params: this.cleanParams(params),
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao carregar tags')))
    );
  }

  createTag(payload: { name: string }): Observable<ApiResult<TagRecord>> {
    return this.http.post<ApiEnvelope<TagRecord>>(`${environment.apiBaseUrl}/api/admin/tags`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TagRecord>(error, 'Erro ao criar tag')))
    );
  }

  updateTag(id: string, payload: { name: string }): Observable<ApiResult<TagRecord>> {
    return this.http.patch<ApiEnvelope<TagRecord>>(`${environment.apiBaseUrl}/api/admin/tags/${id}`, payload, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<TagRecord>(error, 'Erro ao actualizar tag')))
    );
  }

  deleteTag(id: string, confirm: boolean = false): Observable<ApiResult<any>> {
    return this.http.delete<any>(`${environment.apiBaseUrl}/api/admin/tags/${id}`, {
      observe: 'response',
      params: new HttpParams().set('confirm', String(confirm)),
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body,
      })),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao eliminar tag')))
    );
  }

  getAccessLevels(): Observable<ApiResult<AccessLevel[]>> {
    return this.http.get<ApiEnvelope<AccessLevel[]>>(`${environment.apiBaseUrl}/api/access-levels`, {
      observe: 'response',
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<AccessLevel[]>(error, 'Erro ao carregar níveis de acesso')))
    );
  }

  private cleanParams(filters?: any): HttpParams | undefined {
    if (!filters) {
      return undefined;
    }

    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'todos') {
        params = params.set(key, String(value));
      }
    }

    return params.keys().length > 0 ? params : undefined;
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
