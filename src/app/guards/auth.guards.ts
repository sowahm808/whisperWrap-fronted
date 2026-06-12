import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

function checkAuth() {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.currentUser) return true;

  return router.createUrlTree(['/login']);
}

export const authGuard: CanActivateFn = () => checkAuth();
export const authMatchGuard: CanMatchFn = () => checkAuth();