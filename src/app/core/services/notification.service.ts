import { computed, Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);

  notifications = computed(() => this._notifications());

  success(message: string, duration = 3000): void {
    this.add({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.add({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.add({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.add({ type: 'info', message, duration });
  }

  private add(notification: Omit<Notification, 'id'>): void {
    const id = Date.now() + Math.random();
    this._notifications.update((list) => [...list, { ...notification, id }]);
    setTimeout(() => this.dismiss(id), notification.duration);
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
