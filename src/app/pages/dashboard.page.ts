import { NgClass, NgFor, NgIf,TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router} from '@angular/router';
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
import { UserProfile, WhisperRecord } from '../services/models';
import { FocusService } from '../services/focus.service';
@Component({
  standalone: true,
  imports: [
    NgClass,
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
    TitleCasePipe
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="page-shell dashboard-shell">
        <section class="hero-copy dashboard-hero">
          <p class="eyebrow">Dashboard</p>
          <h1>Welcome{{ profile?.displayName ? ', ' + profile?.displayName : '' }}.</h1>
          <p class="muted">
            Create, review, and track consent-first WhisperWrap messages from one calm workspace.
          </p>
        </section>

        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-grid">
              <div>
                <span class="summary-label">Subscription</span>
                <strong
                  class="summary-value"
                  [ngClass]="subscriptionStatus === 'active' ? 'status-active' : 'status-inactive'"
                >
                  {{ subscriptionStatus | titlecase }}
                </strong>
              </div>

              <div>
                <span class="summary-label">Recent wraps</span>
                <strong class="summary-value">{{ recentWhispers.length }}</strong>
              </div>
            </div>

            <!-- <ion-button
              expand="block"
              routerLink="/create-whisper"
              [disabled]="isLoading"
            >
              Create WhisperWrap
            </ion-button> -->
                <ion-button
                  expand="block"
                  type="button"
                  [disabled]="isLoading"
                  (click)="openCreateWhisper()"
                >
                  Create WhisperWrap
                </ion-button>
            <ion-button fill="clear" expand="block" (click)="logout()" [disabled]="isLoggingOut">
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </ion-button>

            <ion-text class="error-text" *ngIf="errorMessage">
              {{ errorMessage }}
            </ion-text>
          </ion-card-content>
        </ion-card>

        <ion-card class="form-card compact-card">
          <ion-card-content>
            <div class="section-heading">
              <div>
                <p class="eyebrow">Activity</p>
                <h2>Recent WhisperWraps</h2>
              </div>
            </div>

            <div class="empty-state" *ngIf="!isLoading && !recentWhispers.length">
              <strong>No WhisperWraps yet</strong>
              <p class="muted">
                Start with a recipient, tone, delivery format, and sender intent.
              </p>
            </div>

            <div class="empty-state" *ngIf="isLoading">
              <strong>Loading...</strong>
              <p class="muted">Preparing your dashboard.</p>
            </div>

            <div class="whisper-row" *ngFor="let whisper of recentWhispers">
              <div>
                <strong>{{ whisper.title || whisper.recipientName }}</strong>
                <p>{{ whisper.recipientName }} • {{ formatDelivery(whisper.deliveryFormat) }}</p>
              </div>

              <span class="status-pill">{{ formatStatus(whisper.status) }}</span>
            </div>
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

  isLoading = true;
  isLoggingOut = false;
  errorMessage = '';

  private profileSub?: Subscription;
  private unsubscribeWhispers?: () => void;

  constructor(
    private auth: AuthService,
    private db: Firestore,
    private router: Router,
    private focus: FocusService,

  ) {}

  async ngOnInit(): Promise<void> {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const user = await this.auth.waitForUser();

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
          console.error('[Dashboard profile]', error);
          this.errorMessage = 'Profile details could not be loaded.';
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
          this.recentWhispers = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as WhisperRecord[];

          this.isLoading = false;
        },
        error => {
          console.error('[Dashboard whispers]', error);
          this.errorMessage = 'Recent WhisperWraps could not be loaded.';
          this.isLoading = false;
        },
      );
    } catch (error) {
      console.error('[Dashboard init]', error);
      this.errorMessage = 'Failed to load dashboard.';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
    this.unsubscribeWhispers?.();
  }

  formatDelivery(format?: string): string {
    if (!format) return 'Not selected';
    return format.replace('_', ' + ');
  }

  formatStatus(status?: string): string {
    if (!status) return 'Draft';

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  openCreateWhisper(): void {
  this.errorMessage = '';
  this.focus.clearActiveElement();

  setTimeout(() => {
    void this.router.navigateByUrl('/create-whisper');
  }, 50);
}

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.errorMessage = '';

    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: error => {
        console.error('[Dashboard logout]', error);
        this.errorMessage = 'Logout failed.';
        this.isLoggingOut = false;
      },
    });
  }
}