import { NgIf } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
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
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { getAuthErrorMessage } from '../services/auth-errors';
import { AuthService } from '../services/auth.service';
import { FocusService } from '../services/focus.service';

@Component({
  standalone: true,
  imports: [
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
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <span class="brand-title">
            <img src="assets/whisperwraplogo.png" alt="" aria-hidden="true" class="brand-title-logo" />
            WhisperWrap
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell auth-shell">
        <section class="hero-copy login-hero-copy">
          <img
            src="assets/whisperwraplogo.png"
            alt="WhisperWrap logo"
            class="login-logo"
            width="220"
            height="220"
          />
          <p class="eyebrow">Private • consent-first • scripture-centered</p>
          <h1>Send meaningful words with care.</h1>
          <p>Draft, review, and share a secure WhisperWrap only after your recipient chooses to unwrap it.</p>
        </section>

        <ion-card class="form-card">
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <ion-item>
                <ion-input label="Email" labelPlacement="stacked" type="email" formControlName="email" autocomplete="email" />
              </ion-item>
              <ion-text class="error-text" *ngIf="emailMessage">{{ emailMessage }}</ion-text>

              <ion-item>
                <ion-input
                  label="Password"
                  labelPlacement="stacked"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                />
              </ion-item>
              <ion-text class="error-text" *ngIf="passwordMessage">{{ passwordMessage }}</ion-text>
              <ion-text class="error-text" *ngIf="error">{{ error }}</ion-text>

              <ion-button expand="block" type="submit" [disabled]="isSubmitting || isGoogleSubmitting">
                {{ isSubmitting ? 'Logging in...' : 'Login' }}
              </ion-button>

              <div class="auth-divider" aria-hidden="true"><span>or</span></div>

              <ion-button
                class="google-auth-button"
                expand="block"
                fill="outline"
                type="button"
                [disabled]="isSubmitting || isGoogleSubmitting"
                (click)="continueWithGoogle()"
              >
                <span class="google-mark" aria-hidden="true">G</span>
                {{ isGoogleSubmitting ? 'Connecting to Google...' : 'Continue with Google' }}
              </ion-button>
              <ion-button expand="block" fill="clear" type="button" (click)="navigateToSignup()">
                Create account
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class LoginPage implements OnInit {
  error = '';
  isSubmitting = false;
  isGoogleSubmitting = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private zone: NgZone,
    private focus: FocusService,
  ) {}

  get emailMessage() {
    const control = this.form.controls.email;

    if (!control.touched || !control.errors) return '';
    if (control.errors['required']) return 'Email is required.';
    if (control.errors['email']) return 'Enter a valid email address.';
    return '';
  }

  get passwordMessage() {
    const control = this.form.controls.password;

    if (!control.touched || !control.errors) return '';
    if (control.errors['required']) return 'Password is required.';
    return '';
  }

  ngOnInit() {
    const hadPendingGoogleRedirect = sessionStorage.getItem('googleAuthRedirectPending') === 'true';

    if (hadPendingGoogleRedirect) {
      this.isGoogleSubmitting = true;
    }

    this.auth.completeGoogleRedirect().subscribe({
      next: credential => {
        sessionStorage.removeItem('googleAuthRedirectPending');

        if (!credential) {
          this.isGoogleSubmitting = false;
          return;
        }

        this.zone.run(() => {
          void this.router.navigateByUrl('/dashboard').finally(() => {
            this.isGoogleSubmitting = false;
          });
        });
      },
      error: e => {
        sessionStorage.removeItem('googleAuthRedirectPending');

        this.zone.run(() => {
          this.error = getAuthErrorMessage(e);
          this.isGoogleSubmitting = false;
        });
      },
    });
  }

  submit() {
    this.error = '';
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => {
        this.zone.run(async () => {
          this.blurActiveElement();

          try {
            await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          } finally {
            this.isSubmitting = false;
          }
        });
      },
      error: e => {
        this.zone.run(() => {
          this.error = getAuthErrorMessage(e);
          this.isSubmitting = false;
        });
      },
    });
  }

  continueWithGoogle() {
    if (this.isSubmitting || this.isGoogleSubmitting) return;

    this.error = '';
    this.isGoogleSubmitting = true;
    this.blurActiveElement();

    this.auth.loginWithGoogle().subscribe({
      next: () => {
        this.zone.run(async () => {
          try {
            await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          } finally {
            this.isGoogleSubmitting = false;
          }
        });
      },
      error: e => {
        sessionStorage.removeItem('googleAuthRedirectPending');

        this.zone.run(() => {
          this.error = getAuthErrorMessage(e);
          this.isGoogleSubmitting = false;
        });
      },
    });
  }

  navigateToSignup() {
    this.blurActiveElement();
    void this.router.navigateByUrl('/signup', { replaceUrl: false });
  }

  private blurActiveElement() {
    this.focus.clearActiveElement();
  }
}
