import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, limit, onSnapshot, orderBy, query, where } from '@angular/fire/firestore';
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

            <ion-button expand="block" (click)="navigateToCreateWhisper()">
              Create WhisperWrap
            </ion-button>
            <ion-button fill="clear" expand="block" (click)="logout()">Logout</ion-button>
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
export class DashboardPage implements OnDestroy {
  profile: UserProfile | null = null;
  subscriptionStatus = 'inactive';
  recentWhispers: WhisperRecord[] = [];
  statusError = '';
  statuses = ['draft', 'generated', 'consent_sent', 'accepted', 'opened', 'listened', 'failed'];
  private profileSub?: Subscription;
  private unsubscribeWhispers?: () => void;

  constructor(
    private auth: AuthService,
    private db: Firestore,
    private router: Router,
    private focus: FocusService,
  ) {
    this.auth.waitForUser().then(user => {
      if (!user) return;

      this.profileSub = this.auth.userProfile$(user.uid).subscribe(profile => {
        this.profile = profile;
        this.subscriptionStatus = profile?.subscriptionStatus ?? 'inactive';
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
          this.recentWhispers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WhisperRecord);
        },
        () => {
          this.statusError = 'Could not load recent WhisperWrap statuses.';
        },
      );
    });
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
    this.unsubscribeWhispers?.();
  }

navigateToCreateWhisper() {
  this.focus.clearActiveElement();
  void this.router.navigateByUrl('/create-whisper', { replaceUrl: false });
}

logout() {
  this.focus.clearActiveElement();

  this.auth.logout().subscribe(() => {
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  });
}
}
