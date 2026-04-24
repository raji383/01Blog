import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import type { UserProfileResponse } from '../../models/user';
import { UserService } from '../../Service/UserService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly http = inject(HttpClient);
  protected userProfile = signal<UserProfileResponse | null>(null);
  protected error = signal<string | null>(null);
  private userService = inject(UserService);
  ngOnInit() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;

    if (!token) {
      this.error.set('No authentication token found');
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    try {
      this.http.get<UserProfileResponse>('http://localhost:8080/api/users/me', { headers }).subscribe({
        next: (user) => {
          this.userProfile.set(user);
          this.userService.setUser(user);
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
