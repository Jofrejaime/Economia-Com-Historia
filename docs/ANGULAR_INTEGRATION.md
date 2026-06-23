# Guia de Integração Angular (Frontend Web)

Este documento fornece as diretrizes, padrões e exemplos de código em TypeScript necessários para integrar a aplicação frontend Angular com o backend Laravel do portal **Economia Com História**.

---

## 1. Gestão de Sessão e Autenticação JWT

O backend emite um token JWT de longa duração representativo de uma sessão na tabela `user_sessions`. O frontend deve anexar este token em todas as chamadas HTTP autenticadas no cabeçalho `Authorization: Bearer <token>` ou `X-Session-Token`.

### 1.1 Exemplo de Serviço de Autenticação (`auth.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id: string;
  email: string;
  role: 'estudante' | 'investigador' | 'professor' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  public get token(): string | null {
    return localStorage.getItem('sessionToken');
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('sessionToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      })
    );
  }
}
```

---

## 2. HTTP Interceptor (`auth.interceptor.ts`)

O interceptor garante que o token armazenado é injetado automaticamente em todas as requisições enviadas ao domínio da API do backend.

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    let authReq = req;

    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado ou inválido -> Forçar logout e redirecionar
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 3. Estrutura de Módulos e Serviços de Negócio

Recomenda-se criar um serviço dedicado para cada domínio para isolar a lógica e obter consistência com o backend.

### 3.1 Exemplo de Serviço de Documentos (`document.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Document {
  id: string;
  title: string;
  author: string;
  summary: string;
  pdf_url?: string;
  likes_count: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiBaseUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(filters: any = {}): Observable<{ data: Document[] }> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<{ data: Document[] }>(this.apiUrl, { params });
  }

  likeDocument(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {});
  }
}
```

---

## 4. Paginação e Upload de Ficheiros

### 4.1 Envio de Avatar com FormData
O backend aceita upload de avatar através de pedidos `multipart/form-data` sob a rota `POST /api/profile/avatar`.

```typescript
uploadAvatar(file: File): Observable<{ message: string, avatar_url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  return this.http.post<{ message: string, avatar_url: string }>(
    `${environment.apiBaseUrl}/profile/avatar`, 
    formData
  );
}
```

### 4.2 Consumo de Rotas Paginadas (ex: Leaderboard / Tópicos)
Para requisições paginadas (como a classificação provincial), utilize os query parameters `page` e `per_page`:

```typescript
getProvincialLeaderboard(province: string, page: number = 1, perPage: number = 20): Observable<any> {
  const params = new HttpParams()
    .set('province', province)
    .set('page', page.toString())
    .set('per_page', perPage.toString());

  return this.http.get(`${environment.apiBaseUrl}/leaderboard/provincial`, { params });
}
```
