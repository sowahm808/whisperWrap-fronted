import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
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
  userProfile$(uid: string): Observable<any> { return uid ? (docData(doc(this.db, 'users', uid)) as Observable<any>) : of(null); }
  async token() { return this.auth.currentUser?.getIdToken() ?? ''; }
}
