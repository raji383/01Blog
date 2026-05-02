import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { UserAdminResponse } from '../../models/user';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-users',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {
  private readonly http = inject(HttpClient);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly users = signal<UserAdminResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  protected async toggleBan(user: UserAdminResponse): Promise<void> {
    const nextBanned = !user.banned;
    const action = nextBanned ? 'ban' : 'unban';

    const confirmed = await this.dialogService.confirm(`Do you want to ${action} ${user.username}?`, {
      title: `${nextBanned ? 'Ban' : 'Unban'} user`,
      confirmLabel: nextBanned ? 'Ban user' : 'Unban user',
      tone: nextBanned ? 'danger' : 'default'
    });

    if (!confirmed) {
      return;
    }

    this.http.put<UserAdminResponse>(`/api/users/admin/${user.id}/ban`, {
      banned: nextBanned,
    }).subscribe({
      next: (updatedUser) => {
        this.users.update(users => users.map(current => current.id === updatedUser.id ? updatedUser : current));
      },
      error: (error) => {
        this.toastService.show(`Failed to ${action} ${user.username}`, 'error');
      }
    });
  }

  protected async deleteUser(user: UserAdminResponse): Promise<void> {
    const confirmed = await this.dialogService.confirm(`Delete ${user.username}? This action cannot be undone.`, {
      title: 'Delete user',
      confirmLabel: 'Delete user',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.http.delete(`/api/users/admin/${user.id}`).subscribe({
      next: () => {
        this.users.update(users => users.filter(current => current.id !== user.id));
      },
      error: (error) => {
        this.toastService.show(`Failed to delete ${user.username}`, 'error');
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
        this.users.set([]);
        this.loading.set(false);
      }
    });
  }
}
