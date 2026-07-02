import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { InterestArea, InterestAreaMetadata, CategoryShort } from '../models/interest-area-admin.models';
import { ApiResult } from '../models/badge-admin.models';
import { PaginatedResult } from './province-admin.service';

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

@Injectable({ providedIn: 'root' })
export class InterestAreaAdminService {
  constructor(private http: HttpClient) {}

  getInterestAreas(filters?: any): Observable<ApiResult<PaginatedResult<InterestArea> | InterestArea[]>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<ApiEnvelope<InterestArea[]>>(`${environment.apiBaseUrl}/api/admin/interest-areas`, { params, observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => {
        const body = response.body;
        if (body?.meta) {
          return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            data: {
              data: body.data ?? [],
              meta: body.meta
            } as PaginatedResult<InterestArea>
          };
        }
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          data: body?.data ?? []
        };
      }),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao carregar áreas de interesse')))
    );
  }

  getPublicInterestAreas(): Observable<ApiResult<InterestArea[]>> {
    return this.http.get<ApiEnvelope<InterestArea[]>>(`${environment.apiBaseUrl}/api/interest-areas`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<InterestArea[]>(error, 'Erro ao carregar áreas de interesse públicas')))
    );
  }

  getInterestArea(id: string): Observable<ApiResult<InterestArea>> {
    return this.http.get<ApiEnvelope<InterestArea>>(`${environment.apiBaseUrl}/api/admin/interest-areas/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<InterestArea>(error, 'Erro ao obter detalhes da área de interesse')))
    );
  }

  createInterestArea(payload: Partial<InterestArea>): Observable<ApiResult<InterestArea>> {
    return this.http.post<ApiEnvelope<InterestArea>>(`${environment.apiBaseUrl}/api/admin/interest-areas`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<InterestArea>(error, 'Erro ao criar área de interesse')))
    );
  }

  updateInterestArea(id: string, payload: Partial<InterestArea>): Observable<ApiResult<InterestArea>> {
    return this.http.patch<ApiEnvelope<InterestArea>>(`${environment.apiBaseUrl}/api/admin/interest-areas/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<InterestArea>(error, 'Erro ao actualizar área de interesse')))
    );
  }

  deleteInterestArea(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/interest-areas/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar área de interesse')))
    );
  }

  getCategories(): Observable<ApiResult<CategoryShort[]>> {
    return this.http.get<ApiEnvelope<CategoryShort[]>>(`${environment.apiBaseUrl}/api/admin/interest-areas/categories`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<CategoryShort[]>(error, 'Erro ao obter categorias')))
    );
  }

  getInterestAreaMetadata(id: string): Observable<ApiResult<InterestAreaMetadata>> {
    return this.http.get<ApiEnvelope<InterestAreaMetadata>>(`${environment.apiBaseUrl}/api/admin/interest-areas/${id}/metadata`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<InterestAreaMetadata>(error, 'Erro ao obter metadados da área de interesse')))
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
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object') {
      if (typeof body.message === 'string') return body.message;
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
