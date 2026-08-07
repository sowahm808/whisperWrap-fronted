import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
    RouterLink,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login" text="Back" />
        </ion-buttons>
        <ion-title>SMS Consent</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell legal-shell">
        <section class="hero-copy">
          <p class="eyebrow">WhisperWrap SMS program</p>
          <h1>Consent comes before every Whisper.</h1>
          <p class="muted">
            WhisperWrap sends private, person-to-person invitations—not marketing or bulk messages. This
            public page explains exactly how senders and recipients consent to SMS.
          </p>
        </section>

        <ion-card class="form-card legal-card">
          <ion-card-content>
            <section>
              <h2>Sender call to action</h2>
              <p>
                On the Create Whisper page, a registered sender enters the recipient's phone number and must
                actively check an unchecked confirmation before continuing:
              </p>
              <div class="cta-example" aria-label="SMS sender confirmation shown on the Create Whisper page">
                <span class="checkbox-example" aria-hidden="true">☐</span>
                <div>
                  <strong>I confirm that:</strong>
                  <ul>
                    <li>I personally know this recipient.</li>
                    <li>I have permission to contact them.</li>
                    <li>They have agreed to receive my private Whisper invitation by SMS.</li>
                    <li>WhisperWrap will send a consent request before delivering my Whisper.</li>
                  </ul>
                  <p>
                    By checking this box and later clicking Confirm &amp; Send Consent, I authorize WhisperWrap
                    to send this SMS. Message frequency varies, but recipients receive one initial consent
                    request and no Whisper content unless they reply YES. Message and data rates may apply.
                    Reply STOP to cancel or HELP for assistance. Consent is not a condition of purchase.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2>Recipient choice</h2>
              <ol>
                <li>The recipient receives an SMS identifying WhisperWrap and asking for consent.</li>
                <li>The recipient replies YES to agree before any private Whisper is delivered.</li>
                <li>If the recipient does not reply YES, WhisperWrap does not send the Whisper content.</li>
                <li>The recipient may reply STOP at any time to cancel or HELP for assistance.</li>
              </ol>
            </section>

            <section>
              <h2>Program details</h2>
              <p>
                Message frequency varies. Message and data rates may apply. Carriers are not liable for
                delayed or undelivered messages. For help, reply HELP or email
                <a href="mailto:support@whisperwrapapp.org">support&#64;whisperwrapapp.org</a>.
              </p>
              <p class="legal-inline-links">
                <a routerLink="/terms">Terms &amp; Conditions</a>
                <a routerLink="/privacy">Privacy Policy</a>
              </p>
            </section>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class SmsConsentPage {}
