import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { NotificationResponse } from '../../../models/user';
import { NotificationsService } from '../../../shared/data/notifications.service';

@Component({
  selector: 'app-notificationbar',
  imports: [CommonModule],
  templateUrl: './notificationbar.html',
  styleUrl: './notificationbar.css',
})
export class Notificationbar {
  @Output() closed = new EventEmitter<void>();
  protected readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.notificationsService.load();
  }

  protected markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  protected openNotification(notification: NotificationResponse): void {
    this.notificationsService.markAsRead(notification.id);

    if (notification.senderId) {
      this.router.navigate(['/profile', notification.senderId]);
    }

    this.closed.emit();
  }

  protected formatType(type: string): string {
    return type.toLowerCase().replace(/_/g, ' ');
  }

  protected getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  protected getInitial(notification: NotificationResponse): string {
    return (notification.senderUsername?.charAt(0) ?? 'S').toUpperCase();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closed.emit();
  }
}
