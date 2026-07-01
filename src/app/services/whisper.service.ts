import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ConsentResponse, GeneratedWhisper, WhisperInput, WhisperRecord } from './models';
const DRAFT_KEY = 'whisperwrap:draft';

@Injectable({ providedIn: 'root' })
export class WhisperService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private db = inject(Firestore);
  private storage = inject(Storage);
  private base = `${environment.backendUrl}/api/whispers`;

  draft?: WhisperRecord = this.restoreDraft();

  generate(payload: WhisperInput) {
    return this.withAuthHeaders().pipe(
      switchMap(headers => this.http.post<GeneratedWhisper>(`${this.base}/generate`, payload, { headers })),
      catchError(error => this.handleError(error)),
    );
  }

  // sendConsent(payload: WhisperRecord & { senderName: string }) {
  //   return this.withAuthHeaders(true).pipe(
  //     switchMap(headers => this.http.post<ConsentResponse>(`${this.base}/send-consent`, payload, { headers })),
  //     catchError(error => this.handleError(error)),
  //   );
  // }
sendConsent(whisperId: string) {
  return this.withAuthHeaders(true).pipe(
    switchMap(headers =>
      this.http.post<ConsentResponse>(
        `${this.base}/send-consent`,
        { whisperId },
        { headers },
      ),
    ),
    catchError(error => this.handleError(error)),
  );
}
  // getUnwrap(token: string) {
  //   return this.http.get<WhisperRecord>(`${this.base}/unwrap/${encodeURIComponent(token)}`).pipe(catchError(error => this.handleError(error)));
  // }

getUnwrap(token: string) {
  return this.http.get<any>(`${this.base}/unwrap/${encodeURIComponent(token)}`).pipe(
    map(response => ({
      ...response,
      ...response.generatedContent,
      audioUrl: response.audioUrl ?? null,
      status: response.status ?? 'opened',
    }) as WhisperRecord),
    catchError(error => this.handleError(error)),
  );
}

  // acceptUnwrap(token: string) {
  //   return this.http
  //     .post<WhisperRecord>(`${this.base}/unwrap/${encodeURIComponent(token)}/accept`, {})
  //     .pipe(catchError(error => this.handleError(error)));
  // }

acceptUnwrap(token: string) {
  return this.http
    .post<any>(`${this.base}/unwrap/${encodeURIComponent(token)}/accept`, {})
    .pipe(
      map(response => ({
        ...response,
        ...response.generatedContent,
        audioUrl: response.audioUrl ?? null,
        status: response.status ?? 'accepted',
      }) as WhisperRecord),
      catchError(error => this.handleError(error)),
    );
}

  markListened(token: string) {
    return this.http
      .post(`${this.base}/unwrap/${encodeURIComponent(token)}/listened`, {})
      .pipe(catchError(error => this.handleError(error)));
  }

  setDraft(draft: WhisperRecord) {
    this.draft = draft;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  clearDraft() {
    this.draft = undefined;
    sessionStorage.removeItem(DRAFT_KEY);
  }
// async saveDraftToFirestore(draft: WhisperRecord) {
//   const payload = {
//     ...draft,
//     generatedContent: {
//       title: draft.title,
//       message: draft.message,
//       scriptureReference: draft.scriptureReference,
//       scriptureText: draft.scriptureText,
//       shortPrayer: draft.shortPrayer,
//     },
//     status: draft.status,
//     updatedAt: serverTimestamp(),
//     createdAt: draft.createdAt ?? serverTimestamp(),
//   };

//   if (draft.id) {
//     await updateDoc(doc(this.db, 'whispers', draft.id), payload);
//     return draft.id;
//   }

//   const created = await addDoc(collection(this.db, 'whispers'), payload);
//   this.setDraft({ ...draft, id: created.id });
//   return created.id;
// }
async saveDraftToFirestore(draft: WhisperRecord) {
  const generatedContent = {
    title: draft.title,
    message: draft.message,
    scriptureReference: draft.scriptureReference,
    scriptureText: draft.scriptureText,
    shortPrayer: draft.shortPrayer,
  };

  const payload = {
    ...draft,
    generatedContent,

    // backend expects this
    audioPath: draft.audioPath ?? draft.audioUrl ?? null,

    status: draft.status,
    updatedAt: serverTimestamp(),
    createdAt: draft.createdAt ?? serverTimestamp(),
  };

  if (draft.id) {
    await updateDoc(doc(this.db, 'whispers', draft.id), payload);
    return draft.id;
  }

  const created = await addDoc(collection(this.db, 'whispers'), payload);
  this.setDraft({ ...draft, id: created.id });
  return created.id;
}

  async uploadAudio(file: File, userId: string) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const audioRef = ref(this.storage, `whispers/${userId}/audio/${Date.now()}-${safeName}`);
    await uploadBytes(audioRef, file, { contentType: file.type || 'audio/mpeg' });
    return getDownloadURL(audioRef);
  }

  // private withAuthHeaders(forceRefresh = false): Observable<HttpHeaders> {
  //   return from(this.auth.token(forceRefresh)).pipe(
  //     switchMap(token => {
  //       if (!token) {
  //         return throwError(() => new Error('Please log in again before sending a WhisperWrap.'));
  //       }

  //       return from([new HttpHeaders({ Authorization: `Bearer ${token}` })]);
  //     }),
  //   );
  // }
private withAuthHeaders(forceRefresh = false): Observable<HttpHeaders> {
  return from(this.auth.waitForUser()).pipe(
    switchMap(user => {
      if (!user) {
        return throwError(() => new Error('Please log in again before sending a WhisperWrap.'));
      }

      return from(user.getIdToken(forceRefresh));
    }),
    switchMap(token =>
      from([
        new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'X-Firebase-ID-Token': token,
        }),
      ]),
    ),
  );
}
  private restoreDraft() {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? (JSON.parse(saved) as WhisperRecord) : undefined;
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
      return undefined;
    }
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string' ? error.error.message : '';

      if (backendMessage) {
        return throwError(() => new Error(backendMessage));
      }

      if (error.status === 401) {
        return throwError(() => new Error('Your login session expired. Please log in again before sending a WhisperWrap.'));
      }

      if (error.status === 403) {
        return throwError(() => new Error('Your account is not authorized to generate a WhisperWrap yet. Please check your subscription status.'));
      }

      return throwError(() => new Error('WhisperWrap service is unavailable. Please try again.'));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error('Something went wrong. Please try again.'));
  }
}
