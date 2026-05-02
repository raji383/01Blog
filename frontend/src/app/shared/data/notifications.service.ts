import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { NotificationResponse } from '../../models/user';
import { UserService } from '../../Service/UserService';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  readonly notifications = signal<NotificationResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasLoaded = signal(false);
  readonly unreadCount = computed(() =>
    this.notifications().reduce((count, notification) => count + (notification.read ? 0 : 1), 0)
  );

  load(force = false): void {
    if (this.isLoading() || (this.hasLoaded() && !force)) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<NotificationResponse[]>('/api/notifications').subscribe({
      next: (notifications) => {
        this.notifications.set(notifications ?? []);
        this.hasLoaded.set(true);
        this.isLoading.set(false);
        this.syncUserUnreadCount();
      },
      error: (err) => {
        this.error.set('Failed to load notifications');
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications().find((item) => item.id === notificationId);
    if (!notification || notification.read) {
      return;
    }

    this.http.put<NotificationResponse>(`/api/notifications/${notificationId}/read`, {}).subscribe({
      next: (updated) => {
        this.notifications.update((items) =>
          items.map((item) => item.id === updated.id ? updated : item)
        );
        this.syncUserUnreadCount();
      },
      error: (err) => {
        this.error.set('Failed to update notification');
      }
    });
  }

  markAllAsRead(): void {
    if (!this.unreadCount()) {
      return;
    }

    this.http.put('/api/notifications/read-all', {}).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((item) => item.read ? item : { ...item, read: true })
        );
        this.syncUserUnreadCount();
      },
      error: (err) => {
        this.error.set('Failed to mark all notifications as read');
      }
    });
  }

  private syncUserUnreadCount(): void {
    const unreadCount = this.unreadCount();
    this.userService.updateUser((user) => user ? { ...user, notificationCount: unreadCount } : user);
  }
}
