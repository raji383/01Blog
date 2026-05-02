import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../home/navbar/navbar';
import { PostResponse, ReportAdminRequest, UserProfileResponse } from '../models/user';
import { Posts } from '../home/feed/posts/posts';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { ToastService } from '../shared/ui/toast/toast.service';
import { UserService } from '../Service/UserService';

@Component({
  selector: 'app-profile',
  imports: [NgIf, NgFor, RouterLink, Navbar, Posts],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(private route: ActivatedRoute) { }

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  protected user = signal<UserProfileResponse | null>(null);
  protected myposts = signal<PostResponse[]>([]);
  protected error = signal<string | null>(null);
  protected isLoading = signal(true);
  protected userInitial = computed(() => this.user()?.username?.charAt(0)?.toUpperCase() ?? '?');
  protected relationshipLabel = computed(() => {
    const profile = this.user();

    if (!profile) {
      return 'Profile';
    }

    if (this.myProfile()) {
      return 'This is you';
    }

    return profile.subscribed ? 'Following' : 'Not following';
  });
  protected statusLabel = computed(() => this.user()?.banned ? 'Restricted account' : 'Active member');
  protected canReport = computed(() => {
    const profile = this.user();
    return !!profile && !this.myProfile() && profile.role !== 'ADMIN';
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('User id is missing');
      this.isLoading.set(false);
      return;
    }

    if (!this.userService.getToken()) {
      this.error.set('No authentication token found');
      this.isLoading.set(false);
      return;
    }

    this.http.get<UserProfileResponse>(`/api/users/${id}`).subscribe({
      next: (user) => {
        this.user.set(user);
        this.fetchUserPosts(user.username);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load user profile');
        this.isLoading.set(false);
      }
    });

  }

  fetchUserPosts(username: string) {
    this.http.get<PostResponse[]>(`/api/posts/user/${username}`).subscribe({
      next: (posts) => {
        this.myposts.set(posts ?? []);
      },
      error: (err) => {
        this.myposts.set([]);
      }
    });
  }
  async banUser(): Promise<void> {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const nextBannedState = !currentUser.banned;
    const actionLabel = nextBannedState ? 'ban' : 'unban';

    const confirmed = await this.dialogService.confirm(`Do you want to ${actionLabel} this user?`, {
      title: `${nextBannedState ? 'Ban' : 'Unban'} user`,
      confirmLabel: nextBannedState ? 'Ban user' : 'Unban user',
      tone: nextBannedState ? 'danger' : 'default'
    });

    if (!confirmed) {
      return;
    }

    const requestBody = { banned: nextBannedState };

    this.http.put<UserProfileResponse>(
      `/api/users/admin/${currentUser.id}/ban`,
      requestBody
    ).subscribe({
      next: (updatedUser) => {
        this.user.update(user => user ? { ...user, banned: updatedUser.banned } : user);
        this.toastService.show(`User has been ${nextBannedState ? 'banned' : 'unbanned'}`, 'success');
      },
      error: (err) => {
        this.toastService.show(`Failed to ${actionLabel} user`, 'error');
      }
    });


  }
  async deleteUser(): Promise<void> {
    if (!this.user()) {
      return;
    }

    const confirmed = await this.dialogService.confirm('Are you sure you want to delete this user? This action cannot be undone.', {
      title: 'Delete user',
      confirmLabel: 'Delete user',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }
    this.http.delete(`/api/users/admin/${this.user()?.id}`).subscribe({
      next: () => {
        this.toastService.show('User has been deleted', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toastService.show('Failed to delete user', 'error');
      }
    });
  }
  myProfile(): boolean {
    return this.userService.getCurrentUserId() === this.user()?.id;
  }
  isAdmin(): boolean {
    return this.userService.getCurrentUserRole() === 'ADMIN';
  }
  subscribe() {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const request = currentUser.subscribed
      ? this.http.delete(`/api/users/${currentUser.id}/subscribe`)
      : this.http.post(`/api/users/${currentUser.id}/subscribe`, {});

    request.subscribe({
      next: () => {
        this.user.update(user => {
          if (!user) {
            return user;
          }

          const subscribed = !user.subscribed;
          return {
            ...user,
            subscribed,
            followerCount: Math.max(0, user.followerCount + (subscribed ? 1 : -1))
          };
        });
      },
      error: (err) => {
        this.toastService.show(`Failed to ${currentUser.subscribed ? 'unsubscribe from' : 'subscribe to'} user`, 'error');
      }
    });
  }

  canManageSubscription(): boolean {
    return !this.myProfile();
  }

  onLiked(event: { postId: number; liked: boolean }) {
    this.myposts.update(posts =>
      posts.map(post =>
        post.id === event.postId
          ? {
            ...post,
            likeCount: Math.max(0, post.likeCount + (event.liked ? 1 : -1))
          }
          : post
      )
    );
  }

  onEdited(updatedPost: PostResponse) {
    this.myposts.update(posts =>
      posts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  }

  onDeleted(postId: number) {
    this.myposts.update(posts => posts.filter(post => post.id !== postId));
  }
  async reportUser(): Promise<void> {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const confirmed = await this.dialogService.confirm('Are you sure you want to report this user?', {
      title: 'Report user',
      confirmLabel: 'Continue'
    });

    if (!confirmed) {
      return;
    }
    const reason = await this.dialogService.prompt('Please provide a reason for reporting this user.', {
      title: 'Why are you reporting this user?',
      confirmLabel: 'Submit report',
      placeholder: 'Add a short explanation'
    });

    if (!reason) {
      this.toastService.show('Report reason is required', 'error');
      return;
    }
    const reportRequest: ReportAdminRequest = {
      type: 'user',
      reason,
      createdAt: new Date().toISOString()
    };
    this.http.post(`/api/reports/user/${currentUser.id}`, reportRequest).subscribe({
      next: () => {
        this.toastService.show('User has been reported', 'success');
      },
      error: (err) => {
        this.toastService.show('Failed to report user', 'error');
      }
    });
  }
}
