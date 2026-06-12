import { NgFor, NgIf } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
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

            <ion-text class="error-text" *ngIf="navigationError">
              {{ navigationError }}
            </ion-text>
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

            <ion-text class="error-text" *ngIf="statusError">
              {{ statusError }}
            </ion-text>
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
  navigationError = '';
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
  ) {
    // 🔥 THIS FIXES YOUR "OPENING..." STUCK STATE
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating = false;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
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
          this.statusError = '';
          this.recentWhispers = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })) as WhisperRecord[];
        },
        error => {
          console.error(error);
          this.statusError = 'Could not load recent WhisperWrap statuses.';
        },
      );
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      this.navigationError = 'Could not load dashboard. Please refresh.';
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.profileSub?.unsubscribe();
    this.unsubscribeWhispers?.();
  }

  async navigateToCreateWhisper(event?: Event): Promise<void> {
    this.navigationError = '';
    this.focus.clearActiveElement();

    this.blurEventTarget(event);

    try {
      const ok = await this.router.navigateByUrl('/create-whisper');

      if (!ok) {
        this.navigationError = 'Could not open Create WhisperWrap.';
      }
    } catch (error) {
      console.error(error);
      this.navigationError = 'Navigation failed.';
    }
  }

  logout(): void {
    this.focus.clearActiveElement();

    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: error => {
        console.error(error);
        this.navigationError = 'Logout failed.';
      },
    });
  }

  private blurEventTarget(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    const currentTarget = event?.currentTarget as HTMLElement | null;

    target?.blur?.();
    currentTarget?.blur?.();
  }
}