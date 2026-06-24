import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable, catchError, map, of, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  message?: string;
  token?: string;
  user?: unknown;
}

interface RegisterResponse {
  message?: string;
  token?: string;
  user?: unknown;
  verification_token?: string;
}

interface SessionResponse {
  message?: string;
  token?: string;
  user?: unknown;
}

interface ForgotPasswordResponse {
  message?: string;
  reset_token?: string;
}

interface ResetPasswordResponse {
  message?: string;
}

interface ResendVerificationResponse {
  message?: string;
  verification_token?: string;
}

export interface LoginResult {
  ok: boolean;
  status?: number;
  message?: string;
  token?: string;
  user?: unknown;
}

export interface RegisterResult extends LoginResult {
  verificationToken?: string;
}

export interface ForgotPasswordResult {
  ok: boolean;
  status?: number;
  message?: string;
}

export interface ResetPasswordResult {
  ok: boolean;
  status?: number;
  message?: string;
}

export interface ResendVerificationResult {
  ok: boolean;
  status?: number;
  message?: string;
  verificationToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'session_token';
  private readonly userKey = 'user';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResult> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, { email, password }, { observe: 'response' })
      .pipe(
        timeout({ first: 15000 }),
        map((response) => ({
          ok: response.status === 200,
          status: response.status,
          message: response.body?.message,
          token: response.body?.token,
          user: response.body?.user,
        })),
        catchError((error: unknown) => of(this.toFailureResult(error, 'Erro ao autenticar')))
      );
  }

  register(payload: {
    display_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    full_name?: string;
    institution?: string;
    province?: string;
    role?: 'estudante' | 'investigador' | 'professor' | 'admin';
  }): Observable<RegisterResult> {
    return this.http
      .post<RegisterResponse>(`${environment.apiBaseUrl}/api/auth/register`, payload, { observe: 'response' })
      .pipe(
        timeout({ first: 15000 }),
        map((response) => ({
          ok: response.status === 201 || response.status === 200,
          status: response.status,
          message: response.body?.message,
          token: response.body?.token,
          user: response.body?.user,
          verificationToken: response.body?.verification_token,
        })),
        catchError((error: unknown) => of(this.toFailureResult(error, 'Erro ao registar')))
      );
  }

  forgotPassword(email: string): Observable<ForgotPasswordResult> {
    return this.http
      .post<ForgotPasswordResponse>(`${environment.apiBaseUrl}/api/auth/forgot-password`, { email }, { observe: 'response' })
      .pipe(
        timeout({ first: 15000 }),
        map((response) => ({
          ok: response.status === 200,
          status: response.status,
          message: response.body?.message,
        })),
        catchError((error: unknown) => of(this.toFailureResult(error, 'Erro ao solicitar redefinição')))
      );
  }

  resetPassword(payload: {
    token: string;
    password: string;
    password_confirmation: string;
  }): Observable<ResetPasswordResult> {
    return this.http
      .post<ResetPasswordResponse>(`${environment.apiBaseUrl}/api/auth/reset-password`, payload, { observe: 'response' })
      .pipe(
        timeout({ first: 15000 }),
        map((response) => ({
          ok: response.status === 200,
          status: response.status,
          message: response.body?.message,
        })),
        catchError((error: unknown) => of(this.toFailureResult(error, 'Erro ao redefinir palavra-passe')))
      );
  }

  resendVerification(email: string): Observable<ResendVerificationResult> {
    return this.http
      .post<ResendVerificationResponse>(`${environment.apiBaseUrl}/api/auth/resend-verification`, { email }, { observe: 'response' })
      .pipe(
        timeout({ first: 15000 }),
        map((response) => ({
          ok: response.status === 200,
          status: response.status,
          message: response.body?.message,
          verificationToken: response.body?.verification_token,
        })),
        catchError((error: unknown) => of(this.toFailureResult(error, 'Erro ao reenviar verificação')))
      );
  }

  setSession(token: string, user?: unknown): void {
    localStorage.setItem(this.tokenKey, token);

    if (user !== undefined) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): unknown | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  async me(): Promise<unknown> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiBaseUrl}/api/me`, {
          headers: this.getAuthHeaders(token),
        })
      );

      if (data?.user) {
        this.setSession(token, data.user);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new Error(this.extractHttpErrorMessage(error) || error.message || `HTTP ${error.status}`);
      }

      throw error instanceof Error ? error : new Error('Falha ao carregar sessão');
    }
  }

  async refresh(): Promise<string> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Sessão inexistente.');
    }

    try {
      const data = await firstValueFrom(
        this.http.post<SessionResponse>(
          `${environment.apiBaseUrl}/api/auth/refresh`,
          {},
          {
            headers: this.getAuthHeaders(token),
          }
        )
      );

      if (!data?.token) {
        throw new Error('Falha ao renovar sessão.');
      }

      const currentUser = this.getUser();
      this.setSession(data.token, currentUser ?? undefined);

      return data.token;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new Error(this.extractHttpErrorMessage(error) || error.message || `HTTP ${error.status}`);
      }

      throw error instanceof Error ? error : new Error('Falha ao renovar sessão');
    }
  }

  async ensureSession(): Promise<boolean> {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      await this.me();
      return true;
    } catch (error) {
      if (!this.isAuthenticationError(error)) {
        return true;
      }

      try {
        await this.refresh();
        await this.me();
        return true;
      } catch (refreshError) {
        if (this.isAuthenticationError(refreshError)) {
          await this.logout(false);
          return false;
        }

        return true;
      }
    }
  }

  async logout(syncServer = true): Promise<void> {
    const token = this.getToken();

    if (syncServer && token) {
      try {
        await firstValueFrom(
          this.http.post<SessionResponse>(
            `${environment.apiBaseUrl}/api/auth/logout`,
            {},
            {
              headers: this.getAuthHeaders(token),
            }
          )
        );
      } catch {
        // Se a sessão já expirou ou o backend rejeitou a chamada, limpamos o estado local na mesma.
      }
    }

    this.clearSession();
  }

  getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
  }

  private isAuthenticationError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 401 || error.status === 422;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('unauthenticated') || message.includes('invalid token') || message.includes('token missing');
    }

    return false;
  }

  private toFailureResult(error: unknown, fallbackMessage: string): { ok: false; status?: number; message: string } {
    if (error instanceof TimeoutError) {
      return {
        ok: false,
        message: 'O servidor demorou demasiado a responder. Verifique a ligação e tente novamente.',
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
