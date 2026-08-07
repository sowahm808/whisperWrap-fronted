import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guards';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.page').then(m => m.LoginPage),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup.page').then(m => m.SignupPage),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard.page').then(m => m.DashboardPage),
  },

  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy-policy.page').then(m => m.PrivacyPolicyPage),
  },

  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy.page').then(m => m.PrivacyPolicyPage),
  },

  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/terms-and-conditions.page').then(m => m.TermsAndConditionsPage),
  },

  {
    path: 'terms-and-conditions',
    loadComponent: () =>
      import('./pages/terms-and-conditions.page').then(m => m.TermsAndConditionsPage),
  },

  {
    path: 'sms-consent',
    loadComponent: () =>
      import('./pages/sms-consent.page').then(m => m.SmsConsentPage),
  },

  {
    path: 'help',
    loadComponent: () =>
      import('./pages/help.page').then(m => m.HelpPage),
  },

  {
    path: 'create-whisper',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/create-whisper.page').then(m => m.CreateWhisperPage),
  },

  {
    path: 'review-whisper',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/review-whisper.page').then(m => m.ReviewWhisperPage),
  },

  {
    path: 'whisper-sent',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/whisper-sent.page').then(m => m.WhisperSentPage),
  },

  {
    path: 'unwrap/:token',
    loadComponent: () =>
      import('./pages/unwrap-whisper.page').then(m => m.UnwrapWhisperPage),
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
