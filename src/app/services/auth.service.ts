import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  login(email: string, password: string) { return from(signInWithEmailAndPassword(this.auth, email, password)); }
  signup(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then(async cred => {
      await setDoc(doc(this.db, 'users', cred.user.uid), { email, subscriptionStatus: 'inactive' }, { merge: true });
      return cred;
    }));
  }
  logout() { return from(signOut(this.auth)); }
  getCurrentUser() { return this.auth.currentUser; }
  userProfile$(uid: string): Observable<any> {
    if (!uid) {
      return of(null);
    }

    return new Observable(subscriber => {
      const userRef = doc(this.db, 'users', uid);
      return onSnapshot(
        userRef,
        snapshot => subscriber.next(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
        error => subscriber.error(error),
      );
    });
  }
  async token() { return this.auth.currentUser?.getIdToken() ?? ''; }
}
