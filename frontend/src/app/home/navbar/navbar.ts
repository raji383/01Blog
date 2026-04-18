import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import type { UserProfileResponse } from '../../models/user';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly http = inject(HttpClient);
  protected userProfile = signal<UserProfileResponse | null>(null);
  protected error = signal<string | null>(null);

  ngOnInit() {
    try {
      this.http.get<UserProfileResponse>('http://localhost:8080/api/users/me').subscribe({
        next: (user) => {
          console.log('User profile loaded:', user);
          this.userProfile.set(user);
        },
        error: (err) => {
          this.error.set('Failed to load user profile');
          console.error('Error fetching user profile:', err);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
