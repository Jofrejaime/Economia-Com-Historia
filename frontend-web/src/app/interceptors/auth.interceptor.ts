import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');
  const isApiRequest = request.url.startsWith(apiBaseUrl) || request.url.startsWith('/api/');

  if (!token || !isApiRequest || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: request.headers.get('Accept') ?? 'application/json',
      },
    })
  );
};
