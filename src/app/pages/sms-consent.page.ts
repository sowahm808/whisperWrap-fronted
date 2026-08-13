import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [RouterLink, IonBackButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/login" text="Back" /></ion-buttons><ion-title>SMS Consent</ion-title></ion-toolbar></ion-header>
    <ion-content><main class="page-shell legal-shell">
      <section class="hero-copy"><p class="eyebrow">WhisperWrap SMS program</p><h1>How WhisperWrap SMS consent works</h1>
        <p class="muted">WhisperWrap provides transactional notifications for private, person-to-person Whispers.</p></section>
      <ion-card class="form-card legal-card"><ion-card-content>
        <section><h2>Recipient-controlled consent</h2><ol>
          <li>A sender creates a private Whisper.</li><li>WhisperWrap creates a secure consent link.</li>
          <li>The recipient opens the consent page.</li><li>The recipient voluntarily enters or confirms their mobile number.</li>
          <li>The recipient checks an unchecked SMS consent checkbox.</li><li>WhisperWrap records consent.</li>
          <li>Only after consent is recorded may WhisperWrap send the private Whisper notification by SMS.</li>
          <li>The recipient may reply STOP at any time to opt out or HELP for assistance.</li>
        </ol></section>
        <section><h2>Program details</h2><p>Message frequency varies. Message and data rates may apply. For help, reply HELP or email <a href="mailto:support@whisperwrapapp.org">support&#64;whisperwrapapp.org</a>. Reply STOP to opt out.</p>
          <p class="legal-inline-links"><a routerLink="/privacy">Privacy Policy</a><a routerLink="/terms">Terms &amp; Conditions</a></p></section>
      </ion-card-content></ion-card>
    </main></ion-content>`,
})
export class SmsConsentPage {}
