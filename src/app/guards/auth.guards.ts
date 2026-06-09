import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.waitForUser();

  return user ? true : router.createUrlTree(['/login']);
};

export const subscriberGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.waitForUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const profile = await firstValueFrom(
    auth.userProfile$(user.uid).pipe(take(1))
  );

  return profile?.subscriptionStatus === 'active'
    ? true
    : router.createUrlTree(['/dashboard']);
};

export const publicUnwrapGuard: CanActivateFn = () => true;