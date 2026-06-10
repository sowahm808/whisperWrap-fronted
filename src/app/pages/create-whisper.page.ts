import { NgFor, NgIf } from '@angular/common';
<<<<<<< HEAD
import { Component, inject } from '@angular/core';
=======
import { Component, NgZone } from '@angular/core';
>>>>>>> 09694cadd8f9c8972e00710fbc09737a516f8111
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
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
import { DeliveryFormat, WhisperInput, WhisperType, WrapStyle } from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Create WhisperWrap</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card">
          <ion-card-content>
            <form [formGroup]="form" novalidate>
              <ion-item>
                <ion-input label="Recipient name" labelPlacement="stacked" formControlName="recipientName"></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientName')">{{ messageFor('recipientName') }}</ion-text>

              <ion-item>
                <ion-input label="Recipient email" labelPlacement="stacked" type="email" formControlName="recipientEmail"></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientEmail')">{{ messageFor('recipientEmail') }}</ion-text>

              <ion-item>
                <ion-input label="Recipient phone" labelPlacement="stacked" type="tel" formControlName="recipientPhone"></ion-input>
              </ion-item>
              <ion-text class="error-text" *ngIf="messageFor('recipientPhone')">{{ messageFor('recipientPhone') }}</ion-text>

              <ion-item>
                <ion-select label="Whisper type" labelPlacement="stacked" formControlName="whisperType">
                  <ion-select-option *ngFor="let type of types" [value]="type">{{ type }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-select label="Wrap style" labelPlacement="stacked" formControlName="wrapStyle">
                  <ion-select-option *ngFor="let style of styles" [value]="style">{{ style }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-select label="Delivery format" labelPlacement="stacked" formControlName="deliveryFormat">
                  <ion-select-option *ngFor="let format of formats" [value]="format">{{ format }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-textarea
                  label="Sender intent"
                  labelPlacement="stacked"
                  formControlName="senderIntent"
                  rows="6"
                  placeholder="Share the occasion, relationship context, tone, and anything sensitive the AI should honor."
                ></ion-textarea>
              </ion-item>

              <ion-text class="error-text" *ngIf="messageFor('senderIntent')">
                {{ messageFor('senderIntent') }}
              </ion-text>

              <ion-text class="error-text" *ngIf="error">
                {{ error }}
              </ion-text>

              <ion-button expand="block" type="button" [disabled]="isGenerating" (click)="generate()">
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

  styles: WrapStyle[] = [
    'gentle',
    'prophetic',
    'elegant',
    'celebration',
    'healing',
    'reconciliation',
  ];

  formats: DeliveryFormat[] = ['text', 'audio', 'text_audio'];

  form = this.fb.group({
    recipientName: ['', [Validators.required, Validators.minLength(2)]],
    recipientEmail: ['', [Validators.required, Validators.email]],
    recipientPhone: ['', [Validators.required, Validators.minLength(7)]],
    whisperType: ['congratulations' as WhisperType, Validators.required],
    wrapStyle: ['gentle' as WrapStyle, Validators.required],
    deliveryFormat: ['text' as DeliveryFormat, Validators.required],
    senderIntent: ['', [Validators.required, Validators.minLength(20)]],
  });

<<<<<<< HEAD
  messageFor(controlName: keyof typeof this.form.controls): string {
=======
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private service: WhisperService,
    private router: Router,
    private focus: FocusService,
    private zone: NgZone,
  ) {}

  messageFor(controlName: keyof typeof this.form.controls) {
>>>>>>> 09694cadd8f9c8972e00710fbc09737a516f8111
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['minlength']) {
      return `Enter at least ${control.errors['minlength'].requiredLength} characters.`;
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

      const payload = this.form.getRawValue() as WhisperInput;
      const generated = await firstValueFrom(this.service.generate(payload));

      if (!generated) {
        this.error = 'The AI did not return a WhisperWrap draft. Please try again.';
        return;
      }

      this.service.setDraft({
        ...payload,
        ...generated,
        senderId: user.uid,
        senderName: user.displayName ?? '',
        status: 'generated',
      });

      this.focus.clearActiveElement();

      await this.router.navigateByUrl('/review-whisper', {
        replaceUrl: false,
      });
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Failed to generate WhisperWrap. Please try again.';
    } finally {
      this.isGenerating = false;
    }
<<<<<<< HEAD
=======

    const payload = this.form.getRawValue() as WhisperInput;

    this.service.generate(payload).subscribe({
      next: generated => {
        this.zone.run(() => {
          this.service.setDraft({
            ...payload,
            ...generated,
            senderId: user?.uid,
            senderName: user?.displayName ?? '',
            status: 'generated',
          });
          this.focus.clearActiveElement();
          void this.router.navigateByUrl('/review-whisper').finally(() => {
            this.isGenerating = false;
          });
        });
      },
      error: e => {
        this.zone.run(() => {
          this.error = e.message;
          this.isGenerating = false;
        });
      },
    });
>>>>>>> 09694cadd8f9c8972e00710fbc09737a516f8111
  }
}