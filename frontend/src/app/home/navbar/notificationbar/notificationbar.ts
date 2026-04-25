import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationResponse } from '../../../models/user';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notificationbar',
  imports: [CommonModule],
  templateUrl: './notificationbar.html',
  styleUrl: './notificationbar.css',
})
export class Notificationbar {
  protected notifications: NotificationResponse[] = [];
  protected readonly http = inject(HttpClient);
  ngOnInit() {
    this.http.get<NotificationResponse[]>('http://localhost:8080/api/notifications').subscribe({
      next: (response) => {
        console.log(response.length);
        
        this.notifications = response;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      }
    });

  }

  markAsRead(notification: NotificationResponse) {
    if (notification.read) {
      return;
    }

    this.http.put<NotificationResponse>(`http://localhost:8080/api/notifications/${notification.id}/read`, {}).subscribe({
      next: (updated) => {
        this.notifications = this.notifications.map(item =>
          item.id === updated.id ? updated : item
        );
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }
}
