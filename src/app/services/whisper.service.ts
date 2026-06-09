import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConsentResponse, GeneratedWhisper, WhisperInput, WhisperRecord } from './models';

const DRAFT_KEY = 'whisperwrap:draft';

@Injectable({ providedIn: 'root' })
export class WhisperService {
  private http = inject(HttpClient);
  private db = inject(Firestore);
  private storage = inject(Storage);
  private base = `${environment.backendUrl}/api/whispers`;

  draft?: WhisperRecord = this.restoreDraft();

  generate(payload: WhisperInput) {
    return this.http.post<GeneratedWhisper>(`${this.base}/generate`, payload).pipe(catchError(error => this.handleError(error)));
  }

  sendConsent(payload: WhisperRecord & { senderName: string }) {
    return this.http
      .post<ConsentResponse>(`${this.base}/send-consent`, payload)
      .pipe(catchError(error => this.handleError(error)));
  }

  getUnwrap(token: string) {
    return this.http.get<WhisperRecord>(`${this.base}/unwrap/${encodeURIComponent(token)}`).pipe(catchError(error => this.handleError(error)));
  }

  acceptUnwrap(token: string) {
    return this.http
      .post<WhisperRecord>(`${this.base}/unwrap/${encodeURIComponent(token)}/accept`, {})
      .pipe(catchError(error => this.handleError(error)));
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

  async saveDraftToFirestore(draft: WhisperRecord) {
    const payload = {
      ...draft,
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
        return throwError(() => new Error('Please log in again before generating a WhisperWrap.'));
      }

      if (error.status === 403) {
        return throwError(() => new Error('Your account is not authorized to generate a WhisperWrap yet. Please check your subscription status.'));
      }

      return throwError(() => new Error('WhisperWrap service is unavailable. Please try again.'));
    }

    return throwError(() => new Error('Something went wrong. Please try again.'));
  }
}
