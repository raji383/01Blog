import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NotificationResponse } from '../../../models/user';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notificationbar',
  imports: [CommonModule,RouterLink],
  templateUrl: './notificationbar.html',
  styleUrl: './notificationbar.css',
})
export class Notificationbar {
  public notifications: NotificationResponse[] = [];
  protected readonly http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.http.get<NotificationResponse[]>('http://localhost:8080/api/notifications').subscribe({
      next: (response) => {
        
        this.notifications = response;
        console.log(this.notifications        );
          this.cdr.detectChanges();

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
