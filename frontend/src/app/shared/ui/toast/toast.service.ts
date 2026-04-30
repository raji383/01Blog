import { Injectable, signal } from '@angular/core';

type ToastTone = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);
  private nextId = 1;

  show(message: string, tone: ToastTone = 'info'): void {
    const id = this.nextId++;
    this.toasts.update((items) => [...items, { id, message, tone }]);

    setTimeout(() => {
      this.dismiss(id);
    }, 3200);
  }

  dismiss(id: number): void {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }
}
