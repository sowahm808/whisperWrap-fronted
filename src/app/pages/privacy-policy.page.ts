import { Component } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard" text="Dashboard" />
        </ion-buttons>
        <ion-title>Privacy Policy</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell legal-shell">
        <section class="hero-copy">
          <p class="eyebrow">Privacy Policy</p>
          <h1>Your privacy matters.</h1>
          <p class="muted">
            This policy explains what WhisperWrap collects, why we collect it, and how we protect the
            messages you create and share.
          </p>
        </section>

        <ion-card class="form-card legal-card">
          <ion-card-content>
            <p class="legal-updated">Last updated: July 7, 2026</p>

            <section>
              <h2>Information we collect</h2>
              <p>
                We collect account information such as your name, email address, authentication provider,
                subscription status, and the WhisperWrap details you choose to save, including recipient
                names, delivery preferences, message drafts, and review status.
              </p>
            </section>

            <section>
              <h2>How we use information</h2>
              <p>
                We use your information to provide secure access to your account, create and manage
                WhisperWrap messages, show recent activity on your dashboard, improve reliability, prevent
                misuse, and communicate important service updates.
              </p>
            </section>

            <section>
              <h2>Message privacy</h2>
              <p>
                WhisperWrap is designed for consent-first sharing. Recipients should only receive and unwrap
                messages in ways that respect their choice, safety, and boundaries. Avoid storing sensitive
                information that you do not have permission to share.
              </p>
            </section>

            <section>
              <h2>Sharing and service providers</h2>
              <p>
                We do not sell your personal information. We may share limited data with trusted service
                providers that help us operate authentication, hosting, storage, analytics, payments, support,
                security, or legal compliance.
              </p>
            </section>

            <section>
              <h2>Your choices</h2>
              <p>
                You can update the information in your account, delete drafts you no longer need, or contact
                support to request account assistance. Some records may be retained where required for
                security, fraud prevention, legal obligations, or backup integrity.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                If you have privacy questions, contact the WhisperWrap team through the support channel
                provided in the app or on the WhisperWrap website.
              </p>
            </section>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class PrivacyPolicyPage {}
