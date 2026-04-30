import { Component, computed, inject, signal } from '@angular/core';
import { UserProfileResponse } from '../../models/user';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);
  protected userProfile = this.userService.getUser();
  protected profileError = signal<string | null>(null);
  protected suggestionsError = signal<string | null>(null);
  protected isLoadingUsers = signal(false);
  protected users = signal<UserProfileResponse[]>([]);
  protected hasSuggestions = computed(() => this.users().length > 0);

  ngOnInit() {
    this.userService.loadCurrentUser();
    this.profileError.set(this.userService.currentUserError());

    this.isLoadingUsers.set(true);
    this.http.get<UserProfileResponse[]>('/api/users').subscribe({
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
    this.userService.clearSession();
    this.router.navigate(['/login']);
  }
}
