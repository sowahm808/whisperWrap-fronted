import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { WhisperInput } from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonInput,
    IonItem,
    IonTextarea,
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Review WhisperWrap</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card" *ngIf="service.draft as draft; else noDraft">
          <ion-card-content>
            <p class="muted">Review and edit the AI draft before a consent email is sent.</p>

            <ion-item>
              <ion-input label="Title" labelPlacement="stacked" [(ngModel)]="draft.title" (ionBlur)="persistDraft()" />
            </ion-item>
            <ion-item>
              <ion-textarea label="Message" labelPlacement="stacked" rows="8" [(ngModel)]="draft.message" (ionBlur)="persistDraft()" />
            </ion-item>
            <ion-item>
              <ion-input label="Scripture reference" labelPlacement="stacked" [(ngModel)]="draft.scriptureReference" (ionBlur)="persistDraft()" />
            </ion-item>
            <ion-item>
              <ion-textarea label="Scripture text" labelPlacement="stacked" rows="4" [(ngModel)]="draft.scriptureText" (ionBlur)="persistDraft()" />
            </ion-item>
            <ion-item>
              <ion-textarea label="Short prayer" labelPlacement="stacked" rows="4" [(ngModel)]="draft.shortPrayer" (ionBlur)="persistDraft()" />
            </ion-item>

            <section class="upload-panel" *ngIf="draft.deliveryFormat !== 'text'">
              <label for="audio-upload">Optional audio recording</label>
              <input id="audio-upload" type="file" accept="audio/*" (change)="upload($event)" />
              <p class="muted" *ngIf="draft.audioUrl">Audio uploaded and attached.</p>
              <audio *ngIf="draft.audioUrl" controls [src]="draft.audioUrl"></audio>
            </section>

            <ion-text class="error-text" *ngIf="error">{{ error }}</ion-text>
            <ion-text class="success-text" *ngIf="notice">{{ notice }}</ion-text>

            <ion-button expand="block" fill="outline" (click)="regenerate()" [disabled]="isBusy">
              {{ isRegenerating ? 'Regenerating...' : 'Regenerate' }}
            </ion-button>
            <ion-button expand="block" (click)="send()" [disabled]="isBusy">
              {{ isSending ? 'Sending consent...' : 'Confirm & Send Consent' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ng-template #noDraft>
          <ion-card class="form-card">
            <ion-card-content>
              <p>No WhisperWrap draft is available.</p>
              <ion-button expand="block" routerLink="/create-whisper">Create WhisperWrap</ion-button>
            </ion-card-content>
          </ion-card>
        </ng-template>
      </main>
    </ion-content>
  `,
})
export class ReviewWhisperPage {
  error = '';
  notice = '';
  isRegenerating = false;
  isSending = false;

  constructor(
    public service: WhisperService,
    private auth: AuthService,
    private router: Router,
  ) {}

  get isBusy() {
    return this.isRegenerating || this.isSending;
  }

  persistDraft() {
    if (this.service.draft) this.service.setDraft(this.service.draft);
  }

  regenerate() {
    const draft = this.service.draft;
    if (!draft || this.isBusy) return;

    this.error = '';
    this.notice = '';
    this.isRegenerating = true;

    const payload: WhisperInput = {
      recipientName: draft.recipientName,
      recipientEmail: draft.recipientEmail,
      recipientPhone: draft.recipientPhone,
      whisperType: draft.whisperType,
      wrapStyle: draft.wrapStyle,
      deliveryFormat: draft.deliveryFormat,
      senderIntent: draft.senderIntent,
    };

    this.service.generate(payload).subscribe({
      next: generated => {
        this.service.setDraft({ ...draft, ...generated, status: 'generated' });
        this.notice = 'A fresh draft is ready for review.';
        this.isRegenerating = false;
      },
      error: e => {
        this.error = e.message;
        this.isRegenerating = false;
      },
    });
  }

  async upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const draft = this.service.draft;

    if (!file || !draft) return;

    this.error = '';
    this.notice = 'Uploading audio...';

    try {
      const user = await this.auth.waitForUser();
      if (!user) throw new Error('Please log in before uploading audio.');
      const audioUrl = await this.service.uploadAudio(file, user.uid);
      this.service.setDraft({ ...draft, audioUrl });
      this.notice = 'Audio uploaded successfully.';
    } catch (error) {
      this.notice = '';
      this.error = error instanceof Error ? error.message : 'Audio upload failed. Please try again.';
    }
  }

  async send() {
    const draft = this.service.draft;
    if (!draft || this.isBusy) {
      this.error = 'No draft available.';
      return;
    }

    if (!draft.title.trim() || !draft.message.trim() || !draft.scriptureReference.trim() || !draft.scriptureText.trim()) {
      this.error = 'Title, message, scripture reference, and scripture text are required.';
      return;
    }

    this.error = '';
    this.notice = '';
    this.isSending = true;

    try {
      const user = await this.auth.waitForUser();
      const senderName = draft.senderName || user?.displayName || user?.email || 'Sender';
      const whisperId = await this.service.saveDraftToFirestore({ ...draft, senderName, status: 'generated' });
      const sendPayload = { ...draft, id: whisperId, senderName };

      this.service.sendConsent(sendPayload).subscribe({
        next: response => {
          this.service.setDraft({
            ...sendPayload,
            status: response.status ?? 'consent_sent',
            id: response.whisperId ?? sendPayload.id,
            unwrapToken: response.token,
            unwrapLink: response.unwrapLink,
          });
          this.router.navigateByUrl('/whisper-sent');
        },
        error: e => {
          this.error = e.message;
          this.isSending = false;
        },
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not prepare the WhisperWrap for sending.';
      this.isSending = false;
    }
  }
}
