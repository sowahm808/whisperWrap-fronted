import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { WhisperRecord } from '../services/models';
import { WhisperService } from '../services/whisper.service';

@Component({
  standalone: true,
  imports: [
    NgIf,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonText,
  ],
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

                <section *ngIf="showUnwrapAnimation" class="unwrap-stage">
                  <div class="gift">
                    <div class="lid"></div>
                    <div class="bow"></div>
                    <div class="box"></div>
                    <div class="glow"></div>
                  </div>
                  <h1>Opening your WhisperWrap...</h1>
                  <p>A private message is being unwrapped for you.</p>
                </section>

                <section *ngIf="!accepted && !showUnwrapAnimation" class="consent-panel">
                  <p class="eyebrow">Consent required</p>
                  <h1>You have a private WhisperWrap.</h1>
                  <p>{{ data.senderName || 'Someone' }} has sent you a WhisperWrap through WhisperWrap.</p>
                  <p>Would you like to unwrap it now?</p>

                  <ion-button expand="block" (click)="accept()" [disabled]="isAccepting">
                    {{ isAccepting ? 'Opening...' : 'Accept and View' }}
                  </ion-button>
                </section>

                <section *ngIf="accepted && !showUnwrapAnimation" class="message-panel">
                  <p class="eyebrow">Unwrapped message</p>
                  <h1>{{ data.title }}</h1>

                  <p class="message-text">{{ data.message }}</p>

                  <div class="scripture-card">
                    <h2>{{ data.scriptureReference }}</h2>
                    <p>{{ data.scriptureText }}</p>
                  </div>

                  <h2>Prayer</h2>
                  <p>{{ data.shortPrayer }}</p>

                  <audio
                    *ngIf="data.audioUrl"
                    controls
                    [src]="data.audioUrl"
                    (play)="markListened()"
                  ></audio>

                  <ion-button expand="block" href="https://resurgencevibe.com">
                    Join Resurgence Vibe
                  </ion-button>
                </section>

              </ng-container>
            </ng-container>

            <ng-template #loading>
              <p>Loading your secure WhisperWrap...</p>
            </ng-template>

            <ng-template #unavailable>
              <ion-text color="danger">
                {{ error || 'This WhisperWrap is unavailable.' }}
              </ion-text>
            </ng-template>

            <ion-text class="error-text" *ngIf="error && data">
              {{ error }}
            </ion-text>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
  styles: [`
    .unwrap-stage {
      min-height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      animation: fadeIn 300ms ease-out;
    }

    .gift {
      position: relative;
      width: 170px;
      height: 170px;
      margin-bottom: 28px;
    }

    .box {
      position: absolute;
      bottom: 0;
      left: 20px;
      width: 130px;
      height: 95px;
      background: linear-gradient(135deg, #7c3aed, #c026d3);
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(124, 58, 237, 0.35);
    }

    .box::before {
      content: '';
      position: absolute;
      left: 55px;
      top: 0;
      width: 20px;
      height: 95px;
      background: rgba(255, 255, 255, 0.35);
    }

    .box::after {
      content: '';
      position: absolute;
      left: 0;
      top: 38px;
      width: 130px;
      height: 18px;
      background: rgba(255, 255, 255, 0.35);
    }

    .lid {
      position: absolute;
      top: 40px;
      left: 12px;
      width: 146px;
      height: 38px;
      background: linear-gradient(135deg, #9333ea, #db2777);
      border-radius: 10px;
      transform-origin: bottom left;
      animation: openLid 1.4s ease-in-out forwards;
      z-index: 3;
    }

    .bow {
      position: absolute;
      top: 10px;
      left: 55px;
      width: 60px;
      height: 42px;
      z-index: 4;
      animation: bowPop 1.2s ease-in-out forwards;
    }

    .bow::before,
    .bow::after {
      content: '';
      position: absolute;
      width: 34px;
      height: 34px;
      background: #fbbf24;
      border-radius: 50% 50% 50% 0;
    }

    .bow::before {
      left: 0;
      transform: rotate(-35deg);
    }

    .bow::after {
      right: 0;
      transform: rotate(125deg);
    }

    .glow {
      position: absolute;
      left: 35px;
      bottom: 45px;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent 65%);
      opacity: 0;
      animation: glowUp 1.8s ease-in-out forwards;
      z-index: 1;
    }

    .unwrap-stage h1 {
      margin: 0 0 8px;
      font-size: 1.5rem;
    }

    .unwrap-stage p {
      margin: 0;
      opacity: 0.75;
    }

    @keyframes openLid {
      0% {
        transform: rotate(0) translateY(0);
      }
      45% {
        transform: rotate(-12deg) translateY(-18px);
      }
      100% {
        transform: rotate(-28deg) translate(-22px, -70px);
      }
    }

    @keyframes bowPop {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.08) translateY(-65px) rotate(-10deg);
      }
    }

    @keyframes glowUp {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      55% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: scale(1.8) translateY(-35px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class UnwrapWhisperPage {
  data?: WhisperRecord;
  accepted = false;
  isLoading = true;
  isAccepting = false;
  showUnwrapAnimation = false;
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

        this.accepted =
          data.status === 'accepted' ||
          data.status === 'opened' ||
          data.status === 'listened';

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
        this.isAccepting = false;
        this.showUnwrapAnimation = true;

        setTimeout(() => {
          this.showUnwrapAnimation = false;
          this.accepted = true;
        }, 1800);
      },
      error: e => {
        this.error = e.message;
        this.isAccepting = false;
        this.showUnwrapAnimation = false;
      },
    });
  }

  markListened() {
    if (this.listenedTracked) return;

    this.listenedTracked = true;

    this.service.markListened(this.token).subscribe({
      error: () => (this.listenedTracked = false),
    });
  }
}