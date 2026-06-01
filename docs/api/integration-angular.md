# Angular Integration Guide

Complete guide for integrating the Economia com História API with Angular web application.

## Prerequisites

- Angular 17+
- TypeScript 5+
- HttpClientModule installed
- Node.js 18+

---

## 1. Environment Setup

### Install Dependencies

```bash
npm install axios
# or use Angular's HttpClient (built-in)
```

### Configure Environment Variables

**environments/environment.ts** (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiBasePath: '/api',
  tokenKey: 'auth_token',
  tokenExpiryKey: 'auth_token_expiry'
};
```

**environments/environment.prod.ts** (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.economia-historia.ao',
  apiBasePath: '/api',
  tokenKey: 'auth_token',
  tokenExpiryKey: 'auth_token_expiry'
};
```

---

## 2. Authentication Service

Create `services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  is_active: boolean;
  role: string;
  created_at: string;
  profile: {
    bio: string | null;
    avatar: string | null;
    location: string | null;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}${environment.apiBasePath}`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenRefreshTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    if (this.isLoggedIn()) {
      this.scheduleTokenRefresh();
    }
  }

  // Authentication Methods
  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation
    }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearAuth()),
      catchError(() => {
        this.clearAuth();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  refreshToken(): Observable<{ token: string; expires_at: string }> {
    return this.http.post<{ token: string; expires_at: string }>(
      `${this.apiUrl}/auth/refresh`,
      {}
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setTokenExpiry(response.expires_at);
        this.scheduleTokenRefresh();
      }),
      catchError(() => {
        this.logout().subscribe();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  // User Profile
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.setUserToStorage(user);
      }),
      catchError(this.handleError)
    );
  }

  // Password Management
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string, token: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Email Verification
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, { token }).pipe(
      catchError(this.handleError)
    );
  }

  resendVerificationEmail(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  private setTokenExpiry(expiryDate: string): void {
    localStorage.setItem(environment.tokenExpiryKey, expiryDate);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(environment.tokenExpiryKey);
    if (!expiry) return true;
    return new Date() >= new Date(expiry);
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    const expiry = localStorage.getItem(environment.tokenExpiryKey);
    if (!expiry) return;

    const expiryDate = new Date(expiry).getTime();
    const now = new Date().getTime();
    const refreshTime = expiryDate - now - (24 * 60 * 60 * 1000); // Refresh 24 hours before expiry

    if (refreshTime > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => this.logout().subscribe()
        });
      }, refreshTime);
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.setToken(response.token);
    this.setTokenExpiry(response.expires_at);
    this.currentUserSubject.next(response.user);
    this.setUserToStorage(response.user);
    this.scheduleTokenRefresh();
  }

  private clearAuth(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.tokenExpiryKey);
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
  }

  private setUserToStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## 3. HTTP Interceptor

Create `interceptors/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add token to requests
    const token = this.authService.getToken();
    if (token && !request.url.includes('refresh')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout().subscribe({
            complete: () => this.router.navigate(['/login'])
          });
        }
        return throwError(() => error);
      })
    );
  }
}
```

Register in `app.module.ts`:

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

---

## 4. Access Control Service

Create `services/access.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccessLevel {
  id: string;
  name: string;
  description: string;
  auto_grant: boolean;
  requires_approval: boolean;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  access_level_id: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface AccessGrant {
  id: string;
  user_id: string;
  access_level_id: string;
  granted_at: string;
  revoked_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private apiUrl = `${environment.apiUrl}${environment.apiBasePath}`;

  constructor(private http: HttpClient) { }

  // Access Levels
  getAccessLevels(): Observable<{ access_levels: AccessLevel[] }> {
    return this.http.get<{ access_levels: AccessLevel[] }>(
      `${this.apiUrl}/access-levels`
    );
  }

  // Access Requests
  requestAccess(accessLevelId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/access-requests`, {
      access_level_id: accessLevelId
    });
  }

  getAccessRequests(status?: string): Observable<{ access_requests: AccessRequest[] }> {
    let url = `${this.apiUrl}/access-requests`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<{ access_requests: AccessRequest[] }>(url);
  }

  getAccessRequestById(id: string): Observable<AccessRequest> {
    return this.http.get<AccessRequest>(`${this.apiUrl}/access-requests/${id}`);
  }

  // Access Grants
  getAccessGrants(): Observable<{ access_grants: AccessGrant[] }> {
    return this.http.get<{ access_grants: AccessGrant[] }>(
      `${this.apiUrl}/access-grants`
    );
  }

  hasAccessLevel(levelId: string): boolean {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userData = JSON.parse(user);
    return userData.access_grants?.some((g: AccessGrant) => g.access_level_id === levelId) || false;
  }
}
```

---

## 5. Notification Service

Create `services/notification.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}${environment.apiBasePath}`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  getNotifications(unreadOnly: boolean = false): Observable<{ notifications: Notification[] }> {
    let url = `${this.apiUrl}/notifications`;
    if (unreadOnly) {
      url += '?unread_only=true';
    }
    return this.http.get<{ notifications: Notification[] }>(url);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {}
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${notificationId}`).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  private loadUnreadCount(): void {
    this.getNotifications(true).subscribe(response => {
      this.unreadCountSubject.next(response.notifications.length);
    });
  }
}
```

---

## 6. Auth Guard

Create `guards/auth.guard.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {
  constructor(
    private router: Router,
    private accessService: AccessService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredLevel = route.data['requiredLevel'];
    
    if (!requiredLevel || this.accessService.hasAccessLevel(requiredLevel)) {
      return true;
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}
```

---

## 7. Component Examples

### Login Component

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }
}
```

**Template:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label>Email:</label>
    <input formControlName="email" type="email" class="form-control">
    <div class="error" *ngIf="submitted && f['email'].errors">
      <span *ngIf="f['email'].errors['required']">Email is required</span>
      <span *ngIf="f['email'].errors['email']">Invalid email format</span>
    </div>
  </div>

  <div class="form-group">
    <label>Password:</label>
    <input formControlName="password" type="password" class="form-control">
    <div class="error" *ngIf="submitted && f['password'].errors">
      <span *ngIf="f['password'].errors['required']">Password is required</span>
      <span *ngIf="f['password'].errors['minlength']">Minimum 8 characters</span>
    </div>
  </div>

  <button type="submit" [disabled]="loading" class="btn btn-primary">
    {{ loading ? 'Logging in...' : 'Login' }}
  </button>

  <div class="alert alert-danger" *ngIf="errorMessage">
    {{ errorMessage }}
  </div>
</form>
```

---

## 8. Routing Configuration

`app-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AccessGuard } from './guards/access.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'community',
    component: CommunityComponent,
    canActivate: [AuthGuard, AccessGuard],
    data: { requiredLevel: 'jindungo' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AccessGuard],
    data: { requiredLevel: 'restricted' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## Best Practices

✅ **DO:**
- Store tokens securely (localStorage for web is acceptable, consider httpOnly cookies)
- Implement automatic token refresh
- Use interceptors for adding headers
- Show loading states during API calls
- Handle errors gracefully
- Validate form input before submission
- Log errors for debugging

❌ **DON'T:**
- Store sensitive data in localStorage
- Make API calls in constructors
- Forget to unsubscribe from observables
- Hardcode API URLs
- Expose errors directly to users
- Skip error handling

---

**Last Updated:** June 1, 2026
