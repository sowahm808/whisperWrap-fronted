import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  authState,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, onSnapshot, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  readonly user$ = authState(this.auth);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email.trim(), password));
  }

  loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  return from(
    signInWithPopup(this.auth, provider).then(async credential => {
      const user = credential.user;

      await setDoc(
        doc(this.db, 'users', user.uid),
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscriptionStatus: 'inactive',
          authProvider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return credential;
    }),
  );
}

  signup(email: string, password: string, displayName: string) {
    const cleanEmail = email.trim();
    const cleanDisplayName = displayName.trim();

    return from(
      createUserWithEmailAndPassword(this.auth, cleanEmail, password).then(async credential => {
        await updateProfile(credential.user, { displayName: cleanDisplayName });
        await this.saveUserProfile(credential.user, cleanDisplayName, cleanEmail, true);
        await credential.user.getIdToken(true);

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
    if (this.auth.currentUser) {
      return Promise.resolve(this.auth.currentUser);
    }

    return new Promise(resolve => {
      let settled = false;
      let unsubscribe = () => {};
      let fallbackTimer: ReturnType<typeof setTimeout>;

      const settle = (user: User | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        unsubscribe();
        resolve(user);
      };

      fallbackTimer = setTimeout(() => settle(this.auth.currentUser), 5000);
      unsubscribe = onAuthStateChanged(this.auth, settle, () => settle(this.auth.currentUser));

      if (settled) {
        unsubscribe();
      }
    });
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
    const user = await this.waitForUser();
    if (!user) return '';

    const token = await user.getIdToken();

    if (this.isFirebaseIdToken(token)) {
      return token;
    }

    const refreshedToken = await user.getIdToken(true);

    if (!this.isFirebaseIdToken(refreshedToken)) {
      throw new Error('Could not verify your sign-in session. Please log out and sign in again.');
    }

    return refreshedToken;
  }

  private saveUserProfile(user: User, displayName = user.displayName ?? '', email = user.email ?? '', isNewUser = false) {
    return setDoc(
      doc(this.db, 'users', user.uid),
      {
        email,
        displayName,
        ...(isNewUser ? { subscriptionStatus: 'inactive', createdAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  private isFirebaseIdToken(token: string) {
    const payload = this.decodeTokenPayload(token);

    if (!payload) return false;

    const expectedIssuer = `https://securetoken.google.com/${environment.firebase.projectId}`;
    const customTokenAudience = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

    return payload['iss'] === expectedIssuer && payload['aud'] === environment.firebase.projectId && payload['aud'] !== customTokenAudience;
  }

  private decodeTokenPayload(token: string): Record<string, unknown> | null {
    const payload = token.split('.')[1];

    if (!payload) return null;

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
      const decodedPayload = atob(paddedPayload);
      const parsedPayload: unknown = JSON.parse(decodedPayload);

      return typeof parsedPayload === 'object' && parsedPayload !== null ? (parsedPayload as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}
