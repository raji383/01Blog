import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../home/navbar/navbar';
import { PostResponse, UserProfileResponse } from '../models/user';
import { Posts } from '../home/feed/posts/posts';

@Component({
  selector: 'app-profile',
  imports: [NgIf, NgFor, RouterLink, Navbar, Posts],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(private route: ActivatedRoute) { }

  private readonly http = inject(HttpClient);
  protected user = signal<UserProfileResponse | null>(null);
  protected myposts = signal<PostResponse[]>([]);
  protected error = signal<string | null>(null);
  protected isLoading = signal(true);
  protected userInitial = computed(() => this.user()?.username?.charAt(0)?.toUpperCase() ?? '?');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('User id is missing');
      this.isLoading.set(false);
      return;
    }

    if (!this.getToken()) {
      this.error.set('No authentication token found');
      this.isLoading.set(false);
      return;
    }

    this.http.get<UserProfileResponse>(`http://localhost:8080/api/users/${id}`).subscribe({
      next: (user) => {
        this.user.set(user);
        this.fetchUserPosts(user.username);
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

  fetchUserPosts(username: string) {
    this.http.get<PostResponse[]>(`http://localhost:8080/api/posts/user/${username}`).subscribe({
      next: (posts) => {
        this.myposts.set(posts ?? []);
      },
      error: (err) => {
        console.error('Error fetching user posts:', err);
        this.myposts.set([]);
      }
    });
  }
  banUser() {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const nextBannedState = !currentUser.banned;
    const actionLabel = nextBannedState ? 'ban' : 'unban';

    if (!confirm(`Do you want to ${actionLabel} this user?`)) {
      return;
    }

    const requestBody = { banned: nextBannedState };

    this.http.put<UserProfileResponse>(
      `http://localhost:8080/api/users/admin/${currentUser.id}/ban`,
      requestBody
    ).subscribe({
      next: (updatedUser) => {
        this.user.update(user => user ? { ...user, banned: updatedUser.banned } : user);
        alert(`User has been ${nextBannedState ? 'banned' : 'unbanned'}`);
      },
      error: (err) => {
        console.error(`Error trying to ${actionLabel} user:`, err);
        alert(`Failed to ${actionLabel} user`);
      }
    });


  }
  deleteUser() {
    if (!this.user()) {
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    this.http.delete(`http://localhost:8080/api/users/admin/${this.user()?.id}`).subscribe({
      next: () => {
        alert('User has been deleted');
        window.location.href = '/';
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    });
  }
  myProfile(): boolean {
    const payload = this.getTokenPayload();

    if (!payload) {
      return false;
    }

    return payload.id === this.user()?.id;

  }
  isAdmin(): boolean {
    const payload = this.getTokenPayload();

    if (!payload) {
      return false;
    }
    return payload.role === "ADMIN";
  }
  subscribe() {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const request = currentUser.subscribed
      ? this.http.delete(`http://localhost:8080/api/users/${currentUser.id}/subscribe`)
      : this.http.post(`http://localhost:8080/api/users/${currentUser.id}/subscribe`, {});

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
        console.error('Error updating subscription:', err);
        alert(`Failed to ${currentUser.subscribed ? 'unsubscribe from' : 'subscribe to'} user`);
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
  reportUser() {
    if (!this.user()) {
      return;
    }

    if (!confirm('Are you sure you want to report this user?')) {
      return;
    }
    console.log("11111111", this.user()?.id);

    this.http.post(`http://localhost:8080/api/reports/user/${this.user()?.id}`, {}).subscribe({
      next: () => {
        alert('User has been reported');
      },
      error: (err) => {
        console.error('Error reporting user:', err);
        alert('Failed to report user');
      }
    });
  }
  private getToken(): string | null {
    return typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;
  }

  private getTokenPayload(): { id?: number; role?: string; sub?: string } | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }
}
