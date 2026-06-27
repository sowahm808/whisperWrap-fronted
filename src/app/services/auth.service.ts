import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  authState,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  getRedirectResult,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  readonly user$ = authState(this.auth);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email.trim(), password));
  }

  sendPasswordResetEmail(email: string) {
    return from(sendPasswordResetEmail(this.auth, email.trim()));
  }

  loginWithGoogle() {
    return from(
      signInWithPopup(this.auth, this.createGoogleProvider()).then(async credential => {
        await this.saveGoogleUserProfile(credential);
        await credential.user.getIdToken(true);
        return credential;
      }),
    );
  }

  loginWithGoogleRedirect() {
    return from(signInWithRedirect(this.auth, this.createGoogleProvider()));
  }

  completeGoogleRedirect() {
    return from(
      getRedirectResult(this.auth).then(async credential => {
        if (!credential) return null;

        await this.saveGoogleUserProfile(credential);
        await credential.user.getIdToken(true);

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

        await this.saveUserProfile({
          user: credential.user,
          displayName: cleanDisplayName,
          email: credential.user.email ?? cleanEmail,
          authProvider: 'password',
          isNewUser: true,
        });

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

  waitForUser(timeoutMs = 8000): Promise<User | null> {
    if (this.auth.currentUser) {
      return Promise.resolve(this.auth.currentUser);
    }

    return new Promise(resolve => {
      let settled = false;
      let unsubscribe: () => void = () => {};

      const settle = (user: User | null) => {
        if (settled) return;

        settled = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(user);
      };

      const timer = setTimeout(() => {
        settle(this.auth.currentUser);
      }, timeoutMs);

      unsubscribe = onAuthStateChanged(
        this.auth,
        user => settle(user),
        () => settle(this.auth.currentUser),
      );
    });
  }

  userProfile$(uid: string): Observable<UserProfile | null> {
    if (!uid) return of(null);

    return new Observable<UserProfile | null>(subscriber => {
      const userRef = doc(this.db, 'users', uid);

      return onSnapshot(
        userRef,
        snapshot => {
          subscriber.next(
            snapshot.exists()
              ? ({ id: snapshot.id, ...snapshot.data() } as UserProfile)
              : null,
          );
        },
        error => subscriber.error(error),
      );
    });
  }

  async token() {
    const user = await this.waitForUser();

    if (!user) return '';

    return user.getIdToken();
  }

  private createGoogleProvider() {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return provider;
  }

  private saveGoogleUserProfile(credential: UserCredential) {
    const user = credential.user;
    const additionalUserInfo = getAdditionalUserInfo(credential);

    return this.saveUserProfile({
      user,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      authProvider: 'google',
      isNewUser: additionalUserInfo?.isNewUser ?? false,
    });
  }

  private saveUserProfile(params: {
    user: User;
    displayName: string;
    email: string;
    authProvider: 'password' | 'google';
    isNewUser: boolean;
    photoURL?: string;
  }) {
    const { user, displayName, email, authProvider, isNewUser, photoURL } = params;

    return setDoc(
      doc(this.db, 'users', user.uid),
      {
        uid: user.uid,
        email,
        displayName,
        authProvider,
        ...(photoURL ? { photoURL } : {}),
        ...(isNewUser
          ? {
              subscriptionStatus: 'inactive',
              createdAt: serverTimestamp(),
            }
          : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}