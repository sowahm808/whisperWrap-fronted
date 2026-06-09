import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [NgIf, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>WhisperWrap Sent</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card">
          <ion-card-content>
            <h1>Consent email sent.</h1>
            <p>The recipient can accept the secure unwrap link before reading or listening.</p>
            <p *ngIf="service.draft?.unwrapLink" class="muted">Unwrap link: {{ service.draft?.unwrapLink }}</p>
            <ion-button expand="block" routerLink="/dashboard">Back to Dashboard</ion-button>
            <ion-button expand="block" fill="clear" routerLink="/create-whisper">Create Another</ion-button>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class WhisperSentPage {
  constructor(public service: WhisperService) {}
}
