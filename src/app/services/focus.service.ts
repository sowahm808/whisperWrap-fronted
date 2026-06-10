import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusService {
  clearActiveElement() {
    const activeElement = document.activeElement as HTMLElement | null;

    activeElement?.blur?.();

    const shadowActiveElement = activeElement?.shadowRoot?.activeElement as HTMLElement | null;
    shadowActiveElement?.blur?.();

    if (document.body && typeof document.body.focus === 'function') {
      document.body.focus();
    }
  }
}