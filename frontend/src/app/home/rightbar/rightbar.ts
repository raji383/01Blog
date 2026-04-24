import { Component, computed, inject, signal } from '@angular/core';
import { UserProfileResponse } from '../../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../Service/UserService';

@Component({
  selector: 'app-rightbar',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './rightbar.html',
  styleUrl: './rightbar.css',
})
export class Rightbar {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  protected userProfile = signal<UserProfileResponse | null>(null);
  protected profileError = signal<string | null>(null);
  protected suggestionsError = signal<string | null>(null);
  protected isLoadingUsers = signal(false);
  protected users = signal<UserProfileResponse[]>([]);
  protected hasSuggestions = computed(() => this.users().length > 0);

  ngOnInit() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;

    const cachedUser = this.userService.getUser()();
    if (cachedUser) {
      this.userProfile.set(cachedUser);
    }

    if (!token) {
      this.profileError.set('No authentication token found');
      this.suggestionsError.set('No authentication token found');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (!this.userProfile()) {
      this.http.get<UserProfileResponse>('http://localhost:8080/api/users/me', { headers }).subscribe({
        next: (user) => {
          this.userProfile.set(user);
          this.userService.setUser(user);
        },
        error: (err) => {
          this.profileError.set('Failed to load user profile');
          console.error('Error fetching user profile:', err);
        }
      });
    }

    this.isLoadingUsers.set(true);
    this.http.get<UserProfileResponse[]>('http://localhost:8080/api/users', { headers }).subscribe({
      next: (users) => {
        this.users.set(users);
        this.suggestionsError.set(null);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        this.suggestionsError.set('Failed to load people suggestions');
        this.isLoadingUsers.set(false);
        console.error('Error fetching users:', err);
      }
    });
  }

  protected logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
}
