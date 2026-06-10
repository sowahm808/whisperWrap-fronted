import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, take, timeout, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

async function getCurrentUserSafely(auth: AuthService) {
  try {
    return await auth.waitForUser();
  } catch {
    return null;
  }
}

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await getCurrentUserSafely(auth);

  return user ? true : router.createUrlTree(['/login']);
};

export const subscriberGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await getCurrentUserSafely(auth);

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const profile = await firstValueFrom(
    auth.userProfile$(user.uid).pipe(
      take(1),
      timeout(8000),
      catchError(() => of(null)),
    ),
  );

  return profile?.subscriptionStatus === 'active'
    ? true
    : router.createUrlTree(['/dashboard']);
};

export const publicUnwrapGuard: CanActivateFn = () => true;
