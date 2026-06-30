import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  return from(auth.authStateReady().then(() => auth.currentUser)).pipe(
    switchMap(async user => {
      if (!user) return req;

      const token = await user.getIdToken();

      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }),
    switchMap(authReq => next(authReq)),
  );
};