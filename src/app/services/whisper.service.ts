import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ConsentResponse, GeneratedWhisper, WhisperInput, WhisperRecord, WrapStyle } from './models';
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
//   return this.http.get<any>(`${this.base}/unwrap/${encodeURIComponent(token)}`).pipe(
//     map(response => this.normalizeUnwrapResponse(response, 'opened')),
//     catchError(error => this.handleError(error)),
//   );
// }

 

// acceptUnwrap(token: string) {
//   return this.http
//     .post<any>(`${this.base}/unwrap/${encodeURIComponent(token)}/accept`, {})
//     .pipe(
//       map(response => this.normalizeUnwrapResponse(response, 'accepted')),
//       catchError(error => this.handleError(error)),
//     );
// }

getUnwrap(token: string) {
  return this.http
    .get<any>(`${this.base}/unwrap/${encodeURIComponent(token)}`)
    .pipe(
      map(response =>
        this.normalizeUnwrapResponse(
          response,
          'opened',
          'gentle',
        ),
      ),
      catchError(error => this.handleError(error)),
    );
}

acceptUnwrap(token: string, currentWrapStyle?: WrapStyle) {
  return this.http
    .post<any>(
      `${this.base}/unwrap/${encodeURIComponent(token)}/accept`,
      {},
    )
    .pipe(
      map(response =>
        this.normalizeUnwrapResponse(
          response,
          'accepted',
          currentWrapStyle ?? 'gentle',
        ),
      ),
      catchError(error => this.handleError(error)),
    );
}

private normalizeUnwrapResponse(
  response: any,
  defaultStatus: WhisperRecord['status'],
  fallbackWrapStyle: WrapStyle = 'gentle',
): WhisperRecord {
  const source =
    response?.whisper ??
    response?.record ??
    response?.data?.whisper ??
    response?.data ??
    response ??
    {};

  const generatedContent =
    source?.generatedContent ??
    source?.generated_content ??
    response?.generatedContent ??
    response?.generated_content ??
    {};

  const returnedWrapStyle =
    source?.wrapStyle ??
    source?.wrap_style ??
    source?.style ??
    source?.wrap?.style ??
    response?.wrapStyle ??
    response?.wrap_style ??
    response?.style ??
    response?.wrap?.style;

  return this.normalizeRecord({
    ...source,
    ...generatedContent,

    // Do not turn a missing accept response value into "gentle".
    wrapStyle: this.normalizeWrapStyle(
      returnedWrapStyle ?? fallbackWrapStyle,
    ),

    audioUrl:
      source?.audioUrl ??
      source?.audio_url ??
      source?.audioPath ??
      response?.audioUrl ??
      response?.audio_url ??
      response?.audioPath ??
      null,

    status:
      source?.status ??
      response?.status ??
      defaultStatus,
  } as WhisperRecord);
}

private normalizeRecord(record: WhisperRecord): WhisperRecord {
  const rawRecord = record as WhisperRecord & {
    wrap_style?: unknown;
    style?: unknown;
  };

  return {
    ...record,

    wrapStyle: this.normalizeWrapStyle(
      record.wrapStyle ??
      rawRecord.wrap_style ??
      rawRecord.style,
    ),

    recipientAddressName:
      record.recipientAddressName?.trim() ||
      record.recipientName ||
      'Recipient',
  };
}
  markListened(token: string) {
    return this.http
      .post(`${this.base}/unwrap/${encodeURIComponent(token)}/listened`, {})
      .pipe(catchError(error => this.handleError(error)));
  }

  setDraft(draft: WhisperRecord) {
    const normalizedDraft = this.normalizeRecord(draft);
    this.draft = normalizedDraft;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(normalizedDraft));
  }

  clearDraft() {
    this.draft = undefined;
    sessionStorage.removeItem(DRAFT_KEY);
  }

async saveDraftToFirestore(draft: WhisperRecord) {
  const generatedContent = {
    title: draft.title,
    message: draft.message,
    scriptureReference: draft.scriptureReference,
    scriptureText: draft.scriptureText,
    shortPrayer: draft.shortPrayer,
  };

  const wrapStyle = this.normalizeWrapStyle(draft.wrapStyle);

  const payload = {
    ...draft,
    wrapStyle,
    wrap_style: wrapStyle,
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
      return saved ? this.normalizeRecord(JSON.parse(saved)) : undefined;
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
      return undefined;
    }
  }

  // private normalizeUnwrapResponse(response: any, defaultStatus: WhisperRecord['status']): WhisperRecord {
  //   const source = response?.whisper ?? response?.record ?? response ?? {};
  //   const generatedContent = source.generatedContent ?? response?.generatedContent ?? {};

  //   return this.normalizeRecord({
  //     ...source,
  //     ...generatedContent,
  //     wrapStyle: this.normalizeWrapStyle(
  //       source.wrapStyle ??
  //         source.wrap_style ??
  //         source.style ??
  //         response?.wrapStyle ??
  //         response?.wrap_style ??
  //         response?.style,
  //     ),
  //     audioUrl: source.audioUrl ?? response?.audioUrl ?? null,
  //     status: source.status ?? response?.status ?? defaultStatus,
  //   } as WhisperRecord);
  // }

  // private normalizeRecord(record: WhisperRecord): WhisperRecord {
  //   return {
  //     ...record,
  //     wrapStyle: this.normalizeWrapStyle(record.wrapStyle),
  //     recipientAddressName: record.recipientAddressName?.trim() || record.recipientName || 'Recipient',
  //   };
  // }

  private normalizeWrapStyle(style: unknown): WrapStyle {
    const allowedStyles: WrapStyle[] = [
      'gentle',
      'prophetic',
      'elegant',
      'celebration',
      'healing',
      'reconciliation',
      'gratitude',
      'romantic',
      'encouragement',
      'legacy',
    ];

    const normalizedStyle = typeof style === 'string' ? style.trim().toLowerCase() : style;

    return allowedStyles.includes(normalizedStyle as WrapStyle) ? (normalizedStyle as WrapStyle) : 'gentle';
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
