import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
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
} from "@ionic/angular/standalone";
import { AuthService } from "../services/auth.service";

@Component({
  standalone: true,
  imports: [
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
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card class="form-card">
        <ion-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <ion-item>
              <ion-input label="Email" formControlName="email" />
            </ion-item>
            <ion-item>
              <ion-input
                type="password"
                label="Password"
                formControlName="password"
              />
            </ion-item>
            <ion-text class="error-text">{{ error }}</ion-text>
            <ion-button expand="block" type="submit">Login</ion-button>
            <ion-button
              expand="block"
              fill="clear"
              type="button"
              (click)="navigateToSignup()"
            >
              Create account
            </ion-button>
          </form>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
})
export class LoginPage {
  error = "";
  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  submit() {
    if (this.form.invalid) return;

    this.auth
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: () => {
          this.blurActiveElement();
          this.router.navigateByUrl("/dashboard");
        },
        error: (e) => (this.error = e.message),
      });
  }

  navigateToSignup() {
    this.blurActiveElement();
    this.router.navigateByUrl("/signup");
  }

  private blurActiveElement() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
