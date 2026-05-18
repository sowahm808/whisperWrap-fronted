import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GeneratedWhisper, WhisperInput, WhisperRecord } from './models';

@Injectable({ providedIn: 'root' })
export class WhisperService {
  private base = `${environment.backendUrl}/api/whispers`;
  draft?: WhisperRecord;
  constructor(private http: HttpClient) {}
  generate(payload: WhisperInput) { return this.http.post<GeneratedWhisper>(`${this.base}/generate`, payload); }
  sendConsent(payload: WhisperRecord & { senderName: string }) { return this.http.post(`${this.base}/send-consent`, payload); }
  getUnwrap(token: string) { return this.http.get<WhisperRecord>(`${this.base}/unwrap/${token}`); }
  acceptUnwrap(token: string) { return this.http.post(`${this.base}/unwrap/${token}/accept`, {}); }
}
