import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusService {
  clearActiveElement() {
    const activeElement = this.getDeepActiveElement();

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    if (document.activeElement instanceof HTMLElement && document.activeElement !== activeElement) {
      document.activeElement.blur();
    }
  }

  private getDeepActiveElement(root: Document | ShadowRoot = document): Element | null {
    let activeElement = root.activeElement;

    while (activeElement?.shadowRoot?.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement;
  }
}
