import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  docData,
  DocumentReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signup(email: string, password: string) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(async cred => {
        const userRef = doc(
          this.db,
          `users/${cred.user.uid}`
        ) as DocumentReference<DocumentData>;

        await setDoc(
          userRef,
          {
            email,
            subscriptionStatus: 'inactive'
          },
          { merge: true }
        );

        return cred;
      })
    );
  }

  logout() {
    return from(signOut(this.auth));
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  userProfile$(uid: string): Observable<any> {
    if (!uid) return of(null);

    const userRef = doc(
      this.db,
      `users/${uid}`
    ) as DocumentReference<DocumentData>;

    return docData(userRef, { idField: 'id' }) as Observable<any>;
  }

  async token() {
    return this.auth.currentUser?.getIdToken() ?? '';
  }
}