import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../home/navbar/navbar';
import { UserProfileResponse } from '../models/user';

@Component({
  selector: 'app-profile',
  imports: [NgIf, RouterLink, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(private route: ActivatedRoute) {}

  private readonly http = inject(HttpClient);
  protected user = signal<UserProfileResponse | null>(null);
  protected error = signal<string | null>(null);
  protected isLoading = signal(true);
  protected userInitial = computed(() => this.user()?.username?.charAt(0)?.toUpperCase() ?? '?');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;

    if (!id) {
      this.error.set('User id is missing');
      this.isLoading.set(false);
      return;
    }

    if (!token) {
      this.error.set('No authentication token found');
      this.isLoading.set(false);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<UserProfileResponse>(`http://localhost:8080/api/users/${id}`, { headers }).subscribe({
      next: (user) => {
        this.user.set(user);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load user profile');
        this.isLoading.set(false);
        console.error('Error fetching user profile:', err);
      }
    });
  }
}
