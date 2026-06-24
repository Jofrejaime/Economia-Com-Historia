import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface SessionUser {
  role?: string;
  display_name?: string;
  email?: string;
}

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.parseUrl('/auth/login');
  }

  const sessionReady = await authService.ensureSession();

  if (!sessionReady) {
    return router.parseUrl('/auth/login');
  }

  const user = authService.getUser() as SessionUser | null;
  const role = user?.role?.toLowerCase();

  if (role === 'admin') {
    return true;
  }

  return router.parseUrl('/home');
};
