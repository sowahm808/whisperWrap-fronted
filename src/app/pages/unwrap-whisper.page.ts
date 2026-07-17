import { NgClass, NgIf } from '@angular/common';
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
    NgClass,
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
        <ion-title>Unwrap Your Whisper</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <ion-card class="form-card">
          <ion-card-content>
            <ng-container *ngIf="!isLoading; else loading">
              <ng-container *ngIf="data; else unavailable">

                <section
                  *ngIf="showUnwrapAnimation"
                  class="unwrap-stage"
                  [ngClass]="wrapThemeClass"
                >
                  <div class="gift">
                    <div class="glow"></div>
                    <div class="sparkles">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                    <div class="lid"></div>
                    <div class="bow"></div>
                    <div class="box"></div>
                  </div>

                  <h1>Opening your Whisper...</h1>
                  <p>A private message is being unwrapped for you.</p>
                </section>

                <section *ngIf="!accepted && !showUnwrapAnimation" class="consent-panel">
                  <p class="eyebrow">Consent required</p>
                  <h1>You have a confidential Whisper.</h1>
                  <p>{{ data.senderName || 'Someone' }} has sent you a Whisper.</p>
                  <p>Would you like to unwrap it now?</p>

                  <ion-button expand="block" (click)="accept()" [disabled]="isAccepting">
                    {{ isAccepting ? 'Opening...' : 'Accept and View' }}
                  </ion-button>
                </section>

                <section *ngIf="accepted && !showUnwrapAnimation" class="message-panel">
                  <p class="eyebrow">Unwrap your whisper</p>
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
              <p>Loading your secure Whisper...</p>
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
      --wrap-primary: #7c3aed;
      --wrap-secondary: #c026d3;
      --wrap-accent: #9333ea;
      --wrap-ribbon: #fbbf24;
      --wrap-sparkle: gold;
      --wrap-glow: rgba(251, 191, 36, 0.8);
      --wrap-shadow: rgba(124, 58, 237, 0.35);
    }

    .wrap-prophetic .gift { --wrap-primary: #312e81; --wrap-secondary: #7e22ce; --wrap-accent: #facc15; --wrap-ribbon: #facc15; --wrap-sparkle: #fde68a; --wrap-glow: rgba(250, 204, 21, 0.82); --wrap-shadow: rgba(49, 46, 129, 0.42); }
    .wrap-elegant .gift { --wrap-primary: #111827; --wrap-secondary: #57534e; --wrap-accent: #eab308; --wrap-ribbon: #f8fafc; --wrap-sparkle: #f5f5f4; --wrap-glow: rgba(234, 179, 8, 0.64); --wrap-shadow: rgba(17, 24, 39, 0.38); }
    .wrap-celebration .gift { --wrap-primary: #f97316; --wrap-secondary: #ec4899; --wrap-accent: #fde047; --wrap-ribbon: #22d3ee; --wrap-sparkle: #fef08a; --wrap-glow: rgba(236, 72, 153, 0.62); --wrap-shadow: rgba(249, 115, 22, 0.35); }
    .wrap-healing .gift { --wrap-primary: #0f766e; --wrap-secondary: #22c55e; --wrap-accent: #99f6e4; --wrap-ribbon: #ccfbf1; --wrap-sparkle: #a7f3d0; --wrap-glow: rgba(45, 212, 191, 0.66); --wrap-shadow: rgba(20, 184, 166, 0.35); }
    .wrap-reconciliation .gift { --wrap-primary: #be123c; --wrap-secondary: #f97316; --wrap-accent: #fed7aa; --wrap-ribbon: #fde68a; --wrap-sparkle: #fed7aa; --wrap-glow: rgba(251, 146, 60, 0.68); --wrap-shadow: rgba(190, 18, 60, 0.32); }
    .wrap-gratitude .gift { --wrap-primary: #ca8a04; --wrap-secondary: #f59e0b; --wrap-accent: #fef3c7; --wrap-ribbon: #fff7ed; --wrap-sparkle: #fef3c7; --wrap-glow: rgba(245, 158, 11, 0.72); --wrap-shadow: rgba(202, 138, 4, 0.34); }
    .wrap-romantic .gift { --wrap-primary: #be185d; --wrap-secondary: #f43f5e; --wrap-accent: #fecdd3; --wrap-ribbon: #ffe4e6; --wrap-sparkle: #fecdd3; --wrap-glow: rgba(244, 63, 94, 0.64); --wrap-shadow: rgba(190, 24, 93, 0.34); }
    .wrap-encouragement .gift { --wrap-primary: #2563eb; --wrap-secondary: #38bdf8; --wrap-accent: #fde047; --wrap-ribbon: #fef08a; --wrap-sparkle: #bae6fd; --wrap-glow: rgba(56, 189, 248, 0.66); --wrap-shadow: rgba(37, 99, 235, 0.33); }
    .wrap-legacy .gift { --wrap-primary: #0f172a; --wrap-secondary: #1d4ed8; --wrap-accent: #d97706; --wrap-ribbon: #fcd34d; --wrap-sparkle: #fcd34d; --wrap-glow: rgba(217, 119, 6, 0.58); --wrap-shadow: rgba(15, 23, 42, 0.44); }

    .box {
      position: absolute;
      bottom: 0;
      left: 20px;
      width: 130px;
      height: 95px;
      background: linear-gradient(135deg, var(--wrap-primary), var(--wrap-secondary));
      border-radius: 12px;
      box-shadow: 0 18px 40px var(--wrap-shadow);
      z-index: 2;
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
      background: linear-gradient(135deg, var(--wrap-accent), var(--wrap-secondary));
      border-radius: 10px;
      transform-origin: bottom left;
      animation: openLid 2.6s ease-in-out forwards;
      z-index: 4;
    }

    .bow {
      position: absolute;
      top: 10px;
      left: 55px;
      width: 60px;
      height: 42px;
      z-index: 5;
      animation: bowPop 2.2s ease-in-out forwards;
    }

    .bow::before,
    .bow::after {
      content: '';
      position: absolute;
      width: 34px;
      height: 34px;
      background: var(--wrap-ribbon);
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
      background: radial-gradient(circle, var(--wrap-glow), transparent 65%);
      opacity: 0;
      animation: glowUp 3.5s ease-in-out forwards;
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

    .sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkles span {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--wrap-sparkle);
  border-radius: 50%;
  opacity: 0;
  animation: sparkle 3.5s infinite;
}

.sparkles span:nth-child(1) {
  left: 20%;
  bottom: 45%;
  animation-delay: .2s;
}

.sparkles span:nth-child(2) {
  left: 35%;
  bottom: 60%;
  animation-delay: .8s;
}

.sparkles span:nth-child(3) {
  left: 55%;
  bottom: 55%;
  animation-delay: 1.4s;
}

.sparkles span:nth-child(4) {
  left: 70%;
  bottom: 50%;
  animation-delay: 2s;
}

.sparkles span:nth-child(5) {
  left: 50%;
  bottom: 35%;
  animation-delay: 2.6s;
}

@keyframes sparkle {
  0% {
    opacity: 0;
    transform: translateY(0) scale(.3);
  }

  25% {
    opacity: 1;
    transform: translateY(-30px) scale(1);
  }

  50% {
    opacity: .8;
  }

  100% {
    opacity: 0;
    transform: translateY(-90px) scale(.2);
  }
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

  get wrapThemeClass(): string {
    return `wrap-${this.data?.wrapStyle ?? 'gentle'}`;
  }

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

        const alreadyAccepted =
          data.status === 'accepted' ||
          data.status === 'opened' ||
          data.status === 'listened';

        const animationKey = `whisperwrap:unwrap-animation:${this.token}`;
        const hasPlayedAnimation = sessionStorage.getItem(animationKey) === 'true';

        this.isLoading = false;

        if (alreadyAccepted && !hasPlayedAnimation) {
          this.accepted = false;
          this.showUnwrapAnimation = true;
          sessionStorage.setItem(animationKey, 'true');

          setTimeout(() => {
            this.showUnwrapAnimation = false;
            this.accepted = true;
          }, 3800);

          return;
        }

        this.accepted = alreadyAccepted;
      },
      error: e => {
        this.error = e.message;
        this.isLoading = false;
      },
    });
  }

  // accept() {
  //   if (this.isAccepting) return;

  //   this.error = '';
  //   this.isAccepting = true;

  //   this.service.acceptUnwrap(this.token).subscribe({
  //     next: data => {
  //       this.data = { ...(this.data ?? data), ...data };

  //       this.isAccepting = false;
  //       this.accepted = false;
  //       this.showUnwrapAnimation = true;

  //       const animationKey = `whisperwrap:unwrap-animation:${this.token}`;
  //       sessionStorage.setItem(animationKey, 'true');

  //       setTimeout(() => {
  //         this.showUnwrapAnimation = false;
  //         this.accepted = true;
  //       }, 1800);
  //     },
  //     error: e => {
  //       this.error = e.message;
  //       this.isAccepting = false;
  //       this.showUnwrapAnimation = false;
  //     },
  //   });
  // }
accept() {
  if (this.isAccepting || !this.data) return;

  this.error = '';
  this.isAccepting = true;

  const selectedWrapStyle = this.data.wrapStyle;

  this.service
    .acceptUnwrap(this.token, selectedWrapStyle)
    .subscribe({
      next: acceptedData => {
        this.data = {
          ...this.data,
          ...acceptedData,

          // Preserve the style selected during creation.
          wrapStyle:
            acceptedData.wrapStyle ??
            selectedWrapStyle ??
            'gentle',
        };

        this.isAccepting = false;
        this.accepted = false;
        this.showUnwrapAnimation = true;

        const animationKey =
          `whisperwrap:unwrap-animation:${this.token}`;

        sessionStorage.setItem(animationKey, 'true');

        setTimeout(() => {
          this.showUnwrapAnimation = false;
          this.accepted = true;
        }, 3800);
      },

      error: e => {
        this.error =
          e instanceof Error
            ? e.message
            : 'Unable to unwrap this WhisperWrap.';

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