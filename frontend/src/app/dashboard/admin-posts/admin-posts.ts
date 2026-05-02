import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminPostResponse } from '../../models/user';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-posts',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.css',
})
export class AdminPosts {
  private readonly http = inject(HttpClient);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly posts = signal<AdminPostResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  protected async deletePost(post: AdminPostResponse): Promise<void> {
    const confirmed = await this.dialogService.confirm(`Delete "${post.title}" by ${post.authorUsername}?`, {
      title: 'Delete post',
      confirmLabel: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.http.delete(`/api/posts/admin/${post.id}`).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter(current => current.id !== post.id));
      },
      error: (error) => {
        this.toastService.show(`Failed to delete "${post.title}"`, 'error');
      }
    });
  }

  protected async toggleVisibility(post: AdminPostResponse): Promise<void> {
    const nextHidden = !post.hidden;
    const actionLabel = nextHidden ? 'hide' : 'unhide';

    const confirmed = await this.dialogService.confirm(
      `${nextHidden ? 'Hide' : 'Unhide'} "${post.title}" by ${post.authorUsername}?`,
      {
        title: `${nextHidden ? 'Hide' : 'Unhide'} post`,
        confirmLabel: nextHidden ? 'Hide post' : 'Unhide post',
        tone: nextHidden ? 'danger' : 'default'
      }
    );

    if (!confirmed) {
      return;
    }

    this.http.put<AdminPostResponse>(`/api/posts/admin/${post.id}/visibility`, {
      hidden: nextHidden
    }).subscribe({
      next: (updatedPost) => {
        this.posts.update(posts =>
          posts.map(current => current.id === updatedPost.id ? updatedPost : current)
        );
        this.toastService.show(
          `Post ${nextHidden ? 'hidden' : 'visible again'}`,
          'success'
        );
      },
      error: (error) => {
        this.toastService.show(`Failed to ${actionLabel} "${post.title}"`, 'error');
      }
    });
  }

  protected shorten(content: string): string {
    if (!content) {
      return '';
    }

    return content.length > 160 ? `${content.slice(0, 157)}...` : content;
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.http.get<AdminPostResponse[]>('/api/posts/admin').subscribe({
      next: (posts) => {
        this.posts.set(posts ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        this.posts.set([]);
        this.loading.set(false);
      }
    });
  }
}
