import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FocusService } from '../services/focus.service';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [NgIf, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Whisper Sent</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <section class="hero-copy">
          <p class="eyebrow">Step 3 of 3</p>
          <h1>Whisper sent.</h1>
          <p class="muted">The recipient receives a secure consent link before any message content is revealed.</p>
        </section>

        <ol class="progress-steps" aria-label="WhisperWrap progress">
          <li>Create</li>
          <li>Review</li>
          <li class="active">Sent</li>
        </ol>

        <ion-card class="form-card success-card">
          <ion-card-content>
            <h2>Consent email sent.</h2>
            <p>The recipient can accept the secure unwrap link before reading or listening.</p>
            <p *ngIf="service.draft?.unwrapLink" class="muted">Unwrap link: {{ service.draft?.unwrapLink }}</p>
            <ion-button expand="block" (click)="navigateToDashboard()">Back to Dashboard</ion-button>
            <ion-button expand="block" fill="clear" (click)="navigateToCreateWhisper()">Create Another</ion-button>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class WhisperSentPage {
  constructor(
    public service: WhisperService,
    private router: Router,
    private focus: FocusService,
  ) {}

  navigateToDashboard() {
    this.focus.clearActiveElement();
    this.router.navigateByUrl('/dashboard');
  }

  navigateToCreateWhisper() {
    this.focus.clearActiveElement();
    this.router.navigateByUrl('/create-whisper');
  }
}
