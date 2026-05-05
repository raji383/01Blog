import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Posts } from './posts/posts';
import type { PostResponse } from '../../models/user';
import { Addpost } from './addpost/addpost';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [Posts, Addpost, CommonModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  private readonly http = inject(HttpClient);
  protected posts = signal<PostResponse[]>([]);
  page = 1;
  limit = 10;
  loading = false;
  total = 0;
  private readonly router = inject(Router);
  nextPage() {
    if (this.page * this.limit >= this.total) {
      return
    }
    this.page++;
    this.fetchPosts();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchPosts();
    }
  }
  fetchPosts() {
    this.loading = true;

    try {
      this.http.get<any>(`/api/posts/feed?page=${this.page}&limit=${this.limit}`).subscribe({
        next: (res) => {
          if (res) {
            this.posts.set(res.posts);
            this.loading = false;
            this.total = res.total;
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);

          } else {
          }
        }
      });
    } catch (error) {
    }
  }
  ngOnInit() {
    this.fetchPosts();
  }
  protected addPost(res: PostResponse) {
    this.posts.update(posts => [res, ...posts]);
  }
  onLiked(event: { postId: number; liked: boolean }) {
    this.posts.update(posts =>
      posts.map(p =>
        p.id === event.postId
          ? {
            ...p,
            likeCount: Math.max(
              0,
              p.likeCount + (event.liked ? 1 : -1)
            )
          }
          : p
      )
    );
  }

  onEdited(updatedPost: PostResponse) {
    this.posts.update(posts =>
      posts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  }

  onDeleted(postId: number) {
    this.posts.update(posts => posts.filter(post => post.id !== postId));
  }

}
