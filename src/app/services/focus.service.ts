import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusService {
  clearActiveElement() {
    const activeElement = document.activeElement as HTMLElement | null;

    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }

    const shadowActiveElement = activeElement?.shadowRoot?.activeElement as HTMLElement | null;

    if (shadowActiveElement && typeof shadowActiveElement.blur === 'function') {
      shadowActiveElement.blur();
    }

    document.body.focus();
  }
}