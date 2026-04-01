// Global type augmentations for Ink (terminal UI framework)
// This file is auto-included and provides JSX namespace declarations

import type { DOMElement } from './dom.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ink-box': Omit<DOMElement, 'nodeName' | 'childNodes'>;
      'ink-text': Omit<DOMElement, 'nodeName' | 'childNodes'>;
      'ink-root': Omit<DOMElement, 'nodeName' | 'childNodes'>;
      'ink-virtual-text': Omit<DOMElement, 'nodeName' | 'childNodes'>;
    }
  }
}

export {};
