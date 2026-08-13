import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { SmsConsentRequest, SmsConsentResponse, SmsConsentSubmission } from './models';

export type SmsConsentErrorCode =
  | 'invalid_or_expired_consent_link'
  | 'expired_consent_link'
  | 'recipient_phone_mismatch'
  | 'sms_consent_required'
  | 'sms_recipient_suppressed'
  | 'rate_limited'
  | 'unknown';

export class SmsConsentApiError extends Error {
  constructor(public readonly code: SmsConsentErrorCode) {
    super(code);
  }
}

@Injectable({ providedIn: 'root' })
export class SmsConsentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.backendUrl}/api/public/whispers`;

  getConsentRequest(token: string): Observable<SmsConsentRequest> {
    return this.http.get<SmsConsentRequest>(`${this.base}/${encodeURIComponent(token)}/sms-consent`)
      .pipe(catchError(error => this.mapError(error)));
  }

  submitConsent(token: string, payload: SmsConsentSubmission): Observable<SmsConsentResponse> {
    return this.http.post<SmsConsentResponse>(`${this.base}/${encodeURIComponent(token)}/sms-consent`, payload)
      .pipe(catchError(error => this.mapError(error)));
  }

  private mapError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const candidate = error.error?.code ?? error.error?.error;
      const known: SmsConsentErrorCode[] = [
        'invalid_or_expired_consent_link', 'expired_consent_link', 'recipient_phone_mismatch',
        'sms_consent_required', 'sms_recipient_suppressed', 'rate_limited',
      ];
      const code = known.includes(candidate) ? candidate : 'unknown';
      return throwError(() => new SmsConsentApiError(code));
    }
    return throwError(() => new SmsConsentApiError('unknown'));
  }
}
