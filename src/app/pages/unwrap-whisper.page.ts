import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { WhisperRecord } from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [NgIf, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonText],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Unwrap WhisperWrap</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card">
          <ion-card-content>
            <ng-container *ngIf="!isLoading; else loading">
              <ng-container *ngIf="data; else unavailable">
                <section *ngIf="!accepted" class="consent-panel">
                  <p>{{ data.senderName || 'Someone' }} has sent you a WhisperWrap through WhisperComp.</p>
                  <p>Would you like to unwrap it?</p>
                  <ion-button expand="block" (click)="accept()" [disabled]="isAccepting">
                    {{ isAccepting ? 'Opening...' : 'Accept and View' }}
                  </ion-button>
                </section>

                <section *ngIf="accepted" class="message-panel">
                  <h1>{{ data.title }}</h1>
                  <p class="message-text">{{ data.message }}</p>
                  <h2>{{ data.scriptureReference }}</h2>
                  <p>{{ data.scriptureText }}</p>
                  <h2>Prayer</h2>
                  <p>{{ data.shortPrayer }}</p>
                  <audio *ngIf="data.audioUrl" controls [src]="data.audioUrl" (play)="markListened()"></audio>
                  <ion-button expand="block" href="https://resurgencevibe.com">Join Resurgence Vibe</ion-button>
                </section>
              </ng-container>
            </ng-container>

            <ng-template #loading>
              <p>Loading your secure WhisperWrap...</p>
            </ng-template>

            <ng-template #unavailable>
              <ion-text color="danger">{{ error || 'This WhisperWrap is unavailable.' }}</ion-text>
            </ng-template>

            <ion-text class="error-text" *ngIf="error && data">{{ error }}</ion-text>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class UnwrapWhisperPage {
  data?: WhisperRecord;
  accepted = false;
  isLoading = true;
  isAccepting = false;
  error = '';
  token = this.route.snapshot.paramMap.get('token') || '';
  private listenedTracked = false;

  constructor(
    private route: ActivatedRoute,
    private service: WhisperService,
  ) {
    this.load();
  }

  load() {
    this.service.getUnwrap(this.token).subscribe({
      next: data => {
        this.data = data;
        this.accepted = data.status === 'accepted' || data.status === 'opened' || data.status === 'listened';
        this.isLoading = false;
      },
      error: e => {
        this.error = e.message;
        this.isLoading = false;
      },
    });
  }

  accept() {
    if (this.isAccepting) return;

    this.error = '';
    this.isAccepting = true;
    this.service.acceptUnwrap(this.token).subscribe({
      next: data => {
        this.data = { ...(this.data ?? data), ...data };
        this.accepted = true;
        this.isAccepting = false;
      },
      error: e => {
        this.error = e.message;
        this.isAccepting = false;
      },
    });
  }

  markListened() {
    if (this.listenedTracked) return;
    this.listenedTracked = true;
    this.service.markListened(this.token).subscribe({ error: () => (this.listenedTracked = false) });
  }
}
