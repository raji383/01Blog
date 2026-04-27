import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import type { UserProfileResponse } from '../../models/user';
import { UserService } from '../../Service/UserService';
import { Router, RouterLink } from '@angular/router';
import { Notificationbar } from './notificationbar/notificationbar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Notificationbar,NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly http = inject(HttpClient);
  protected userProfile = signal<UserProfileResponse | null>(null);
  protected error = signal<string | null>(null);
  private readonly router = inject(Router);
  showNotifications = signal(false);

  private userService = inject(UserService);
  ngOnInit() {
    if (!this.hasToken()) {
      this.error.set('No authentication token found');
      return;
    }

    try {
      this.http.get<UserProfileResponse>('http://localhost:8080/api/users/me').subscribe({
        next: (user) => {
          this.userProfile.set(user);
          this.userService.setUser(user);
        },
        error: (err) => {
          this.error.set('Failed to load user profile');
          console.error('Error fetching user profile:', err);
          this.router.navigate(['/login']);

        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  showNotificationBar() {
    console.log("test");
    
    this.showNotifications.set(!this.showNotifications());
  }
  private hasToken(): boolean {
    return typeof window !== 'undefined'
      && !!(window.localStorage.getItem('auth_token') || window.localStorage.getItem('token'));
  }
  getnotificationCount(): number {
    if (!this.userProfile()) {
      return 0;
    }
    // Assuming userProfile has a property 'notificationCount'
    return this.userProfile()?.notificationCount || 0;
  }
  isUserAdmin(): boolean {
    
    return this.userProfile()?.role === 'ADMIN';
  }
}
