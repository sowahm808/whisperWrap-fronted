import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { FocusService } from '../services/focus.service';
import {
  DeliveryFormat,
  RecipientGender,
  WhisperInput,
  WhisperType,
  WrapStyle,
} from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonText,
  ],

  styles: [`
    .wrap-picker {
      display: block;
      margin: 18px 0;
    }

    .wrap-picker-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0 0 12px;
      color: var(--ion-color-dark, #1f2937);
    }

    .wrap-picker-header span {
      font-weight: 700;
    }

    .wrap-picker-header small,
    .wrap-option small {
      color: var(--ion-color-medium, #64748b);
    }

    .wrap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .wrap-option {
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 18px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.88);
      color: inherit;
      cursor: pointer;
      text-align: left;
      transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
    }

    .wrap-option.selected {
      border-color: #7c3aed;
      box-shadow: 0 14px 32px rgba(124, 58, 237, 0.18);
      transform: translateY(-2px);
    }

    .wrap-preview {
      position: relative;
      display: block;
      width: 64px;
      height: 58px;
      margin-bottom: 12px;
    }

    .preview-box,
    .preview-lid,
    .preview-bow {
      position: absolute;
      display: block;
    }

    .preview-box {
      left: 8px;
      bottom: 0;
      width: 48px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--wrap-primary), var(--wrap-secondary));
    }

    .preview-lid {
      left: 4px;
      bottom: 31px;
      width: 56px;
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--wrap-secondary), var(--wrap-accent));
    }

    .preview-bow {
      left: 23px;
      bottom: 42px;
      width: 18px;
      height: 12px;
      border-radius: 999px 999px 6px 6px;
      background: var(--wrap-ribbon);
      box-shadow: -10px 3px 0 -2px var(--wrap-ribbon), 10px 3px 0 -2px var(--wrap-ribbon);
    }

    .preview-gentle { --wrap-primary: #7c3aed; --wrap-secondary: #c026d3; --wrap-accent: #f0abfc; --wrap-ribbon: #fbbf24; }
    .preview-prophetic { --wrap-primary: #312e81; --wrap-secondary: #7e22ce; --wrap-accent: #facc15; --wrap-ribbon: #facc15; }
    .preview-elegant { --wrap-primary: #111827; --wrap-secondary: #57534e; --wrap-accent: #eab308; --wrap-ribbon: #f8fafc; }
    .preview-celebration { --wrap-primary: #f97316; --wrap-secondary: #ec4899; --wrap-accent: #fde047; --wrap-ribbon: #22d3ee; }
    .preview-healing { --wrap-primary: #0f766e; --wrap-secondary: #22c55e; --wrap-accent: #99f6e4; --wrap-ribbon: #ccfbf1; }
    .preview-reconciliation { --wrap-primary: #be123c; --wrap-secondary: #f97316; --wrap-accent: #fed7aa; --wrap-ribbon: #fde68a; }
    .preview-gratitude { --wrap-primary: #ca8a04; --wrap-secondary: #f59e0b; --wrap-accent: #fef3c7; --wrap-ribbon: #fff7ed; }
    .preview-romantic { --wrap-primary: #be185d; --wrap-secondary: #f43f5e; --wrap-accent: #fecdd3; --wrap-ribbon: #ffe4e6; }
    .preview-encouragement { --wrap-primary: #2563eb; --wrap-secondary: #38bdf8; --wrap-accent: #fde047; --wrap-ribbon: #fef08a; }
    .preview-legacy { --wrap-primary: #0f172a; --wrap-secondary: #1d4ed8; --wrap-accent: #d97706; --wrap-ribbon: #fcd34d; }

    .sms-consent {
      background: #fff7ef;
      border: 1px solid #ead9ca;
      border-radius: 18px;
      margin: 1.25rem 0 0.5rem;
      padding: 1rem;
    }

    .sms-consent ion-checkbox {
      --checkbox-background-checked: var(--ion-color-primary);
      align-items: flex-start;
      font-weight: 700;
      line-height: 1.5;
    }

    .sms-disclosure {
      color: var(--ww-muted);
      font-size: 0.85rem;
      line-height: 1.55;
      margin: 0.75rem 0 0 2.25rem;
    }

    .sms-confirmations {
      color: var(--ww-ink);
      line-height: 1.55;
      margin: 0.65rem 0 0 2.25rem;
      padding-left: 1.1rem;
    }

    .sms-disclosure a {
      color: var(--ion-color-primary);
      font-weight: 700;
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Whisper</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <section class="hero-copy">
          <p class="eyebrow">Step 1 of 3</p>
          <h1>Shape the WhisperWrap.</h1>
          <p class="muted">
            Provide enough context for a thoughtful draft while keeping recipient consent at the center.
          </p>
        </section>

        <ol class="progress-steps" aria-label="WhisperWrap progress">
          <li class="active">Create</li>
          <li>Review</li>
          <li>Send</li>
        </ol>

        <ion-card class="form-card">
          <ion-card-content>
            <form [formGroup]="form" novalidate>
              <ion-item>
                <ion-input
                  label="Recipient name"
                  labelPlacement="stacked"
                  formControlName="recipientName"
                ></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientName')">
                {{ messageFor('recipientName') }}
              </ion-text>

              <ion-item>
                <ion-input
                  label="Name to address recipient by"
                  labelPlacement="stacked"
                  formControlName="recipientAddressName"
                  placeholder="Example: Mom, Auntie Grace, Pastor John"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-select
                  label="Recipient gender / pronouns"
                  labelPlacement="stacked"
                  formControlName="recipientGender"
                  interface="popover"
                >
                  <ion-select-option value="male">Male — he/him/his</ion-select-option>
                  <ion-select-option value="female">Female — she/her/her</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientGender')">
                {{ messageFor('recipientGender') }}
              </ion-text>

              <ion-item>
                <ion-input
                  label="Recipient email"
                  labelPlacement="stacked"
                  type="email"
                  formControlName="recipientEmail"
                ></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientEmail')">
                {{ messageFor('recipientEmail') }}
              </ion-text>

              <ion-item>
                <ion-input
                  label="Recipient phone"
                  labelPlacement="stacked"
                  type="tel"
                  formControlName="recipientPhone"
                ></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientPhone')">
                {{ messageFor('recipientPhone') }}
              </ion-text>

              <section class="sms-consent" aria-labelledby="sms-consent-label">
                <ion-checkbox formControlName="smsConsent" labelPlacement="end">
                  <span id="sms-consent-label">
                    <strong>I confirm that:</strong>
                  </span>
                </ion-checkbox>
                <ul class="sms-confirmations">
                  <li>I personally know this recipient.</li>
                  <li>I have permission to contact them.</li>
                  <li>They have agreed to receive my private Whisper invitation by SMS.</li>
                  <li>WhisperWrap will send a consent request before delivering my Whisper.</li>
                </ul>
                <p class="sms-disclosure">
                  By checking this box and later clicking Confirm &amp; Send Consent, I authorize WhisperWrap
                  to send this SMS. Message frequency varies, but recipients receive one initial consent
                  request and no Whisper content unless they reply YES. Message and data rates may apply.
                  Reply STOP to cancel or HELP for assistance. Consent is not a condition of purchase. See our
                  <a routerLink="/terms">Terms &amp; Conditions</a> and
                  <a routerLink="/privacy">Privacy Policy</a>.
                </p>
              </section>
              <ion-text class="error-text" *ngIf="messageFor('smsConsent')">
                You must confirm the recipient relationship and SMS permission before continuing.
              </ion-text>

              <ion-item>
                <ion-select
                  label="Whisper type"
                  labelPlacement="stacked"
                  formControlName="whisperType"
                >
                  <ion-select-option *ngFor="let type of types" [value]="type">
                    {{ formatOption(type) }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <section class="wrap-picker" aria-label="Choose wrap style">
                <div class="wrap-picker-header">
                  <span>Wrap style</span>
                  <small>Choose the recipient's unwrap animation.</small>
                </div>

                <div class="wrap-grid">
                  <button
                    *ngFor="let style of wrapStyles"
                    class="wrap-option"
                    type="button"
                    [class.selected]="form.controls.wrapStyle.value === style.value"
                    [attr.aria-pressed]="form.controls.wrapStyle.value === style.value"
                    (click)="selectWrapStyle(style.value)"
                  >
                    <span class="wrap-preview" [ngClass]="'preview-' + style.value">
                      <span class="preview-lid"></span>
                      <span class="preview-bow"></span>
                      <span class="preview-box"></span>
                    </span>
                    <strong>{{ style.label }}</strong>
                    <small>{{ style.description }}</small>
                  </button>
                </div>
              </section>

              <ion-item>
                <ion-select
                  label="Delivery format"
                  labelPlacement="stacked"
                  formControlName="deliveryFormat"
                >
                  <ion-select-option *ngFor="let format of formats" [value]="format">
                    {{ formatOption(format) }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-textarea
                  label="Prompt"
                  labelPlacement="stacked"
                  formControlName="prompt"
                  rows="6"
                  placeholder="Example: Write a gentle encouragement message for my sister who is starting a new job. Keep it warm, biblical, and hopeful."
                ></ion-textarea>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('prompt')">
                {{ messageFor('prompt') }}
              </ion-text>

              <ion-text class="error-text" *ngIf="error">
                {{ error }}
              </ion-text>

              <ion-button
                expand="block"
                type="button"
                [disabled]="isGenerating || !form.controls.smsConsent.value"
                (click)="generate()"
              >
                {{ isGenerating ? 'Drafting...' : 'Generate with AI' }}
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class CreateWhisperPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private service = inject(WhisperService);
  private router = inject(Router);
  private focus = inject(FocusService);

  error = '';
  isGenerating = false;

  types: WhisperType[] = [
    'congratulations',
    'comfort',
    'motivation',
    'forgiveness',
    'apology',
    'reconnection',
    'encouragement',
  ];

  wrapStyles: Array<{ value: WrapStyle; label: string; description: string }> = [
    { value: 'gentle', label: 'Gentle', description: 'Soft lavender comfort.' },
    { value: 'prophetic', label: 'Prophetic', description: 'Royal purple and gold.' },
    { value: 'elegant', label: 'Elegant', description: 'Polished black-tie shimmer.' },
    { value: 'celebration', label: 'Celebration', description: 'Bright confetti energy.' },
    { value: 'healing', label: 'Healing', description: 'Calm teal restoration.' },
    { value: 'reconciliation', label: 'Reconciliation', description: 'Warm rose connection.' },
    { value: 'gratitude', label: 'Gratitude', description: 'Honey-gold thankfulness.' },
    { value: 'romantic', label: 'Romantic', description: 'Tender rose glow.' },
    { value: 'encouragement', label: 'Encouragement', description: 'Hopeful blue lift.' },
    { value: 'legacy', label: 'Legacy', description: 'Deep navy meaning.' },
  ];

  formats: DeliveryFormat[] = ['text', 'audio', 'text_audio'];

  form = this.fb.group({
    recipientName: ['', [Validators.required, Validators.minLength(2)]],
    recipientAddressName: [''],
    recipientGender: [null as RecipientGender | null, Validators.required],
    recipientEmail: ['', [Validators.required, Validators.email]],
    recipientPhone: ['', [Validators.required, Validators.minLength(7)]],
    smsConsent: [false, Validators.requiredTrue],
    whisperType: ['congratulations' as WhisperType, Validators.required],
    wrapStyle: ['gentle' as WrapStyle, Validators.required],
    deliveryFormat: ['text' as DeliveryFormat, Validators.required],
    prompt: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
  });

  formatOption(value: string): string {
    return value.replace(/_/g, ' + ');
  }

  selectWrapStyle(style: WrapStyle): void {
    this.form.controls.wrapStyle.setValue(style);
    this.form.controls.wrapStyle.markAsTouched();
  }

  messageFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Enter a valid email address.';

    if (control.errors['minlength']) {
      return `Enter at least ${control.errors['minlength'].requiredLength} characters.`;
    }

    if (control.errors['maxlength']) {
      return `Enter no more than ${control.errors['maxlength'].requiredLength} characters.`;
    }

    return '';
  }

  async generate(): Promise<void> {
    if (this.isGenerating) return;

    this.error = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.isGenerating = true;

    try {
      const user = await this.auth.waitForUser();

      if (!user) {
        this.error = 'Please log in before generating a WhisperWrap.';
        return;
      }

      const raw = this.form.getRawValue();

      const recipientName = raw.recipientName?.trim() ?? '';
      const recipientAddressName = raw.recipientAddressName?.trim() || recipientName;
      const recipientGender = raw.recipientGender;
      const prompt = raw.prompt?.trim() ?? '';

      if (!recipientGender) {
        this.error = 'Please choose recipient gender / pronouns before generating.';
        return;
      }

      const senderName =
        user.displayName?.trim() ||
        user.email?.split('@')[0] ||
        'Someone';

      const payload: WhisperInput = {
        recipientName,
        recipientAddressName,
        recipientGender,
        recipientEmail: raw.recipientEmail?.trim() ?? '',
        recipientPhone: raw.recipientPhone?.trim() ?? '',
        senderName,
        whisperType: raw.whisperType as WhisperType,
        wrapStyle: raw.wrapStyle as WrapStyle,
        deliveryFormat: raw.deliveryFormat as DeliveryFormat,

        // Backend now uses this.
        prompt,

        // Keep this for existing backend/frontend compatibility.
        senderIntent: prompt,
      };

      const generated = await firstValueFrom(this.service.generate(payload));

      if (!generated) {
        this.error = 'The AI did not return a WhisperWrap draft. Please try again.';
        return;
      }

      this.service.setDraft({
        ...generated,
        ...payload,
        senderId: user.uid,
        senderName: user.displayName ?? senderName,
        status: 'generated',
      });

      this.focus.clearActiveElement();

      await this.router.navigateByUrl('/review-whisper');
    } catch (e: unknown) {
      this.error =
        e instanceof Error
          ? e.message
          : 'Failed to generate WhisperWrap. Please try again.';
    } finally {
      this.isGenerating = false;
    }
  }
}
