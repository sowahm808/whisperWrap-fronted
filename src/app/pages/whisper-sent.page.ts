import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FocusService } from '../services/focus.service';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [NgIf, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent],
  styles: [`
    .share-panel { background:#fff7ef; border:1px solid #ead9ca; border-radius:18px; margin:1rem 0; padding:1rem; }
    .share-panel h2 { margin-top:0; }
    .share-actions { display:flex; flex-wrap:wrap; gap:.5rem; }
    .share-actions ion-button { flex:1 1 12rem; }
  `],
  template: `
    <ion-header><ion-toolbar><ion-title>Consent Invitation Ready</ion-title></ion-toolbar></ion-header>
    <ion-content><main class="page-shell">
      <section class="hero-copy"><p class="eyebrow">Step 3 of 3</p><h1>Invitation ready.</h1>
        <p class="muted">No SMS is sent until the recipient personally records consent.</p></section>
      <ol class="progress-steps" aria-label="WhisperWrap progress"><li>Create</li><li>Review</li><li class="active">Invite</li></ol>
      <ion-card class="form-card success-card"><ion-card-content aria-live="polite">
        <section *ngIf="service.draft?.consentChannels?.email">
          <h2>Consent invitation sent by email.</h2>
          <p>The recipient must personally approve SMS before WhisperWrap can send a text message.</p>
        </section>
        <section class="share-panel" *ngIf="service.draft?.consentChannels?.manual && service.draft?.consentLink as link">
          <h2>Share consent link</h2>
          <p>A secure consent link has been generated. Share it with the recipient through a non-SMS channel.</p>
          <div class="share-actions">
            <ion-button type="button" (click)="copy(link)">Copy Link</ion-button>
            <ion-button *ngIf="canShare" type="button" fill="outline" (click)="share(link)">Share Link</ion-button>
          </div>
          <p class="success-text" *ngIf="copyNotice">Consent link copied.</p>
        </section>
        <p *ngIf="!service.draft?.consentChannels?.email && !service.draft?.consentChannels?.manual" class="muted">
          The secure invitation was created. Return to the dashboard to check its delivery status.
        </p>
        <ion-button expand="block" (click)="navigateToDashboard()">Back to Dashboard</ion-button>
        <ion-button expand="block" fill="clear" (click)="navigateToCreateWhisper()">Create Another</ion-button>
      </ion-card-content></ion-card>
    </main></ion-content>`,
})
export class WhisperSentPage {
  copyNotice = false;
  readonly canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  constructor(public service: WhisperService, private router: Router, private focus: FocusService) {}

  async copy(link: string): Promise<void> {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
    else {
      const input = document.createElement('textarea'); input.value = link; input.style.position = 'fixed'; input.style.opacity = '0';
      document.body.appendChild(input); input.select(); document.execCommand('copy'); input.remove();
    }
    this.copyNotice = true;
  }

  async share(link: string): Promise<void> {
    if (this.canShare) await navigator.share({ title: 'WhisperWrap consent invitation', url: link });
    else await this.copy(link);
  }

  navigateToDashboard(): void { this.focus.clearActiveElement(); void this.router.navigateByUrl('/dashboard'); }
  navigateToCreateWhisper(): void { this.focus.clearActiveElement(); void this.router.navigateByUrl('/create-whisper'); }
}
