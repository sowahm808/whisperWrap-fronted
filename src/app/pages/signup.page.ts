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
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card">
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <ion-item>
                <ion-input label="Your name" labelPlacement="stacked" formControlName="displayName" autocomplete="name" />
              </ion-item>
              <ion-text class="error-text" *ngIf="nameMessage">{{ nameMessage }}</ion-text>

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
                  autocomplete="new-password"
                />
              </ion-item>
              <ion-text class="error-text" *ngIf="passwordMessage">{{ passwordMessage }}</ion-text>
              <ion-text class="error-text" *ngIf="error">{{ error }}</ion-text>

              <ion-button expand="block" type="submit" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Creating account...' : 'Create account' }}
              </ion-button>
              <ion-button fill="clear" expand="block" type="button" (click)="navigateToLogin()">Back to login</ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class SignupPage {
  error = '';
  isSubmitting = false;
  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  get nameMessage() {
    const control = this.form.controls.displayName;
    if (!control.touched || !control.errors) return '';
    if (control.errors['required']) return 'Your name is required.';
    if (control.errors['minlength']) return 'Enter at least 2 characters.';
    return '';
  }

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
    if (control.errors['minlength']) return 'Password must be at least 6 characters.';
    return '';
  }

  submit() {
    this.error = '';
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.auth.signup(this.form.value.email!, this.form.value.password!, this.form.value.displayName!).subscribe({
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

  navigateToLogin() {
    this.blurActiveElement();
    this.router.navigateByUrl('/login');
  }

  private blurActiveElement() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
}
