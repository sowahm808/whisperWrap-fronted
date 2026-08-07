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
        <ion-title>Terms & Conditions</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell legal-shell">
        <section class="hero-copy">
          <p class="eyebrow">Terms & Conditions</p>
          <h1>Use WhisperWrap with care.</h1>
          <p class="muted">
            These terms describe the rules for using WhisperWrap and the responsibilities that come with
            creating consent-first messages.
          </p>
        </section>

        <ion-card class="form-card legal-card">
          <ion-card-content>
            <p class="legal-updated">Last updated: August 7, 2026</p>

            <section>
              <h2>About the service</h2>
              <p>
                WhisperWrap provides a private, consent-first person-to-person messaging service. Registered
                users can create a private message for someone they know, and WhisperWrap first asks that
                recipient by SMS whether they agree to receive it.
              </p>
            </section>

            <section>
              <h2>Acceptance of terms</h2>
              <p>
                By creating an account or using WhisperWrap, you agree to these terms. If you do not agree,
                do not use the service.
              </p>
            </section>

            <section>
              <h2>Consent-first use</h2>
              <p>
                You may only send Whispers to recipients with whom you have an existing personal relationship
                or who have agreed to receive SMS communications from you. You are responsible for ensuring
                every WhisperWrap is respectful, lawful, and appropriate for the recipient. Sending
                unsolicited or spam messages is prohibited. Do not use WhisperWrap to harass, threaten,
                mislead, impersonate, or share private information without permission.
              </p>
            </section>

            <section>
              <h2>SMS terms</h2>
              <p>
                By submitting a recipient's phone number and checking the SMS confirmation, you confirm that
                you personally know the recipient, have permission to contact them, and that they agreed to
                receive a private Whisper invitation. You authorize WhisperWrap to send the consent request.
                Message frequency varies. Message and data rates may apply. Recipients may reply STOP to
                cancel or HELP for assistance. Consent is not a condition of purchase.
              </p>
            </section>

            <section>
              <h2>Your content</h2>
              <p>
                You retain responsibility for the content you create. You grant WhisperWrap permission to
                host, process, store, and transmit that content only as needed to operate and improve the
                service and comply with applicable obligations.
              </p>
            </section>

            <section>
              <h2>Accounts and security</h2>
              <p>
                Keep your login credentials secure and notify us if you believe your account has been
                compromised. We may suspend access when we detect misuse, security risks, or violations of
                these terms.
              </p>
            </section>

            <section>
              <h2>Service availability</h2>
              <p>
                We work to keep WhisperWrap reliable, but we do not guarantee uninterrupted access. Features
                may change, pause, or end as the service evolves.
              </p>
            </section>

            <section>
              <h2>Limitation of liability</h2>
              <p>
                WhisperWrap is provided as-is to the fullest extent permitted by law. We are not liable for
                indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about these terms may be sent to
                <a href="mailto:support@whisperwrapapp.org">support&#64;whisperwrapapp.org</a>.
              </p>
            </section>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class TermsAndConditionsPage {}
