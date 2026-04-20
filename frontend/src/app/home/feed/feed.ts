import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Posts } from './posts/posts';
import type { PostResponse } from '../../models/user';
import { Addpost } from './addpost/addpost';
import { Router } from '@angular/router';
import e from 'express';

@Component({
  selector: 'app-feed',
  imports: [Posts, Addpost, CommonModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  private readonly http = inject(HttpClient);
  protected posts = signal<PostResponse[]>([]);
  private readonly router = inject(Router);

  fetchPosts() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;

    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    try {
      this.http.get<PostResponse[]>('http://localhost:8080/api/posts/feed', { headers }).subscribe({
        next: (res) => {
          if (res) {
            this.posts.set(res);
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);

          } else if (err.status === 403) {
            this.router.navigate(['/login']);
          } else {
            console.error('Error fetching posts:', err);
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
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

}


