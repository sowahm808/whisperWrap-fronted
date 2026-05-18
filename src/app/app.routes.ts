import { Routes } from '@angular/router';
import { authGuard, publicUnwrapGuard, subscriberGuard } from './guards/auth.guards';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'signup', loadComponent: () => import('./pages/signup.page').then(m => m.SignupPage) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage) },
  { path: 'create-whisper', canActivate: [authGuard, subscriberGuard], loadComponent: () => import('./pages/create-whisper.page').then(m => m.CreateWhisperPage) },
  { path: 'review-whisper', canActivate: [authGuard, subscriberGuard], loadComponent: () => import('./pages/review-whisper.page').then(m => m.ReviewWhisperPage) },
  { path: 'whisper-sent', canActivate: [authGuard], loadComponent: () => import('./pages/whisper-sent.page').then(m => m.WhisperSentPage) },
  { path: 'unwrap/:token', canActivate: [publicUnwrapGuard], loadComponent: () => import('./pages/unwrap-whisper.page').then(m => m.UnwrapWhisperPage) }
];
