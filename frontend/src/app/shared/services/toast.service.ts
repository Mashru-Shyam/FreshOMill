import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
  readonly type: ToastType;
  readonly visible: boolean;
}

const VISIBLE_MS = 2800;
const EXIT_MS = 200;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(text: string, type: ToastType = 'success'): void {
    const id = ++this.nextId;
    this.toasts.update((current) => [...current, { id, text, type, visible: false }]);

    setTimeout(() => {
      this.toasts.update((current) => current.map((t) => (t.id === id ? { ...t, visible: true } : t)));
    }, 0);

    setTimeout(() => {
      this.toasts.update((current) => current.map((t) => (t.id === id ? { ...t, visible: false } : t)));
      setTimeout(() => this.dismiss(id), EXIT_MS);
    }, VISIBLE_MS);
  }

  dismiss(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
