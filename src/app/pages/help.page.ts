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
        <ion-title>SMS Help & FAQ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell legal-shell">
        <section class="hero-copy">
          <p class="eyebrow">Help & FAQ</p>
          <h1>Consent comes first.</h1>
          <p class="muted">
            Learn how WhisperWrap asks for permission before delivering a private message by SMS.
          </p>
        </section>

        <ion-card class="form-card legal-card">
          <ion-card-content>
            <section>
              <h2>How does SMS work?</h2>
              <ol>
                <li>A sender creates a private Whisper and WhisperWrap creates a secure consent link.</li>
                <li>The recipient opens the link, enters their mobile number, and checks the unchecked consent box.</li>
                <li>Only after the backend records consent may WhisperWrap send the private Whisper notification by SMS.</li>
              </ol>
              <p>Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for assistance.</p>
            </section>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class HelpPage {}
