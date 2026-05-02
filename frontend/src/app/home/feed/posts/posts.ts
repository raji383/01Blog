import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { LikeResponse, PostResponse, ReportAdminRequest } from '../../../models/user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../Service/UserService';
import { Comments } from './comments/comments';
import { ShowOptions } from './show-options/show-options';
import { EditPost } from './edit-post/edit-post';
import { DialogService } from '../../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

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
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
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
    this.http.post<LikeResponse>(`/api/posts/${post.id}/like`, {}).subscribe({
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
        } else {
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

    this.http.put<PostResponse>(`/api/posts/${post.id}`, body).subscribe({
      next: (updatedPost) => {
        this.edited.emit(updatedPost);
        this.closeEditModal();
      },
      error: (err) => {
        if (err.status === 401 ) {
          this.router.navigate(['/login']);
          return;
        }

      }
    });
  }

  async deletePost(postId: number): Promise<void> {
    const confirmed = await this.dialogService.confirm('Delete this post?', {
      title: 'Delete post',
      confirmLabel: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      this.showOptions = false;
      return;
    }

    this.http.delete(`/api/posts/${postId}`).subscribe({
      next: () => {
        this.deleted.emit(postId);
        this.showOptions = false;
      },
      error: (err) => {
        if (err.status === 401 ) {
          this.router.navigate(['/login']);
          return;
        }

      }
    });
  }

  async reportPost(postId: number): Promise<void> {
    const post = this.post;
    const currentUser = this.userService.getUser()();

    if (!post || !currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.id === post.authorId) {
      this.toastService.show('You cannot report your own post', 'error');
      return;
    }

    const confirmed = await this.dialogService.confirm('Are you sure you want to report this post?', {
      title: 'Report post',
      confirmLabel: 'Continue'
    });

    if (!confirmed) {
      return;
    }

    const reason = await this.dialogService.prompt('Please provide a reason for reporting this post.', {
      title: 'Why are you reporting this post?',
      confirmLabel: 'Submit report',
      placeholder: 'Add a short explanation'
    });

    if (!reason) {
      this.toastService.show('Report reason is required', 'error');
      return;
    }

    const reportRequest: ReportAdminRequest = {
      type: 'post',
      reason,
      createdAt: new Date().toISOString()
    };

    this.http.post(`/api/reports/post/${postId}`, reportRequest).subscribe({
      next: () => {
        this.toastService.show('Post has been reported', 'success');
      },
      error: (err) => {
        if (err.status === 401 ) {
          this.router.navigate(['/login']);
          return;
        }

        this.toastService.show('Failed to report post', 'error');
      }
    });
  }
}
