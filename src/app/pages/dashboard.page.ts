import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
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
import { AuthService } from '../services/auth.service';
import { FocusService } from '../services/focus.service';
import { UserProfile, WhisperRecord } from '../services/models';

@Component({
  standalone: true,
  imports: [
    NgFor,
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
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell">
        <section class="hero-copy">
          <p class="eyebrow">MVP Flow</p>
          <h1>Welcome{{ profile?.displayName ? ', ' + profile?.displayName : '' }}.</h1>
          <p>Create a WhisperWrap, review every word, then send a consent email before the recipient can unwrap it.</p>
        </section>

        <ion-card class="form-card">
          <ion-card-content>
            <p><strong>Subscription:</strong> {{ subscriptionStatus }}</p>

            <ion-text *ngIf="subscriptionStatus !== 'active'" color="medium">
              You can draft a WhisperWrap now. Sending may still require account activation.
            </ion-text>

            <ion-button
              expand="block"
              type="button"
              [disabled]="isNavigating"
              (click)="navigateToCreateWhisper($event)"
            >
              {{ isNavigating ? 'Opening...' : 'Create WhisperWrap' }}
            </ion-button>

            <ion-button
              fill="clear"
              expand="block"
              type="button"
              [disabled]="isNavigating"
              (click)="logout()"
            >
              Logout
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card class="form-card compact-card">
          <ion-card-content>
            <h2>Recent WhisperWraps</h2>

            <p class="muted" *ngIf="!recentWhispers.length">No WhisperWraps sent yet.</p>

            <div class="whisper-row" *ngFor="let whisper of recentWhispers">
              <div>
                <strong>{{ whisper.title || whisper.recipientName }}</strong>
                <p class="muted">{{ whisper.recipientName }} • {{ whisper.deliveryFormat }}</p>
              </div>
              <span class="status-pill">{{ whisper.status }}</span>
            </div>

            <ion-text class="error-text" *ngIf="statusError">{{ statusError }}</ion-text>
          </ion-card-content>
        </ion-card>

        <ion-card class="form-card compact-card">
          <ion-card-content>
            <h2>Status tracking</h2>
            <p class="muted">The backend and Firestore collections track each message through these MVP statuses.</p>
            <ul class="status-list">
              <li *ngFor="let status of statuses">{{ status }}</li>
            </ul>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  `,
})
export class DashboardPage implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  subscriptionStatus = 'inactive';
  recentWhispers: WhisperRecord[] = [];
  statusError = '';
  isNavigating = false;

  statuses = ['draft', 'generated', 'consent_sent', 'accepted', 'opened', 'listened', 'failed'];

  private profileSub?: Subscription;
  private unsubscribeWhispers?: () => void;
  private destroyed = false;

  constructor(
    private auth: AuthService,
    private db: Firestore,
    private router: Router,
    private focus: FocusService,
    private zone: NgZone,
  ) {}

  async ngOnInit() {
    const user = await this.auth.waitForUser();

    if (this.destroyed) return;

    if (!user) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.profileSub = this.auth.userProfile$(user.uid).subscribe({
      next: profile => {
        this.profile = profile;
        this.subscriptionStatus = profile?.subscriptionStatus ?? 'inactive';
      },
      error: error => {
        console.error('User profile subscription failed:', error);
        this.subscriptionStatus = 'inactive';
      },
    });

    const whispersQuery = query(
      collection(this.db, 'whispers'),
      where('senderId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(10),
    );

    this.unsubscribeWhispers = onSnapshot(
      whispersQuery,
      snapshot => {
        this.zone.run(() => {
          this.statusError = '';
          this.recentWhispers = snapshot.docs.map(snapshotDoc => ({
            id: snapshotDoc.id,
            ...snapshotDoc.data(),
          }) as WhisperRecord);
        });
      },
      error => {
        this.zone.run(() => {
          console.error('Recent WhisperWrap query failed:', error);

          if (error?.code === 'failed-precondition') {
            this.statusError = 'Recent WhisperWraps need a Firestore index before they can load.';
            return;
          }

          this.statusError = 'Could not load recent WhisperWrap statuses.';
        });
      },
    );
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.profileSub?.unsubscribe();
    this.unsubscribeWhispers?.();
  }

  async navigateToCreateWhisper(event?: Event) {
    if (this.isNavigating) return;

    this.isNavigating = true;

    try {
      this.blurEventTarget(event);
      this.focus.clearActiveElement();

      await this.waitForFocusToClear();

      const navigated = await this.router.navigateByUrl('/create-whisper', {
        replaceUrl: false,
      });

      if (!navigated) {
        console.warn('Navigation to /create-whisper was cancelled.');
      }
    } catch (error) {
      console.error('Navigation to Create WhisperWrap failed:', error);
    } finally {
      this.isNavigating = false;
    }
  }

  logout() {
    if (this.isNavigating) return;

    this.isNavigating = true;
    this.focus.clearActiveElement();

    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: error => {
        console.error('Logout failed:', error);
        this.isNavigating = false;
      },
    });
  }

  private blurEventTarget(event?: Event) {
    const target = event?.target as HTMLElement | null;
    const currentTarget = event?.currentTarget as HTMLElement | null;

    target?.blur?.();
    currentTarget?.blur?.();
  }

  private waitForFocusToClear() {
    return new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }
}