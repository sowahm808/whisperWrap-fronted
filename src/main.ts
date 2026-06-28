import 'zone.js';
import { ErrorHandler } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

import { appRoutes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { authInterceptor } from './app/services/auth.interceptor';
import { AppErrorHandler } from './app/services/app-error-handler.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },

    provideIonicAngular(),

    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
    ),

    provideHttpClient(withInterceptors([authInterceptor])),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
  ],
}).catch((error: unknown) => {
  console.error('[WhisperWrap bootstrap]', error);
});