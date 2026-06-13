import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (isDevMode()) {
      console.error('[WhisperWrap]', error);
    }
  }
}
