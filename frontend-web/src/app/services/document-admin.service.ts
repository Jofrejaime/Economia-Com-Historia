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

@Injectable({ providedIn: 'root' })
export class DocumentAdminService {
  constructor(private http: HttpClient) {}

  getDocuments(filters?: DocumentListFilters): Observable<ApiResult<PaginatedDocumentResponse>> {
    const params = this.cleanParams(filters);
    const url = filters?.search ? `${environment.apiBaseUrl}/api/documents/search` : `${environment.apiBaseUrl}/api/documents`;

    return this.http.get<ApiEnvelope<Document[]>>(url, {
      observe: 'response',
      params,
    }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: {
          data: response.body?.data ?? [],
        },
      })),
      catchError((error: unknown) => of(this.toFailureResult<PaginatedDocumentResponse>(error, 'Erro ao carregar documentos')))
    );
  }

  getDocument(id: string): Observable<ApiResult<Document>> {
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

  updateDocument(id: string, payload: DocumentUpdatePayload): Observable<ApiResult<Document>> {
    return this.http.patch<ApiEnvelope<Document>>(`${environment.apiBaseUrl}/api/documents/${id}`, payload, {
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
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/documents/${id}`, {
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

  getCategories(): Observable<ApiResult<DocumentCategory[]>> {
    return this.http.get<ApiEnvelope<DocumentCategory[]>>(`${environment.apiBaseUrl}/api/document-categories`, {
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

  private cleanParams(filters?: DocumentListFilters): HttpParams | undefined {
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
