import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonHeader, IonInput,
  IonItem, IonSpinner, IonText, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { SmsConsentLookupResponse } from '../services/models';
import { WhisperService } from '../services/whisper.service';

export type ConsentPageState = 'loading' | 'ready' | 'submitting' | 'success' | 'already-consented' | 'error';

@Component({
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, IonButton, IonCard, IonCardContent, IonCheckbox,
    IonContent, IonHeader, IonInput, IonItem, IonSpinner, IonText, IonTitle, IonToolbar],
  styles: [`
    .consent-shell { width: min(100%, 680px); }
    .brand { align-items: center; display: flex; gap: .8rem; justify-content: center; margin-bottom: 1rem; }
    .brand img { border-radius: 50%; height: 3.5rem; width: 3.5rem; }
    .brand strong { font-size: 1.35rem; }
    .status { text-align: center; padding: 2rem 1rem; }
    .status ion-spinner { display: block; margin: 0 auto 1rem; }
    .consent-choice { align-items: flex-start; background: #fff7ef; border: 1px solid #ead9ca;
      border-radius: 18px; display: flex; gap: .8rem; margin-top: 1rem; padding: 1rem; }
    .consent-choice ion-checkbox { flex: 0 0 auto; margin-top: .2rem; }
    .disclosure { line-height: 1.55; margin: 0; }
    .optional-note { color: var(--ww-muted); font-weight: 650; }
    .legal-links { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
    .legal-links a, .continue-link { color: var(--ion-color-primary); font-weight: 700; }
    .consent-choice:focus-within { outline: 3px solid rgba(var(--ion-color-primary-rgb), .2); outline-offset: 2px; }
  `],
  template: `
    <ion-header><ion-toolbar><ion-title>WhisperWrap Invitation</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <main class="page-shell consent-shell">
        <div class="brand"><img src="assets/whisperWraplogo.png" alt=""><strong>WhisperWrap</strong></div>
        <section class="hero-copy"><p class="eyebrow">Secure recipient invitation</p><h1>Continue to your Whisper.</h1>
          <p class="muted">Review your optional SMS notification preference first.</p></section>
        <ion-card class="form-card"><ion-card-content aria-live="polite">
          <div class="status" *ngIf="state === 'loading' || state === 'submitting'">
            <ion-spinner aria-hidden="true"></ion-spinner>
            <p>{{ state === 'loading' ? 'Checking your secure invitation…' : 'Saving your preference…' }}</p>
          </div>

          <form *ngIf="state === 'ready'" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <h2>Hello{{ consent?.recipientName ? ', ' + consent?.recipientName : '' }}.</h2>
            <p>{{ invitationMessage }}</p>
            <p *ngIf="consent?.maskedPhone">Notification number: <strong>{{ consent?.maskedPhone }}</strong></p>
            <h3>SMS Notifications (Optional)</h3>
            <ion-item>
              <ion-input label="Confirm or enter your mobile phone number" labelPlacement="stacked" type="tel"
                autocomplete="tel" inputmode="tel" formControlName="phoneNumber"
                placeholder="(214) 555-1234"></ion-input>
            </ion-item>
            <ion-text class="error-text" *ngIf="phoneError">{{ phoneError }}</ion-text>
            <div class="consent-choice">
              <ion-checkbox formControlName="smsConsent" aria-label="Agree to receive optional SMS notifications"></ion-checkbox>
              <p class="disclosure">I agree to receive SMS notifications from WhisperWrap regarding private Whisper messages sent to me.
                Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.</p>
            </div>
            <p class="optional-note">SMS consent is optional and is not required to receive or view a Whisper.</p>
            <p class="legal-links"><a routerLink="/privacy">Privacy Policy</a><a routerLink="/terms">Terms &amp; Conditions</a></p>
            <ion-text class="error-text" *ngIf="errorMessage">{{ errorMessage }}</ion-text>
            <ion-button expand="block" type="submit" [disabled]="submitting">Continue to Whisper</ion-button>
          </form>

          <section class="status" *ngIf="state === 'already-consented'">
            <h2>Your SMS preference has already been recorded.</h2>
            <p>You do not need to submit it again. Use your original Whisper invitation to continue.</p>
          </section>
          <section class="status" *ngIf="state === 'success'">
            <h2>Your preference has been saved.</h2>
            <p>{{ submittedWithSms ? 'The backend will send an SMS notification when permitted.' : 'You declined SMS notifications. You can still receive and view your Whisper.' }}</p>
            <a *ngIf="continueUrl" class="continue-link" [href]="continueUrl">Continue to Whisper</a>
          </section>
          <section class="status" *ngIf="state === 'error'"><h2>We couldn't open this invitation.</h2><p>{{ errorMessage }}</p></section>
        </ion-card-content></ion-card>
      </main>
    </ion-content>
  `,
})
export class SmsConsentRequestPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(WhisperService);
  private token = '';
  state: ConsentPageState = 'loading';
  consent?: SmsConsentLookupResponse;
  submitting = false;
  submittedWithSms = false;
  continueUrl = '';
  errorMessage = '';
  phoneError = '';
  readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', Validators.pattern(/^\s*(?:\+?[\d\s().-]{7,25})?\s*$/)],
    smsConsent: false,
  });

  get invitationMessage(): string {
    return this.consent?.senderName?.trim()
      ? `${this.consent.senderName.trim()} sent you a private Whisper.`
      : 'Someone you know sent you a private Whisper.';
  }

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.showInvalidLink();
      return;
    }

    try {
      this.consent = await firstValueFrom(this.service.getSmsConsent(this.token));
      if (!this.consent.valid) {
        this.showInvalidLink();
      } else if (this.consent.alreadyConsented) {
        this.state = 'already-consented';
      } else {
        this.state = 'ready';
      }
    } catch (error) {
      this.showError(error);
    }
  }

  async submit(): Promise<void> {
    if (this.submitting || this.state !== 'ready') return;
    this.phoneError = '';
    this.form.controls.phoneNumber.markAsTouched();
    const phoneNumber = this.form.controls.phoneNumber.value.trim();
    const smsConsent = this.form.controls.smsConsent.value;

    if (this.form.controls.phoneNumber.invalid || (smsConsent && !phoneNumber)) {
      this.phoneError = smsConsent
        ? 'Enter the mobile phone number that received this invitation.'
        : 'Check the phone number format or leave it blank.';
      return;
    }

    this.submitting = true;
    this.state = 'submitting';
    try {
      const response = await firstValueFrom(this.service.submitSmsConsent(this.token, { phoneNumber, smsConsent }));
      if (!response.success && !response.alreadyProcessed) throw new Error('We could not save your preference. Please try again.');
      if (response.alreadyProcessed) {
        this.state = 'already-consented';
      } else {
        this.submittedWithSms = smsConsent;
        this.continueUrl = response.unwrapUrl ?? (response.unwrapToken ? `/unwrap/${encodeURIComponent(response.unwrapToken)}` : '');
        this.state = 'success';
      }
      this.form.disable();
    } catch (error) {
      this.state = 'ready';
      this.errorMessage = error instanceof Error ? error.message : 'We could not save your preference. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  private showInvalidLink(): void {
    this.errorMessage = 'This consent link is invalid or has expired. Please ask the sender for a new Whisper invitation.';
    this.state = 'error';
  }

  private showError(error: unknown): void {
    if (error instanceof Error && error.message !== 'This consent link is invalid or has expired.') {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'This consent link is invalid or has expired. Please ask the sender for a new Whisper invitation.';
    }
    this.state = 'error';
  }
}
