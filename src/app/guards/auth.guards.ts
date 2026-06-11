import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const result = await firstValueFrom(
    authState(auth).pipe(
      take(1),
      timeout(8000),
      map(user => (user ? true : router.createUrlTree(['/login']))),
      catchError(() => of(router.createUrlTree(['/login']))),
    ),
  );

  return result;
};

export const subscriberGuard: CanActivateFn = async () => {
  const firebaseAuth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await firstValueFrom(
    authState(firebaseAuth).pipe(
      take(1),
      timeout(8000),
      catchError(() => of(null)),
    ),
  );

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const profile = await firstValueFrom(
    authService.userProfile$(user.uid).pipe(
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