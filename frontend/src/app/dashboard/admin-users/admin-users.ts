import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { UserAdminResponse } from '../../models/user';

@Component({
  selector: 'app-admin-users',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {
  private readonly http = inject(HttpClient);

  protected readonly users = signal<UserAdminResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  protected toggleBan(user: UserAdminResponse): void {
    const nextBanned = !user.banned;
    const action = nextBanned ? 'ban' : 'unban';

    if (!window.confirm(`Do you want to ${action} ${user.username}?`)) {
      return;
    }

    this.http.put<UserAdminResponse>(`/api/users/admin/${user.id}/ban`, {
      banned: nextBanned,
    }).subscribe({
      next: (updatedUser) => {
        this.users.update(users => users.map(current => current.id === updatedUser.id ? updatedUser : current));
      },
      error: (error) => {
        console.error(`Error trying to ${action} user:`, error);
        window.alert(`Failed to ${action} ${user.username}`);
      }
    });
  }

  protected deleteUser(user: UserAdminResponse): void {
    if (!window.confirm(`Delete ${user.username}? This action cannot be undone.`)) {
      return;
    }

    this.http.delete(`/api/users/admin/${user.id}`).subscribe({
      next: () => {
        this.users.update(users => users.filter(current => current.id !== user.id));
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        window.alert(`Failed to delete ${user.username}`);
      }
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.http.get<UserAdminResponse[]>('/api/users/admin').subscribe({
      next: (users) => {
        this.users.set(users ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching admin users:', error);
        this.users.set([]);
        this.loading.set(false);
      }
    });
  }
}
