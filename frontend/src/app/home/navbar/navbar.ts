import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import type { UserProfileResponse } from '../../models/user';
import { UserService } from '../../Service/UserService';
import { Router, RouterLink } from '@angular/router';
import { Notificationbar } from './notificationbar/notificationbar';
import { NgIf } from '@angular/common';
import { NotificationsService } from '../../shared/data/notifications.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Notificationbar,NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly notificationsService = inject(NotificationsService);
  protected userProfile = inject(UserService).getUser();
  protected error = signal<string | null>(null);
  private readonly router = inject(Router);
  showNotifications = signal(false);
  @ViewChild('notificationShell') private notificationShell?: ElementRef<HTMLElement>;

  private userService = inject(UserService);
  ngOnInit() {
    if (!this.hasToken()) {
      this.router.navigate(['/login']);
      this.error.set('No authentication token found');
      return;
    }

    this.userService.loadCurrentUser();
    this.notificationsService.load(true);
  }
  showNotificationBar() {
    this.showNotifications.set(!this.showNotifications());

    if (this.showNotifications()) {
      this.notificationsService.load();
    }
  }
  private hasToken(): boolean {
    return !!this.userService.getToken();
  }
  getnotificationCount(): number {
    return this.notificationsService.hasLoaded()
      ? this.notificationsService.unreadCount()
      : (this.userProfile()?.notificationCount || 0);
  }
  isUserAdmin(): boolean {
    
    return this.userProfile()?.role === 'ADMIN';
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.showNotifications()) {
      return;
    }

    const shell = this.notificationShell?.nativeElement;
    if (!shell || shell.contains(event.target as Node)) {
      return;
    }

    this.showNotifications.set(false);
  }

  protected closeNotifications(): void {
    this.showNotifications.set(false);
  }
}
