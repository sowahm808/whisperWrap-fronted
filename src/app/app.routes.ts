import { Routes } from '@angular/router';
import { authMatchGuard } from './guards/auth.guards';
// import { publicUnwrapGuard } from './guards/auth.guards';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
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
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import('./pages/dashboard.page').then(m => m.DashboardPage),
  },

  {
    path: 'create-whisper',
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import('./pages/create-whisper.page').then(m => m.CreateWhisperPage),
  },

  {
    path: 'review-whisper',
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import('./pages/review-whisper.page').then(m => m.ReviewWhisperPage),
  },

  {
    path: 'whisper-sent',
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import('./pages/whisper-sent.page').then(m => m.WhisperSentPage),
  },

  {
    path: 'unwrap/:token',
    canActivate: [authMatchGuard],
    loadComponent: () =>
      import('./pages/unwrap-whisper.page').then(m => m.UnwrapWhisperPage),
  },
];