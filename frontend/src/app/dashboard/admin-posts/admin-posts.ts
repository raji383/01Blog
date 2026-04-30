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
        console.error('Error deleting post:', error);
        this.toastService.show(`Failed to delete "${post.title}"`, 'error');
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
        console.error('Error fetching admin posts:', error);
        this.posts.set([]);
        this.loading.set(false);
      }
    });
  }
}
