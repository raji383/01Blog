import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { LikeResponse, PostResponse } from '../../../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../Service/UserService';
import { Comments } from './comments/comments';

@Component({
  selector: 'app-posts',
  imports: [Comments,CommonModule],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts {
  @Input() post: PostResponse | undefined;
  @Output() liked = new EventEmitter<{ postId: number, liked: boolean }>();
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private userService = inject(UserService);
    seemore: boolean = false;
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  addLike(post: PostResponse): void {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;
    const user = this.userService.getUser()();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.post<LikeResponse>(`http://localhost:8080/api/posts/${post.id}/like`, user, { headers }).subscribe({
      next: (res) => {
        if (res) {
          /* if (res.liked) {
            post!.likeCount++;
          } else {
            post!.likeCount--;

          } */
          this.liked.emit({
            postId: post.id,
            liked: res.liked
          });

        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.router.navigate(['/login']);
        } else {
          console.error('Error liking post:', err);
        }
      }
    });
  }
  showComments() {
    this.seemore = !this.seemore;
  }
}
