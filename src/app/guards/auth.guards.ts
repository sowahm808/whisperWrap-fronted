import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

async function checkAuth() {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.waitForUser();

  if (user) return true;

  return router.createUrlTree(['/login']);
}

export const authGuard: CanActivateFn = () => checkAuth();
export const authMatchGuard: CanMatchFn = () => checkAuth();
