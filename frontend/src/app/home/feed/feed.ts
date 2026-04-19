import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private readonly router = inject(Router);


  ngOnInit() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;

    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    try {
      this.http.get<PostResponse[]>('http://localhost:8080/api/posts/feed', { headers }).subscribe({
        next: (res) => {
          if (res) {
            console.log(res);
            this.posts.set(res);
          }
        },
        error: (err) => {
          if (err.status === 401) {
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
  protected addPost(newPost: PostResponse) {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
      : null;
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    try {
      this.http.post<PostResponse>('http://localhost:8080/api/posts', newPost, { headers }).subscribe({
        next: (res) => {
          console.log(res);
          this.posts.update(posts => [newPost, ...posts]);
        }
      });
    } catch (error) {
      console.error('Error adding post:', error);
    }
  }
}


