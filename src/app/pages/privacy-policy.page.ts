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
            <p class="legal-updated">Last updated: August 7, 2026</p>

            <section>
              <h2>Who we are</h2>
              <p>
                WhisperWrap operates a private, consent-first person-to-person messaging service. This
                Privacy Policy applies to the WhisperWrap website, application, and SMS program.
              </p>
            </section>

            <section>
              <h2>Information we collect</h2>
              <p>
                We collect account information such as your name, email address, authentication provider,
                subscription status, and the WhisperWrap details you choose to save, including recipient
                names, email addresses, phone numbers, delivery preferences, message drafts, consent and
                opt-out records, and review status.
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
              <h2>SMS Messaging</h2>
              <p>
                WhisperWrap collects recipient phone numbers solely to deliver private Whisper invitations
                and consent messages requested by registered users. Phone numbers and SMS consent records are
                never sold, rented, or shared with third parties or affiliates for marketing or promotional
                purposes. Recipients receive one initial consent request before any Whisper is delivered. If
                the recipient does not consent, no Whisper content is sent. Message frequency varies. Message
                and data rates may apply. Recipients can reply STOP to cancel or HELP for assistance.
              </p>
            </section>

            <section>
              <h2>Sharing and service providers</h2>
              <p>
                We do not sell your personal information. We disclose only the data needed to service
                providers acting on our behalf, including Twilio for SMS delivery and Firebase for
                authentication, hosting, and storage. Providers may use this data only to perform services for
                WhisperWrap or meet legal obligations. SMS opt-in data and consent are not shared with third
                parties for their own marketing purposes.
              </p>
            </section>

            <section>
              <h2>Data retention and your choices</h2>
              <p>
                We retain account and message information only as long as needed to provide the service.
                Consent and opt-out records may be kept as necessary to honor messaging preferences,
                demonstrate compliance, prevent abuse, and meet legal obligations. You can update account
                information, delete drafts, or email us to request access, correction, or deletion. We may
                retain limited records where required for security, legal obligations, or backup integrity.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                For privacy questions or requests, email the WhisperWrap team at
                <a href="mailto:support@whisperwrapapp.org">support&#64;whisperwrapapp.org</a>.
              </p>
            </section>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class PrivacyPolicyPage {}
