import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService); const router = inject(Router);
  if (!auth.getCurrentUser()) return router.createUrlTree(['/login']);
  return true;
};

export const subscriberGuard: CanActivateFn = async () => {
  const auth = inject(AuthService); const router = inject(Router);
  const user = auth.getCurrentUser();
  if (!user) return router.createUrlTree(['/login']);
  const snap = await new Promise<any>((resolve) => auth.userProfile$(user.uid).subscribe(resolve));
  return snap?.subscriptionStatus === 'active' ? true : router.createUrlTree(['/dashboard']);
};

export const publicUnwrapGuard: CanActivateFn = () => true;
