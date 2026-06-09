import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, onSnapshot, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom, from, of } from 'rxjs';
import { UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  readonly user$ = authState(this.auth);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email.trim(), password));
  }

  signup(email: string, password: string, displayName: string) {
    const cleanEmail = email.trim();
    const cleanDisplayName = displayName.trim();

    return from(
      createUserWithEmailAndPassword(this.auth, cleanEmail, password).then(async credential => {
        await updateProfile(credential.user, { displayName: cleanDisplayName });
        await setDoc(doc(this.db, 'users', credential.user.uid), {
          email: credential.user.email ?? cleanEmail,
          displayName: cleanDisplayName,
          subscriptionStatus: 'inactive',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return credential;
      }),
    );
  }

  logout() {
    return from(signOut(this.auth));
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  waitForUser(): Promise<User | null> {
    return firstValueFrom(this.user$);
  }

  userProfile$(uid: string): Observable<UserProfile | null> {
    if (!uid) {
      return of(null);
    }

    return new Observable(subscriber => {
      const userRef = doc(this.db, 'users', uid);
      return onSnapshot(
        userRef,
        snapshot => subscriber.next(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as UserProfile) : null),
        error => subscriber.error(error),
      );
    });
  }

  async token() {
    return this.auth.currentUser?.getIdToken() ?? '';
  }
}
