import { Component, inject, signal } from '@angular/core';
import { UserProfileResponse } from '../../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-rightbar',
  imports: [],
  templateUrl: './rightbar.html',
  styleUrl: './rightbar.css',
})
export class Rightbar {
  private readonly http = inject(HttpClient);
  protected userProfile = signal<UserProfileResponse | null>(null);
  protected error = signal<string | null>(null);

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
  protected logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
}
