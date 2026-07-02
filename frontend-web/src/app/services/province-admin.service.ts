import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Province, ProvinceStats } from '../models/province-admin.models';
import { ApiResult } from '../models/badge-admin.models';

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

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProvinceAdminService {
  constructor(private http: HttpClient) {}

  getProvinces(filters?: any): Observable<ApiResult<PaginatedResult<Province> | Province[]>> {
    let params: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key].toString();
        }
      });
    }
    return this.http.get<ApiEnvelope<Province[]>>(`${environment.apiBaseUrl}/api/admin/provinces`, { params, observe: 'response' }).pipe(
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
            } as PaginatedResult<Province>
          };
        }
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          data: body?.data ?? []
        };
      }),
      catchError((error: unknown) => of(this.toFailureResult<any>(error, 'Erro ao carregar províncias')))
    );
  }

  getPublicProvinces(): Observable<ApiResult<Province[]>> {
    return this.http.get<ApiEnvelope<Province[]>>(`${environment.apiBaseUrl}/api/provinces`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<Province[]>(error, 'Erro ao carregar províncias públicas')))
    );
  }

  getProvince(id: string): Observable<ApiResult<Province>> {
    return this.http.get<ApiEnvelope<Province>>(`${environment.apiBaseUrl}/api/admin/provinces/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Province>(error, 'Erro ao obter detalhes da província')))
    );
  }

  createProvince(payload: Partial<Province>): Observable<ApiResult<Province>> {
    return this.http.post<ApiEnvelope<Province>>(`${environment.apiBaseUrl}/api/admin/provinces`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Province>(error, 'Erro ao criar província')))
    );
  }

  updateProvince(id: string, payload: Partial<Province>): Observable<ApiResult<Province>> {
    return this.http.patch<ApiEnvelope<Province>>(`${environment.apiBaseUrl}/api/admin/provinces/${id}`, payload, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: response.body?.data,
      })),
      catchError((error: unknown) => of(this.toFailureResult<Province>(error, 'Erro ao actualizar província')))
    );
  }

  deleteProvince(id: string): Observable<ApiResult<null>> {
    return this.http.delete<ApiEnvelope<null>>(`${environment.apiBaseUrl}/api/admin/provinces/${id}`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message: response.body?.message,
        data: null,
      })),
      catchError((error: unknown) => of(this.toFailureResult<null>(error, 'Erro ao eliminar província')))
    );
  }

  getProvinceStatistics(): Observable<ApiResult<ProvinceStats[]>> {
    return this.http.get<ApiEnvelope<ProvinceStats[]>>(`${environment.apiBaseUrl}/api/admin/provinces/statistics`, { observe: 'response' }).pipe(
      timeout({ first: 15000 }),
      map((response) => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.body?.data ?? [],
      })),
      catchError((error: unknown) => of(this.toFailureResult<ProvinceStats[]>(error, 'Erro ao obter estatísticas das províncias')))
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
