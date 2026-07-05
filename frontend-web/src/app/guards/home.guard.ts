import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const homeGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.parseUrl('/landing');
  }

  const sessionReady = await authService.ensureSession();

  if (sessionReady) {
    return true;
  }

  return router.parseUrl('/landing');
};
