import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
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
        <ion-title>WhisperWrap</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <section class="hero-copy">
          <p class="eyebrow">WhisperComp MVP</p>
          <h1>Send a thoughtful, consent-based WhisperWrap.</h1>
          <p>Log in to draft, review, and send a scripture-centered message.</p>
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

              <ion-button expand="block" type="submit" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Logging in...' : 'Login' }}
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
export class LoginPage {
  error = '';
  isSubmitting = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
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

  submit() {
    this.error = '';
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => {
        this.blurActiveElement();
        this.router.navigateByUrl('/dashboard');
      },
      error: e => {
        this.error = getAuthErrorMessage(e);
        this.isSubmitting = false;
      },
    });
  }

  navigateToSignup() {
    this.blurActiveElement();
    this.router.navigateByUrl('/signup');
  }

  private blurActiveElement() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
}
