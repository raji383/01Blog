import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminPostResponse } from '../../models/user';

@Component({
  selector: 'app-admin-posts',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.css',
})
export class AdminPosts {
  private readonly http = inject(HttpClient);

  protected readonly posts = signal<AdminPostResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  protected deletePost(post: AdminPostResponse): void {
    if (!window.confirm(`Delete "${post.title}" by ${post.authorUsername}?`)) {
      return;
    }

    this.http.delete(`http://localhost:8080/api/posts/admin/${post.id}`).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter(current => current.id !== post.id));
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        window.alert(`Failed to delete "${post.title}"`);
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
    this.http.get<AdminPostResponse[]>('http://localhost:8080/api/posts/admin').subscribe({
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
