import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { FocusService } from '../services/focus.service';
import { WhisperInput } from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [
    NgIf,
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
        <section class="hero-copy">
          <p class="eyebrow">Step 2 of 3</p>
          <h1>Review every word.</h1>
          <p class="muted">
            Edit the draft, add audio if needed, then send consent by email or text.
          </p>
        </section>

        <ol class="progress-steps" aria-label="WhisperWrap progress">
          <li>Create</li>
          <li class="active">Review</li>
          <li>Send</li>
        </ol>

        <ion-card class="form-card" *ngIf="service.draft as draft; else noDraft">
          <ion-card-content>
            <p class="muted">Nothing is delivered until the recipient gives consent.</p>

            <ion-item>
              <ion-input
                label="Title"
                labelPlacement="stacked"
                [(ngModel)]="draft.title"
                (ionBlur)="persistDraft()"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-textarea
                label="Message"
                labelPlacement="stacked"
                rows="8"
                [(ngModel)]="draft.message"
                (ionBlur)="persistDraft()"
              ></ion-textarea>
            </ion-item>

            <ion-item>
              <ion-input
                label="Scripture reference"
                labelPlacement="stacked"
                [(ngModel)]="draft.scriptureReference"
                (ionBlur)="persistDraft()"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-textarea
                label="Scripture text"
                labelPlacement="stacked"
                rows="4"
                [(ngModel)]="draft.scriptureText"
                (ionBlur)="persistDraft()"
              ></ion-textarea>
            </ion-item>

            <ion-item>
              <ion-textarea
                label="Short prayer"
                labelPlacement="stacked"
                rows="4"
                [(ngModel)]="draft.shortPrayer"
                (ionBlur)="persistDraft()"
              ></ion-textarea>
            </ion-item>

            <section class="upload-panel" *ngIf="draft.deliveryFormat !== 'text'">
              <label for="audio-upload">Audio recording</label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                (change)="upload($event)"
              />

              <p class="muted">
                Audio delivery requires an uploaded audio file before consent can be sent.
              </p>

              <p class="muted" *ngIf="draft.audioUrl">
                Audio uploaded and attached.
              </p>

              <audio *ngIf="draft.audioUrl" controls [src]="draft.audioUrl"></audio>
            </section>

            <ion-text class="error-text" *ngIf="error">
              {{ error }}
            </ion-text>

            <ion-text class="success-text" *ngIf="notice">
              {{ notice }}
            </ion-text>

            <ion-button
              expand="block"
              fill="outline"
              type="button"
              (click)="regenerate()"
              [disabled]="isBusy"
            >
              {{ isRegenerating ? 'Regenerating...' : 'Regenerate' }}
            </ion-button>

            <ion-button
              expand="block"
              type="button"
              (click)="send()"
              [disabled]="isBusy"
            >
              {{ isSending ? 'Sending consent...' : 'Confirm & Send Consent' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ng-template #noDraft>
          <ion-card class="form-card">
            <ion-card-content>
              <p>No WhisperWrap draft is available.</p>

              <ion-button
                expand="block"
                type="button"
                (click)="navigateToCreateWhisper()"
              >
                Create WhisperWrap
              </ion-button>
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
    private focus: FocusService,
  ) {}

  get isBusy(): boolean {
    return this.isRegenerating || this.isSending;
  }

  navigateToCreateWhisper(): void {
    this.focus.clearActiveElement();
    void this.router.navigateByUrl('/create-whisper');
  }

  persistDraft(): void {
    const draft = this.service.draft;

    if (!draft) return;

    this.service.setDraft({
      ...draft,
      prompt: draft.prompt || draft.senderIntent,
      senderIntent: draft.senderIntent || draft.prompt,
    });
  }

  async regenerate(): Promise<void> {
    const draft = this.service.draft;

    if (!draft || this.isBusy) return;

    this.error = '';
    this.notice = '';
    this.isRegenerating = true;

    try {
      const user = await this.auth.waitForUser();

      if (!user) {
        throw new Error('Please log in before regenerating a WhisperWrap.');
      }

      const prompt = (draft.prompt || draft.senderIntent || '').trim();

      if (!prompt) {
        throw new Error('Prompt is missing. Please go back and create the WhisperWrap again.');
      }

      const payload: WhisperInput = {
        recipientName: draft.recipientName,
        recipientEmail: draft.recipientEmail,
        recipientPhone: draft.recipientPhone,
        whisperType: draft.whisperType,
        wrapStyle: draft.wrapStyle,
        deliveryFormat: draft.deliveryFormat,
        prompt,
        senderIntent: draft.senderIntent || prompt,
      };

      const generated = await firstValueFrom(this.service.generate(payload));

      if (!generated) {
        throw new Error('The AI did not return a fresh WhisperWrap draft.');
      }

      this.service.setDraft({
        ...draft,
        ...payload,
        ...generated,
        userId: user.uid,
        senderId: user.uid,
        senderName: draft.senderName || user.displayName || user.email || '',
        status: 'generated',
      });

      this.notice = 'A fresh draft is ready for review.';
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Regeneration failed.';
    } finally {
      this.isRegenerating = false;
    }
  }

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const draft = this.service.draft;

    if (!file || !draft) return;

    this.error = '';
    this.notice = 'Uploading audio...';

    try {
      const user = await this.auth.waitForUser();

      if (!user) {
        throw new Error('Please log in before uploading audio.');
      }

      const audioUrl = await this.service.uploadAudio(file, user.uid);

      this.service.setDraft({
        ...draft,
        userId: user.uid,
        senderId: user.uid,
        audioUrl,
      });

      this.notice = 'Audio uploaded successfully.';
    } catch (error) {
      this.notice = '';
      this.error =
        error instanceof Error
          ? error.message
          : 'Audio upload failed. Please try again.';
    } finally {
      input.value = '';
    }
  }

  async send(): Promise<void> {
    const draft = this.service.draft;

    if (!draft || this.isBusy) {
      this.error = 'No draft available.';
      return;
    }

    if (
      !draft.title?.trim() ||
      !draft.message?.trim() ||
      !draft.scriptureReference?.trim() ||
      !draft.scriptureText?.trim() ||
      !draft.shortPrayer?.trim()
    ) {
      this.error =
        'Title, message, scripture reference, scripture text, and short prayer are required.';
      return;
    }

    if (!draft.recipientEmail?.trim() && !draft.recipientPhone?.trim()) {
      this.error = 'Recipient email or phone is required before sending consent.';
      return;
    }

    if (draft.deliveryFormat !== 'text' && !draft.audioUrl) {
      this.error =
        'Audio delivery requires an uploaded audio file before consent can be sent.';
      return;
    }

    this.error = '';
    this.notice = '';
    this.isSending = true;

    try {
      const user = await this.auth.waitForUser();

      if (!user) {
        throw new Error('Please log in before sending consent.');
      }

      const prompt = (draft.prompt || draft.senderIntent || '').trim();
      const senderName = draft.senderName || user.displayName || user.email || 'Sender';

      const draftToSave = {
        ...draft,
        prompt,
        senderIntent: draft.senderIntent || prompt,
        userId: user.uid,
        senderId: user.uid,
        senderName,
        status: 'generated' as const,
      };

      const whisperId = await this.service.saveDraftToFirestore(draftToSave);

      const response = await firstValueFrom(this.service.sendConsent(whisperId));

      this.service.setDraft({
        ...draftToSave,
        id: whisperId,
        status: 'consent_sent',
        unwrapLink: response.unwrapLink,
      });

      this.focus.clearActiveElement();

      await this.router.navigateByUrl('/whisper-sent');
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Could not prepare the WhisperWrap for sending.';
    } finally {
      this.isSending = false;
    }
  }
}