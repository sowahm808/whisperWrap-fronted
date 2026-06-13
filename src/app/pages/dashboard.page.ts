import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
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
          <h1>
            Welcome{{ profile?.displayName ? ', ' + profile?.displayName : '' }}
          </h1>
        </section>

        <ion-card>
          <ion-card-content>

            <p><strong>Subscription:</strong> {{ subscriptionStatus }}</p>

            <ion-button
              expand="block"
              (click)="navigateToCreateWhisper()"
              [disabled]="isNavigating"
            >
              {{ isNavigating ? 'Opening...' : 'Create WhisperWrap' }}
            </ion-button>

            <ion-button
              fill="clear"
              expand="block"
              (click)="logout()"
            >
              Logout
            </ion-button>

            <ion-text *ngIf="navigationError" color="danger">
              {{ navigationError }}
            </ion-text>

          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-content>

            <h2>Recent WhisperWraps</h2>

            <p *ngIf="!recentWhispers.length">No WhisperWraps yet.</p>

            <div *ngFor="let whisper of recentWhispers">
              <strong>{{ whisper.title || whisper.recipientName }}</strong>
              <p>{{ whisper.recipientName }} • {{ whisper.deliveryFormat }}</p>
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

  navigationError = '';
  isNavigating = false;

  private profileSub?: Subscription;
  private unsubscribeWhispers?: () => void;
  private routerSub?: Subscription;

  constructor(
    private auth: AuthService,
    private db: Firestore,
    private router: Router,
    private focus: FocusService,
  ) {
    /**
     * 🔥 FIX: prevent stuck "Opening..." state
     */
    this.routerSub = this.router.events.subscribe(event => {
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
      /**
       * ✅ FIX: use your actual AuthService API
       */
      const user = await this.auth.waitForUser();

      if (!user) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      /**
       * PROFILE STREAM
       */
      this.profileSub = this.auth.userProfile$(user.uid).subscribe(profile => {
        this.profile = profile;
        this.subscriptionStatus = profile?.subscriptionStatus ?? 'inactive';
      });

      /**
       * FIRESTORE STREAM
       */
      const q = query(
        collection(this.db, 'whispers'),
        where('senderId', '==', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(10),
      );

      this.unsubscribeWhispers = onSnapshot(q, snapshot => {
        this.recentWhispers = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as WhisperRecord[];
      });

    } catch (err) {
      console.error(err);
      this.navigationError = 'Failed to load dashboard.';
    }
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
    this.unsubscribeWhispers?.();
    this.routerSub?.unsubscribe();
  }

  async navigateToCreateWhisper(): Promise<void> {
    this.navigationError = '';
    this.focus.clearActiveElement();

    try {
      await this.router.navigateByUrl('/create-whisper');
    } catch (err) {
      console.error(err);
      this.navigationError = 'Navigation failed.';
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.navigationError = 'Logout failed.';
      },
    });
  }
}