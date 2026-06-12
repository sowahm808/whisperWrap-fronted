import { Injectable, inject } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private auth = inject(Auth);

  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor() {
    authState(this.auth).subscribe(user => {
      this._user$.next(user);
    });
  }

  get currentUser(): User | null {
    return this._user$.value;
  }

  isAuthenticated(): boolean {
    return !!this._user$.value;
  }
}