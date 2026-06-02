import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.parseUrl('/auth/login');
  }

  const sessionReady = await authService.ensureSession();

  if (sessionReady) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
