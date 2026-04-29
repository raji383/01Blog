import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { LikeResponse, PostResponse, ReportAdminRequest } from '../../../models/user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../Service/UserService';
import { Comments } from './comments/comments';
import { ShowOptions } from './show-options/show-options';
import { EditPost } from './edit-post/edit-post';

@Component({
  selector: 'app-posts',
  imports: [Comments, CommonModule, ShowOptions, EditPost],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts {
  @Input() post: PostResponse | undefined;
  @Output() liked = new EventEmitter<{ postId: number, liked: boolean }>();
  @Output() edited = new EventEmitter<PostResponse>();
  @Output() deleted = new EventEmitter<number>();
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private userService = inject(UserService);
  seemore: boolean = false;
  showOptions: boolean = false;
  editingPost: PostResponse | null = null;
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
    this.http.post<LikeResponse>(`http://localhost:8080/api/posts/${post.id}/like`, {}).subscribe({
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
  showOptionsMenu() {
    this.showOptions = !this.showOptions;
  }

  closeOptionsMenu() {
    this.showOptions = false;
  }

  openEditModal(post: PostResponse): void {
    this.editingPost = post;
    this.showOptions = false;
  }

  closeEditModal(): void {
    this.editingPost = null;
  }

  isVideoMedia(mediaUrl: string | null | undefined): boolean {
    if (!mediaUrl) {
      return false;
    }

    const normalizedUrl = mediaUrl.toLowerCase().split('?')[0];
    return normalizedUrl.endsWith('.mp4')
      || normalizedUrl.endsWith('.webm')
      || normalizedUrl.endsWith('.mov');
  }

  editPost(post: PostResponse): void {
    this.openEditModal(post);
  }

  saveEditedPost(post: PostResponse, changes: { title: string; content: string; mediaUrl: string; mediaFile: File | null }): void {
    if (!this.userService.getUser()()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!changes.title.trim() || !changes.content.trim()) {
      return;
    }

    const body = new FormData();
    body.append('title', changes.title.trim());
    body.append('content', changes.content.trim());
    body.append('mediaUrl', changes.mediaFile ? '' : changes.mediaUrl.trim());

    if (changes.mediaFile) {
      body.append('mediaFile', changes.mediaFile);
    }

    this.http.put<PostResponse>(`http://localhost:8080/api/posts/${post.id}`, body).subscribe({
      next: (updatedPost) => {
        this.edited.emit(updatedPost);
        this.closeEditModal();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
          return;
        }

        console.error('Error editing post:', err);
      }
    });
  }

  deletePost(postId: number): void {
    if (!window.confirm('Delete this post?')) {
      this.showOptions = false;
      return;
    }

    this.http.delete(`http://localhost:8080/api/posts/${postId}`).subscribe({
      next: () => {
        this.deleted.emit(postId);
        this.showOptions = false;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
          return;
        }

        console.error('Error deleting post:', err);
      }
    });
  }

  reportPost(postId: number): void {
    const post = this.post;
    const currentUser = this.userService.getUser()();

    if (!post || !currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.id === post.authorId) {
      window.alert('You cannot report your own post');
      return;
    }

    if (!window.confirm('Are you sure you want to report this post?')) {
      return;
    }

    const reason = window.prompt('Please provide a reason for reporting this post:')?.trim();
    if (!reason) {
      window.alert('Report reason is required');
      return;
    }

    const reportRequest: ReportAdminRequest = {
      type: 'post',
      reason,
      createdAt: new Date().toISOString()
    };

    this.http.post(`http://localhost:8080/api/reports/post/${postId}`, reportRequest).subscribe({
      next: () => {
        window.alert('Post has been reported');
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
          return;
        }

        console.error('Error reporting post:', err);
        window.alert('Failed to report post');
      }
    });
  }
}
