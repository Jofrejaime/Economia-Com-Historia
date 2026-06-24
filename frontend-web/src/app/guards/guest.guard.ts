import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return true;
  }

  const sessionReady = await authService.ensureSession();

  if (sessionReady) {
    return router.parseUrl('/home');
  }

  return true;
};
