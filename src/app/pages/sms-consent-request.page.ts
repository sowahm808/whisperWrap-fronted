import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonHeader, IonInput,
  IonItem, IonSpinner, IonText, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { SmsConsentRequest, SmsConsentSubmission } from '../services/models';
import { SmsConsentApiError, SmsConsentService } from '../services/sms-consent.service';

export type ConsentPageState = 'loading' | 'ready' | 'submitting' | 'success' | 'invalid' | 'expired' | 'error';
const LEGAL_VERSION = '2026-08-13';

@Component({
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, IonButton, IonCard, IonCardContent, IonCheckbox,
    IonContent, IonHeader, IonInput, IonItem, IonSpinner, IonText, IonTitle, IonToolbar],
  styles: [`
    .consent-shell { width: min(100%, 680px); }
    .status { text-align: center; padding: 2rem 1rem; }
    .status ion-spinner { display: block; margin: 0 auto 1rem; }
    .consent-choice { align-items: flex-start; background: #fff7ef; border: 1px solid #ead9ca;
      border-radius: 18px; display: flex; gap: .8rem; margin-top: 1rem; padding: 1rem; }
    .consent-choice ion-checkbox { flex: 0 0 auto; margin-top: .2rem; }
    .disclosure { line-height: 1.55; margin: 0; }
    .disclosure strong { display: block; margin-bottom: .65rem; }
    .legal-links { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
    .legal-links a { color: var(--ion-color-primary); font-weight: 700; }
    .consent-choice:focus-within { outline: 3px solid rgba(var(--ion-color-primary-rgb), .2); outline-offset: 2px; }
  `],
  template: `
    <ion-header><ion-toolbar><ion-title>SMS Consent</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <main class="page-shell consent-shell">
        <section class="hero-copy"><p class="eyebrow">Secure recipient invitation</p><h1>Choose how you receive your Whisper.</h1></section>
        <ion-card class="form-card"><ion-card-content aria-live="polite">
          <div class="status" *ngIf="state === 'loading' || state === 'submitting'">
            <ion-spinner aria-hidden="true"></ion-spinner>
            <p>{{ state === 'loading' ? 'Checking your secure invitation…' : 'Saving your consent…' }}</p>
          </div>

          <form *ngIf="state === 'ready'" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <h2>SMS consent</h2>
            <p>{{ invitationMessage }}</p>
            <ion-item>
              <ion-input label="Mobile phone number" labelPlacement="stacked" type="tel"
                autocomplete="tel" inputmode="tel" formControlName="phoneNumber"
                placeholder="(214) 555-1234"></ion-input>
            </ion-item>
            <ion-text class="error-text" *ngIf="form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid">
              Enter a valid US mobile phone number.
            </ion-text>
            <div class="consent-choice">
              <ion-checkbox formControlName="smsConsent" aria-label="Agree to receive transactional SMS messages"></ion-checkbox>
              <p class="disclosure">
                <strong>I agree to receive transactional SMS messages from WhisperWrap relating to private Whispers sent to me.</strong>
                Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for assistance.
                Consent is voluntary and is not a condition of purchasing any goods or services.
              </p>
            </div>
            <ion-text class="error-text" *ngIf="form.controls.smsConsent.touched && form.controls.smsConsent.invalid">
              Check the consent box to continue.
            </ion-text>
            <p class="legal-links"><a routerLink="/privacy">Privacy Policy</a><a routerLink="/terms">Terms &amp; Conditions</a></p>
            <ion-text class="error-text" *ngIf="errorMessage">{{ errorMessage }}</ion-text>
            <ion-button expand="block" type="submit" [disabled]="form.invalid || submitting">Agree and send my Whisper SMS</ion-button>
          </form>

          <section class="status" *ngIf="state === 'success'">
            <h2>{{ alreadyProcessed ? 'This consent request has already been completed.' : \"You're all set.\" }}</h2>
            <ng-container *ngIf="!alreadyProcessed"><p>You agreed to receive this private Whisper by SMS.<br>Check your messages for the secure Whisper notification.</p>
            <p>You can reply STOP at any time to opt out or HELP for assistance.</p></ng-container>
          </section>
          <section class="status" *ngIf="state === 'invalid'"><h2>This consent link is invalid.</h2></section>
          <section class="status" *ngIf="state === 'expired'"><h2>This consent link has expired.</h2><p>Ask the sender to create a new invitation.</p></section>
          <section class="status" *ngIf="state === 'error'"><h2>We couldn't complete your request.</h2><p>{{ errorMessage }}</p></section>
        </ion-card-content></ion-card>
      </main>
    </ion-content>
  `,
})
export class SmsConsentRequestPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SmsConsentService);
  private token = '';
  state: ConsentPageState = 'loading';
  request?: SmsConsentRequest;
  submitting = false;
  alreadyProcessed = false;
  errorMessage = '';
  readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\s*(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\s*$/)]],
    smsConsent: [false, Validators.requiredTrue],
  });

  get invitationMessage(): string {
    return this.request?.senderName?.trim()
      ? `${this.request.senderName.trim()} would like to send you a private Whisper.`
      : 'Someone you know would like to send you a private Whisper.';
  }

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) { this.state = 'invalid'; return; }
    try {
      this.request = await firstValueFrom(this.service.getConsentRequest(this.token));
      if (this.request.alreadyConsented) { this.alreadyProcessed = true; this.state = 'success'; return; }
      if (this.request.expired) { this.state = 'expired'; return; }
      this.state = this.request.valid ? 'ready' : 'invalid';
    } catch (error) { this.handleError(error, true); }
  }

  async submit(): Promise<void> {
    if (this.submitting) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting = true;
    this.state = 'submitting';
    const payload: SmsConsentSubmission = {
      phoneNumber: this.normalizePhone(this.form.controls.phoneNumber.value), smsConsent: true,
      disclosureVersion: LEGAL_VERSION, termsVersion: LEGAL_VERSION, privacyVersion: LEGAL_VERSION,
    };
    try {
      const response = await firstValueFrom(this.service.submitConsent(this.token, payload));
      if (!response.success && !response.alreadyProcessed) throw new SmsConsentApiError('unknown');
      this.alreadyProcessed = response.alreadyProcessed === true;
      this.state = 'success';
      this.form.disable();
    } catch (error) { this.handleError(error, false); }
    finally { this.submitting = false; }
  }

  private normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    return `+${digits.length === 10 ? `1${digits}` : digits}`;
  }

  private handleError(error: unknown, loading: boolean): void {
    const code = error instanceof SmsConsentApiError ? error.code : 'unknown';
    if (code === 'expired_consent_link') { this.state = 'expired'; return; }
    if (code === 'invalid_or_expired_consent_link' && loading) { this.state = 'invalid'; return; }
    const messages: Record<string, string> = {
      invalid_or_expired_consent_link: 'This consent link is no longer available.',
      recipient_phone_mismatch: 'That phone number does not match this invitation. Check the number and try again.',
      sms_consent_required: 'You must personally agree to SMS messages before continuing.',
      sms_recipient_suppressed: 'SMS cannot be sent to this number. Contact support if you need help.',
      rate_limited: 'Too many attempts were made. Please wait and try again.',
      unknown: 'Please try again later or contact support@whisperwrapapp.org.',
    };
    this.errorMessage = messages[code];
    this.state = loading ? 'error' : 'ready';
  }
}
